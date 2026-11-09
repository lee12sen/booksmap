"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import type { LibraryBookResult } from "@/domain/library";

interface KakaoMapProps {
  results: LibraryBookResult[];
  selectedLibraryId?: string;
  onSelectLibrary: (libraryId: string) => void;
}

interface KakaoMapSdk {
  maps: {
    load: (callback: () => void) => void;
    Map: new (
      container: HTMLElement,
      options: { center: KakaoLatLng; level: number },
    ) => KakaoMapInstance;
    LatLng: new (latitude: number, longitude: number) => KakaoLatLng;
    Marker: new (options: {
      map: KakaoMapInstance;
      position: KakaoLatLng;
      title?: string;
    }) => KakaoMarker;
    event: {
      addListener: (
        target: KakaoMarker,
        type: string,
        handler: () => void,
      ) => void;
    };
    LatLngBounds: new () => KakaoBounds;
  };
}

interface KakaoMapInstance {
  setCenter: (position: KakaoLatLng) => void;
  setBounds: (bounds: KakaoBounds) => void;
}

type KakaoLatLng = {
  readonly latitude?: number;
  readonly longitude?: number;
};

interface KakaoMarker {
  setMap: (map: KakaoMapInstance | null) => void;
  setZIndex: (zIndex: number) => void;
}

interface KakaoBounds {
  extend: (position: KakaoLatLng) => void;
}

declare global {
  interface Window {
    kakao?: KakaoMapSdk;
  }
}

const BUSAN_CENTER = { latitude: 35.1796, longitude: 129.0756 };

export default function KakaoMap({
  results,
  selectedLibraryId,
  onSelectLibrary,
}: KakaoMapProps) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const markersRef = useRef<KakaoMarker[]>([]);
  const [isSdkReady, setIsSdkReady] = useState(false);
  const [mapError, setMapError] = useState<string>();
  const mapKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
  const mappableResults = results.filter(
    (result) =>
      Number.isFinite(result.latitude) && Number.isFinite(result.longitude),
  );

  function initializeMap() {
    const kakao = window.kakao;

    if (!kakao?.maps?.load || !mapElementRef.current) {
      setMapError(
        "카카오 지도 SDK를 불러오지 못했습니다. JavaScript 키와 Web 플랫폼 도메인을 확인해 주세요.",
      );
      return;
    }

    try {
      kakao.maps.load(() => {
        try {
          if (!mapElementRef.current) {
            setMapError("카카오 지도를 표시할 영역을 찾지 못했습니다.");
            return;
          }

          const center = new kakao.maps.LatLng(
            BUSAN_CENTER.latitude,
            BUSAN_CENTER.longitude,
          );
          mapRef.current = new kakao.maps.Map(mapElementRef.current, {
            center,
            level: 9,
          });
          setIsSdkReady(true);
        } catch {
          setMapError(
            "카카오 지도를 초기화하지 못했습니다. JavaScript 키와 Web 플랫폼 도메인을 확인해 주세요.",
          );
        }
      });
    } catch {
      setMapError(
        "카카오 지도 SDK를 초기화하지 못했습니다. JavaScript 키와 Web 플랫폼 도메인을 확인해 주세요.",
      );
    }
  }

  useEffect(() => {
    const kakao = window.kakao;
    const map = mapRef.current;

    if (!map || !kakao || mappableResults.length === 0) {
      return;
    }

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    const bounds = new kakao.maps.LatLngBounds();
    mappableResults.forEach((result) => {
      const position = new kakao.maps.LatLng(
        result.latitude!,
        result.longitude!,
      );
      const marker = new kakao.maps.Marker({
        map,
        position,
        title: result.libraryName,
      });

      kakao.maps.event.addListener(marker, "click", () => {
        onSelectLibrary(result.libraryId);
      });
      bounds.extend(position);
      markersRef.current.push(marker);
    });

    map.setBounds(bounds);
  }, [isSdkReady, mappableResults, onSelectLibrary]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    results.forEach((result, index) => {
      markersRef.current[index]?.setZIndex(
        result.libraryId === selectedLibraryId ? 1 : 0,
      );
    });
  }, [results, selectedLibraryId]);

  if (!mapKey) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-3xl bg-slate-100 p-8 text-center text-sm text-slate-600">
        카카오 지도 키가 설정되지 않았습니다. `.env.local`을 확인해 주세요.
      </div>
    );
  }

  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-3xl bg-[#dcebf0] shadow-sm ring-1 ring-slate-200">
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${mapKey}&autoload=false`}
        strategy="afterInteractive"
        onLoad={initializeMap}
        onError={() =>
          setMapError(
            "카카오 지도 SDK를 불러오지 못했습니다. JavaScript 키와 Web 플랫폼 도메인을 확인해 주세요.",
          )
        }
      />
      <div
        aria-label="부산 도서관 위치 지도"
        className="absolute inset-0"
        ref={mapElementRef}
      />
      <div className="absolute left-4 top-4 rounded-2xl bg-white/90 px-4 py-3 text-sm shadow-sm backdrop-blur">
        <p className="font-bold">카카오맵</p>
        <p className="mt-1 text-xs text-slate-500">
          {mappableResults.length}곳의 위치 표시
        </p>
      </div>
      {mapError && (
        <p
          aria-live="polite"
          className="absolute bottom-4 left-4 right-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700"
        >
          {mapError}
        </p>
      )}
      {!isSdkReady && !mapError && (
        <p className="absolute inset-0 flex items-center justify-center text-sm text-slate-600">
          지도를 불러오는 중입니다.
        </p>
      )}
      {isSdkReady && mappableResults.length === 0 && (
        <p className="absolute inset-x-8 top-1/2 text-center text-sm text-slate-600">
          좌표가 있는 도서관 결과가 표시되면 지도에 위치가 나타납니다.
        </p>
      )}
    </div>
  );
}

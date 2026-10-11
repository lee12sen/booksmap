# Change Failure Rate

## 목적

Production 배포 중 장애를 일으킨 변경의 비율을 측정한다.

## 초기 측정 기준

초기에는 최근 7일의 Production 배포를 대상으로 한다.
Production 배포 후 Health Check가 장애 Issue를 만들면 해당 배포를 실패한 변경으로 계산한다.

## 계산 방법

```text
변경 실패율 = 장애를 일으킨 Production 배포 수 ÷ 전체 Production 배포 수 × 100
```

## 예시

```text
전체 Production 배포: 10회
장애를 일으킨 배포: 2회

변경 실패율: 2 ÷ 10 × 100 = 20%
```

## 확인할 항목

- Production 배포만 포함한다.
- Preview 배포는 제외한다.
- Health Check가 만든 장애 Issue를 확인한다.
- 같은 배포를 중복해서 세지 않는다.
- 측정 기간을 함께 기록한다.

## 자동 측정

`Measure Change Failure Rate` 워크플로우를 실행하면 최근 7일의 Production 배포와 장애 Issue를 비교해 결과를 Actions Summary에 표시한다.

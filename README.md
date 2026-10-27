# BooksMap
[![Build](https://github.com/lee12sen/booksmap/actions/workflows/ci.yml/badge.svg)](https://github.com/lee12sen/booksmap/actions/workflows/ci.yml)
---------------

> 부산 공공도서관의 도서 소장·대출 상태와 방문 정보를 한 곳에서 확인하는 통합 검색 서비스

BooksMap은 부산 지역 공공도서관을 대상으로 원하는 도서를 검색하고, 해당 도서를 보유한 도서관의 대출 가능 여부와 위치를 비교할 수 있도록 돕는 반응형 웹 서비스입니다.

현재는 인증키 발급 전 단계이므로 개발용 Mock 데이터로 핵심 검색 흐름을 구현하고 있습니다. 제품 요구사항은 [PRD.md](./docs/PRD.md), 기술 구조는 [TECHNICAL-DESIGN.md](./docs/TECHNICAL-DESIGN.md)를 참고해 주세요.

## 현재 기술 스택

- Next.js App Router
- TypeScript
- Tailwind CSS
- npm
- Mock 데이터 기반 검색 서비스

## 시작하기

의존성을 설치합니다.

```bash
npm install
```

개발 서버를 실행합니다.

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

관련 문서는 다음 목록에서 바로 확인할 수 있습니다.

- **처음 설정하기**: [Getting Started](./docs/getting-started.md)
- **개발 규칙과 구조 확인하기**: [Development Guide](./docs/development-guide.md)
- **문제 해결하기**: [Troubleshooting](./docs/troubleshooting.md)

## GitHub 메트릭과 Prometheus

GitHub 활동 지표를 수집하려면 Next.js 서버를 실행하기 전에 다음 환경변수를 설정합니다.

```text
GITHUB_TOKEN=GitHub personal access token
GITHUB_REPOSITORY=lee12sen/booksmap
```

토큰은 저장소에 커밋하지 마세요. 서버가 실행되면 Prometheus 메트릭은
[http://localhost:3000/api/metrics](http://localhost:3000/api/metrics)에서 확인할 수 있습니다.
Docker Compose의 Prometheus는 이 주소를 주기적으로 수집합니다.

`.env.example`을 복사해 `.env.local`을 만들고 값을 입력할 수 있습니다.
GitHub 토큰에는 저장소의 커밋, 이슈, Pull Request를 읽을 수 있는 권한만 부여하세요.

현재 검색 화면은 `어린 왕자`를 대상으로 한 개발용 예시 데이터를 제공합니다. 실제 API 인증키 발급 후 공공데이터 어댑터로 교체합니다.

## 검증 명령

```bash
npm run lint
npm run typecheck
npm run build
```

## DORA 지표 워크플로우

DORA 4대 지표는 GitHub Actions와 GitHub Deployment·Issue 데이터를 이용해 측정합니다.

- **Lead Time**: `main` 브랜치에 PR이 병합될 때 PR에 포함된 가장 이른 커밋부터 병합까지의 시간을 계산합니다.
- **Deployment Frequency**: 매주 또는 수동 실행으로 최근 7일간 성공한 `Production` Deployment 수를 집계합니다.
- **Change Failure Rate**: 최근 7일간 성공한 `Production` Deployment 중 Production 장애와 연결된 배포의 비율을 계산합니다.
- **MTTR**: 수동 실행 시 종료된 Production 장애 이슈의 `Started at`과 `Recovered at`을 이용해 평균 복구 시간을 계산합니다.

Production 상태 확인은 `health-check.yml`이 5분마다 실행되어 수행합니다. `PRODUCTION_URL`을 GitHub Actions Repository Variable로 설정하면 서비스 응답을 확인하고, 장애 발생 시 `Incident: Production health check failed` 이슈를 생성합니다. 서비스가 복구되면 해당 이슈에 복구 시각과 복구 시간을 기록한 뒤 닫습니다.

배포 빈도 측정은 `deployment-tracker.yml`이 Production Deployment 이벤트를 기록하고, `deployment-frequency.yml`이 성공한 배포를 집계하는 방식으로 동작합니다. 각 워크플로우는 GitHub Actions의 **Run workflow**를 통해 수동으로 실행할 수 있으며, 측정 결과는 Actions Summary에서 확인합니다.

## 주요 MVP 기능

- 부산 공공도서관 통합 도서명 검색
- 도서관별 소장 여부 및 대출 상태 확인
- 도서관명과 주소를 포함한 검색 결과 제공
- 검색 결과 도서관을 지도에서 비교
- 현재 위치 또는 주소 직접 입력을 통한 출발지 설정
- 도보·대중교통 기준 거리 및 예상 이동시간 확인
- 검색 결과 없음, API 오류, 위치 권한 거부 등 예외 상황 안내
- 모바일과 데스크톱을 지원하는 반응형 화면

## 환경변수

실제 인증키는 `.env.local`에 저장하고 커밋하지 않습니다. 변수 이름은 [.env.example](./.env.example)을 참고합니다.

## 개발 현황

| 영역 | 상태 |
| --- | --- |
| 제품 요구사항 정의 | 완료 |
| 기술 스택 및 기본 구조 | 완료 |
| Mock 기반 검색 화면 | 완료 |
| 공공데이터/API 조사 | 예정 |
| 데이터 모델 및 정규화 규칙 | 기본 모델 완료 |
| 지도 및 길찾기 연동 | 예정 |
| 테스트 및 배포 | 예정 |

## 문서

### 개발자 문서

- [Getting Started](./docs/getting-started.md)
- [Development Guide](./docs/development-guide.md)
- [Troubleshooting](./docs/troubleshooting.md)

### 프로젝트 문서

- [제품 요구사항 정의서](./docs/PRD.md)
- [기술 설계서](./docs/TECHNICAL-DESIGN.md)
- [MIT License](./LICENSE)

## 개인정보 및 보안 원칙

- 현재 위치와 직접 입력한 출발지는 서비스 목적에 필요한 범위에서만 사용합니다.
- MVP에서는 출발지 위치를 서버나 사용자 계정에 저장하지 않습니다.
- API 키와 서버 인증정보를 저장소에 커밋하지 않습니다.
- 외부 API 키는 사용 가능한 경우 도메인 제한 등 제공자의 보호 기능을 적용합니다.

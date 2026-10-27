# Troubleshooting

설치, 실행, 검증 과정에서 문제가 발생했을 때 아래 순서로 확인합니다. 오류 메시지와 실행한 명령을 함께 기록하면 원인을 찾기 쉽습니다.

## 먼저 확인할 항목

1. 프로젝트 루트에서 명령을 실행했는지 확인합니다.
2. Node.js와 npm이 설치되어 있는지 확인합니다.

   ```bash
   node --version
   npm --version
   ```

3. 의존성이 설치되어 있는지 확인합니다.

   ```bash
   npm install
   ```

4. 환경변수가 필요한 기능인지 확인합니다. 비밀값은 오류 메시지나 이슈에 붙여 넣지 않습니다.

## 개발 서버가 시작되지 않음

### 포트 3000이 이미 사용 중인 경우

Grafana 또는 다른 개발 서버가 3000 포트를 사용하고 있을 수 있습니다. 실행 중인 프로세스를 확인해 해당 프로세스를 종료하거나, Next.js를 다른 포트로 실행합니다.

```bash
npm run dev -- --port 3001
```

Grafana를 사용하지 않는다면 프로젝트 루트에서 다음 명령으로 모니터링 컨테이너를 종료할 수 있습니다.

```bash
docker compose down
```

### 의존성 또는 모듈을 찾을 수 없는 경우

`node_modules`가 없거나 설치가 중단되었는지 확인합니다. 먼저 다시 설치하고, 계속 실패하면 오류의 첫 번째 원인과 Node.js 버전을 확인합니다.

```bash
npm install
```

## 환경변수 오류

GitHub 메트릭 조회가 실패하면 `.env.local`에 `GITHUB_TOKEN`과 `GITHUB_REPOSITORY`가 설정되어 있는지 확인합니다. 환경변수를 추가하거나 변경한 뒤에는 개발 서버를 다시 시작해야 합니다.

토큰이 없거나 권한이 부족한 경우에도 토큰을 소스 코드에 입력하지 않습니다. 필요한 읽기 권한을 확인하고 새 토큰을 안전한 방식으로 발급합니다.

## 검색 결과 또는 API 오류

현재 기본 검색은 Mock 데이터 기반입니다. 검색 결과가 비어 있거나 예상과 다르면 다음을 확인합니다.

- 검색어가 비어 있지 않은지 확인합니다.
- 개발 서버 터미널의 오류 메시지를 확인합니다.
- 브라우저 개발자 도구에서 API 요청의 상태 코드를 확인합니다.
- 외부 API를 사용하는 변경사항이라면 인증키, 요청 제한, CORS, 응답 필드 변경 여부를 확인합니다.

일부 데이터 출처만 실패한 경우 성공한 도서관 결과가 사라지지 않아야 합니다. 전체 결과가 사라지거나 실패 원인이 사용자에게 전달되지 않는다면 [Development Guide](./development-guide.md)의 부분 성공 원칙을 확인합니다.

## 린트, 타입 검사, 빌드 실패

변경 후 아래 명령을 각각 실행합니다.

```bash
npm run lint
npm run typecheck
npm run build
```

- **lint 실패:** 오류가 보고된 파일과 규칙을 확인하고 저장소의 기존 코드 스타일에 맞게 수정합니다.
- **typecheck 실패:** 누락된 타입, 잘못된 API 응답 타입, `null` 또는 `undefined` 처리 여부를 확인합니다.
- **build 실패:** 타입 검사와 서버 전용 코드의 환경변수 사용 위치를 확인합니다. 오류 메시지의 첫 번째 원인부터 해결합니다.

## Docker Compose 또는 모니터링 오류

Docker Desktop이 실행 중인지 먼저 확인합니다.

```bash
docker compose up -d
docker compose ps
```

Prometheus는 `9090`, Grafana는 `3000` 포트를 사용합니다. Next.js 개발 서버와 Grafana를 동시에 실행할 때 3000 포트가 충돌할 수 있으므로 [Getting Started](./getting-started.md)의 포트 안내를 확인합니다.

컨테이너 로그가 필요하면 다음 명령을 사용합니다.

```bash
docker compose logs prometheus
docker compose logs grafana
```

## 문제를 해결하지 못한 경우

다음 정보를 정리해 이슈에 남깁니다.

- 운영체제와 Node.js/npm 버전
- 실행한 명령
- 재현 절차
- 전체 오류 메시지
- 변경한 파일과 환경

API 키, 액세스 토큰, 개인 위치 정보는 포함하지 않습니다. 작업을 시작하기 전에는 [Getting Started](./getting-started.md), 코드 변경 전에는 [Development Guide](./development-guide.md)를 함께 확인하세요.

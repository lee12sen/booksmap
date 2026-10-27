# Getting Started

BooksMap을 로컬 환경에서 설치하고 실행하는 방법을 안내합니다. 현재 애플리케이션은 실제 공공데이터 인증키를 사용하기 전 단계로, 개발용 Mock 데이터를 포함합니다.

## 사전 요구사항

- Node.js와 npm
- Git
- (선택) Docker Desktop 및 Docker Compose

Node.js 버전은 프로젝트의 Next.js 및 TypeScript 지원 범위에 맞춰 사용하세요. 버전 문제가 발생하면 `node --version`과 `npm --version`으로 설치 상태를 먼저 확인합니다.

## 설치

저장소를 내려받고 프로젝트 디렉터리로 이동한 뒤 의존성을 설치합니다.

```bash
git clone https://github.com/lee12sen/booksmap.git
cd booksmap
npm install
```

## 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다. 현재 검색 화면은 개발용 Mock 데이터로 `어린 왕자` 검색 흐름을 제공합니다.

처음 실행하거나 설치 과정에서 문제가 발생하면 [Troubleshooting](./troubleshooting.md)을 확인하세요.

## 환경변수

GitHub 메트릭 API를 사용하려면 `.env.local` 파일을 만들고 다음 값을 설정합니다.

```text
GITHUB_TOKEN=GitHub personal access token
GITHUB_REPOSITORY=lee12sen/booksmap
```

토큰은 저장소에 커밋하지 말고, 커밋·이슈·Pull Request를 읽는 데 필요한 최소 권한만 부여하세요. 공공데이터와 지도 API 연동에 필요한 키는 공식 제공자의 인증·노출·도메인 제한 정책을 확인한 뒤 추가합니다. 아직 확정되지 않은 키를 임의로 설정할 필요는 없습니다.

## 선택 사항: Prometheus와 Grafana 실행

모니터링 도구를 실행하려면 Docker Desktop을 켠 뒤 다음 명령을 사용합니다.

```bash
docker compose up -d
```

`docker-compose.yml`의 현재 설정은 Prometheus를 `9090`, Grafana를 `3000` 포트에 연결합니다. 따라서 Grafana를 실행하는 동안에는 Next.js 개발 서버가 기본 포트인 3000을 사용할 수 없습니다. 애플리케이션과 모니터링 도구를 동시에 실행하려면 포트 매핑을 별도로 조정하세요.

실행 중인 컨테이너를 종료하려면 다음 명령을 사용합니다.

```bash
docker compose down
```

## 다음 단계

- 개발 규칙과 디렉터리 구조는 [Development Guide](./development-guide.md)를 확인합니다.
- 설치·실행 오류는 [Troubleshooting](./troubleshooting.md)을 확인합니다.
- 제품 범위는 [PRD](./PRD.md), 기술 구조는 [Technical Design](./TECHNICAL-DESIGN.md)을 참고합니다.

# BooksMap 기술 설계

## 1. 목적

이 문서는 [PRD.md](./PRD.md)의 MVP를 구현하기 위한 기술 선택과 구조를 정의한다. 외부 인증키가 발급되기 전에는 Mock 데이터로 사용자 흐름을 구현하고, 이후 실제 API 어댑터를 추가한다.

## 2. 확정 기술 스택

| 영역 | 선택 |
|---|---|
| 프레임워크 | Next.js App Router |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS |
| 서버 API | Next.js Route Handlers |
| 외부 데이터 연동 | API 어댑터와 내부 표준 모델 분리 |
| 지도 | 카카오맵 API 우선 검토 |
| 단위·컴포넌트 테스트 | Vitest, React Testing Library |
| E2E 테스트 | Playwright |
| 코드 품질 | ESLint, Prettier |
| 배포 | Vercel 우선 검토 |
| 패키지 관리자 | npm |

## 3. 설계 원칙

- 화면은 외부 API의 필드명과 상태값을 직접 사용하지 않는다.
- Mock 어댑터와 실제 API 어댑터를 같은 서비스 인터페이스로 교체할 수 있게 한다.
- 대출 상태가 없거나 해석할 수 없으면 `unknown`으로 유지한다.
- 한 도서관의 오류가 전체 검색 결과를 제거하지 않도록 부분 성공을 보존한다.
- 인증키는 환경변수로만 주입하고 저장소에 커밋하지 않는다.
- 지도와 경로 계산은 검색 결과 표시와 분리해 필요한 시점에 요청한다.

## 4. 초기 구조

```text
src/
├─ app/
│  ├─ page.tsx
│  ├─ layout.tsx
│  └─ globals.css
├─ components/
├─ domain/
│  └─ library.ts
├─ services/
│  ├─ book-search.ts
│  └─ adapters/
│     └─ mock-book-search.ts
└─ lib/
```

실제 API 키 발급 후에는 `adapters` 아래에 공공데이터 API 어댑터를 추가하고, 응답을 `LibraryBookResult` 모델로 변환한다.

## 5. 환경변수 원칙

실제 키는 `.env.local`에 저장한다. `.env.example`에는 변수 이름만 기록한다.

```text
PUBLIC_LIBRARY_API_KEY=
KAKAO_REST_API_KEY=
NEXT_PUBLIC_KAKAO_MAP_KEY=
```

브라우저에 노출되어도 되는 키인지 제공자 문서를 확인하기 전에는 모든 민감한 호출을 서버 Route Handler를 통해 처리한다.

## 6. 검증 명령

프로젝트 설정이 추가된 뒤 다음 명령을 사용한다.

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```

Vitest, React Testing Library, Playwright를 도입하면 해당 테스트 명령과 단일 테스트 실행 방법을 `package.json`과 `README.md`에 추가한다.

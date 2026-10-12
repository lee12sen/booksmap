# 개인 스프린트 계획

## 1. 스프린트 개요

- **대상 프로젝트:** BooksMap
- **운영 방식:** 개인 스프린트
- **대상 마일스톤:**
  - [Release 0.2 — 도서관정보나루 API 연동](https://github.com/lee12sen/booksmap/milestone/2)
  - [DORA 메트릭 수집 자동화](https://github.com/lee12sen/booksmap/milestone/3)
- **관리 도구:** GitHub Issues, Milestones, Projects
- **기간:** 별도 지정

## 2. 스프린트 목표

도서관정보나루 API의 실제 연동 가능성을 확인하고, 가능한 범위에서 실제 검색 결과를 화면에 연결한다. 동시에 DORA 지표를 측정하는 개발 운영 흐름을 유지하고, 작업 결과를 GitHub에서 추적할 수 있도록 한다.

## 3. 작업 범위

### Release 0.2 — 도서관정보나루 API 연동

| 이슈 | 작업 | 우선순위 |
| --- | --- | --- |
| [#25](https://github.com/lee12sen/booksmap/issues/25) | 도서관정보나루 API 문서 및 호출 조건 조사 | P0 |
| [#27](https://github.com/lee12sen/booksmap/issues/27) | 부산 지역 도서관 목록 및 코드 조회 | P0 |
| [#26](https://github.com/lee12sen/booksmap/issues/26) | 도서명·ISBN 검색 및 대출 상태 검증 | P0 |
| [#28](https://github.com/lee12sen/booksmap/issues/28) | API 응답을 내부 모델로 변환 | P0 |
| [#29](https://github.com/lee12sen/booksmap/issues/29) | 실제 API 어댑터와 검색 화면 연결 | P0 |
| [#30](https://github.com/lee12sen/booksmap/issues/30) | API 오류·부분 실패 처리 및 Release 0.2 검증 | P1 |

### DORA 메트릭 수집 자동화

- Lead Time 워크플로우 실행 및 결과 확인
- Deployment Frequency 워크플로우 실행 및 결과 확인
- MTTR 및 Health Check 흐름 확인
- Change Failure Rate 워크플로우 실행 및 결과 확인
- Actions 실행 결과와 측정 기준 문서화

## 4. 진행 순서

```text
API 문서 조사
  → 부산 도서관 목록·코드 확인
  → 도서명·ISBN 및 대출 상태 검증
  → 내부 모델 변환
  → 실제 API와 검색 화면 연결
  → 오류 처리 및 검증

DORA 워크플로우는 각 작업의 PR·배포 과정에서 함께 확인
```

## 5. 개인 스프린트 운영 방식

1. GitHub Project에서 작업을 `Todo`로 등록한다.
2. 실제 작업을 시작하면 `In Progress`로 이동한다.
3. 구현 또는 조사가 끝나면 결과와 확인 내용을 이슈에 기록한다.
4. 검증이 끝난 작업은 `Done`으로 이동한다.
5. 작업이 예상보다 커지면 이슈를 나누거나 다음 스프린트로 이동한다.

개인 스프린트이므로 별도의 팀 회의와 담당자 배정은 하지 않는다. 대신 각 이슈의 완료 기준과 작업 결과를 직접 기록한다.

## 6. 완료 기준

### Release 0.2

- [ ] 실제 인증키로 API 호출 가능 여부를 확인한다.
- [ ] 부산 지역 도서관 목록과 식별자를 확인한다.
- [ ] 도서명 또는 ISBN 검색 방식을 결정한다.
- [ ] 소장 여부와 대출 상태 응답을 확인한다.
- [ ] API 응답을 내부 모델로 변환한다.
- [ ] 가능한 범위에서 실제 API 검색 결과를 화면에 표시한다.
- [ ] API 오류와 부분 실패 시 사용자 안내를 확인한다.
- [ ] `lint`, `typecheck`, `build`를 실행한다.

### DORA

- [ ] 네 가지 DORA 워크플로우를 실행한다.
- [ ] 각 실행 결과를 Actions Summary에서 확인한다.
- [ ] 측정 기준과 결과를 관련 문서에 기록한다.

## 7. 스프린트 종료 기록

- **완료한 작업:**
- **완료하지 못한 작업:**
- **발견한 API 제약:**
- **DORA 측정 결과:**
- **다음 스프린트로 넘길 작업:**


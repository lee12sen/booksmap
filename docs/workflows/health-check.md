# Health Check

## 목적

5분마다 Production 서비스를 확인해 장애 여부를 점검한다.

## 측정 방법

- 정상: Production URL이 성공 응답을 반환한다.
- 장애 의심: 요청 실패 또는 응답 시간 초과
- 실패한 실행은 GitHub Actions에서 확인한다.

## 동작 방식

서비스에 문제가 생기면 `Incident: Production health check failed` 이슈를 자동으로 만든다.
서비스가 다시 정상화되면 복구 시간과 함께 해당 이슈를 자동으로 닫는다.

필요하면 GitHub Actions에서 수동으로도 실행할 수 있다.

## 설정

GitHub 저장소에서 다음 경로로 이동한다.

```text
Settings → Secrets and variables → Actions → Variables
```

`PRODUCTION_URL`이라는 Repository variable을 만들고 Vercel Production URL을 입력한다.

## 참고

이 워크플로우는 초기 개발 단계의 간단한 서비스 확인용이다. 장애 발생 및 복구 시간을 자동으로 저장하지 않으므로, MTTR 자동 계산에는 별도의 장애 기록 기능이 필요하다.

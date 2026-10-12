# 모니터링 대시보드 API 및 도구 명세서

## 목적

GitHub 활동 지표와 DORA 지표를 Prometheus로 수집하고 Grafana에서 시각화한다.

## 사용 도구

| 도구 | 역할 |
|---|---|
| Next.js | 메트릭 API 엔드포인트 제공 |
| Docker Compose | Prometheus와 Grafana 실행 |
| Prometheus | 메트릭 수집 및 저장 |
| Grafana | 메트릭 대시보드 시각화 |

## 사용 API

### GitHub REST API

GitHub 저장소의 커밋, Pull Request, 이슈, 배포 정보를 조회한다.

```text
GET /repos/{owner}/{repo}/pulls
GET /repos/{owner}/{repo}/issues
GET /repos/{owner}/{repo}/commits
GET /repos/{owner}/{repo}/deployments
GET /repos/{owner}/{repo}/pulls/{pull_number}/commits
GET /repos/{owner}/{repo}/issues/{issue_number}/comments
```

인증은 `GITHUB_TOKEN` 환경변수를 사용한다. 토큰은 저장소에 커밋하지 않는다.

### BooksMap 메트릭 API

```text
GET http://localhost:3001/api/metrics
```

Prometheus 형식의 텍스트 응답을 반환한다.

주요 메트릭:

```text
booksmap_github_commits_total
booksmap_github_merged_pull_requests_total
booksmap_github_resolved_issues_total
booksmap_dora_lead_time_minutes
booksmap_dora_deployment_frequency_total
booksmap_dora_change_failure_rate_percent
booksmap_dora_mttr_minutes
```

## Prometheus 설정

Prometheus는 15초마다 BooksMap 메트릭 API를 조회한다.

```text
http://host.docker.internal:3001/api/metrics
```

Prometheus 접속 주소:

```text
http://localhost:9090
```

## Grafana 설정

Grafana는 Prometheus를 데이터 소스로 사용한다.

```text
http://prometheus:9090
```

Grafana 접속 주소:

```text
http://localhost:3000
```

## 환경변수

```text
GITHUB_TOKEN=GitHub API 읽기 토큰
GITHUB_REPOSITORY=lee12sen/booksmap
```

환경변수는 `.env.local`에 저장하며, 실제 토큰은 공개 저장소에 올리지 않는다.

## 표시 지표

- 최근 7일 커밋 수
- 최근 7일 병합된 PR 수
- 최근 7일 해결된 이슈 수
- 시간대별·요일별 커밋 활동
- Lead Time
- Deployment Frequency
- Change Failure Rate
- MTTR

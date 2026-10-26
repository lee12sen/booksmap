# 도서관정보나루 API 연동 시작

## 환경변수 설정

`.env.local` 파일에 발급받은 인증키를 입력합니다.

```env
DATA4LIBRARY_AUTH_KEY=여기에_인증키_입력
```

인증키는 저장소에 커밋하지 않습니다. `.env*` 파일은 `.gitignore`에서 제외됩니다.

## 현재 구현 범위

현재는 도서관정보나루의 `libSrch` API를 사용해 부산 지역 도서관 목록을 확인합니다. 부산 지역 코드는 `21`입니다.

개발 서버 실행 후 다음 주소를 엽니다.

```text
http://localhost:3000/api/libraries
```

정상 응답에는 도서관 코드, 이름, 주소가 포함됩니다. 외부 API 필드명은 BooksMap의 `LibrarySummary` 모델로 변환됩니다.

## 확인할 내용

- 부산 지역 도서관 목록이 반환되는지 확인
- `libraryId`에 도서관 코드가 들어오는지 확인
- 응답에 누락된 도서관이 없는지 확인
- 인증키 오류 또는 호출 제한 응답 확인

## 도서 검색 및 대출 상태 확인

도서명으로 검색합니다.

```text
http://localhost:3000/api/books?keyword=어린%20왕자
```

검색 결과의 `isbn13`을 사용해 부산 지역 소장 도서관과 대출 상태를 확인합니다. 도서 검색 응답은 `BookSearchResult`, 소장·대출 응답은 `LibraryBookResult` 모델을 사용합니다.

```text
http://localhost:3000/api/books?isbn13=9788949110479
```

- `srchBooks`: 도서명 검색
- `libSrchByBook`: ISBN으로 소장 도서관 조회
- `bookExist`: 도서관별 소장 여부와 대출 가능 여부 확인
- `loanAvailable=Y`: 대출 가능
- `loanAvailable=N`: 대출 중 또는 대출 불가

대출 상태를 알 수 없는 값은 내부 모델에서 `unknown`으로 유지합니다. 일부 도서관 조회가 실패해도 성공한 결과는 반환합니다.

도서명 검색은 API의 `exactMatch=true` 옵션과 응답 제목의 추가 포함 필터를 함께 사용합니다. 따라서 검색어가 제목에 포함되지 않은 관련 도서는 검색 결과에서 제외됩니다.

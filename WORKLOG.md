# 작업 기록

PC 두 대를 오가며 작업하므로, 커밋할 때마다 **맨 위에** 항목을 추가한다.
코드 변경은 git 로그가 이미 기록하니, 여기에는 **git이 담지 못하는 것**을 적는다.
규칙은 `CLAUDE.md` 참고.

---

## 2026-08-18 · 직장 PC

**커밋** 이 커밋 (등록 폼 날짜 입력을 달력으로 교체)

### 한 일

- `new.html` 의 `<input name="date" type="date">` 를 `datepicker.js` 로 바꿨다.
  이제 등록 폼과 목록 필터가 같은 달력을 쓴다.

### 저장소 밖 변경

- **네이버 클라우드 플랫폼** — Application ▸ Web 서비스 URL 에
  `http://localhost:3000` 을 추가했다. 기존에는 `http://localhost:4173` 만 있어서
  `CLAUDE.md` 가 권하는 `npx serve .`(3000) 로 띄우면 `map.html` 이 네이버 인증에
  실패하고 OpenStreetMap 으로 대체됐다. 이제 두 포트 다 네이버 지도로 뜬다.
- **Supabase** — 변경 없음. **Vercel** — 변경 없음.

### 다음 할 일

- 로드맵 2번 **지도 보강** (`lat`/`lng` 컬럼). 스키마 변경이라 Supabase 접근 필요.
  Claude 의 Supabase MCP 는 **읽기 전용**이라 SQL 을 받아 콘솔에서 직접 실행해야 한다.
- `map.html` 왼쪽 목록에 필터를 붙일지 결정 (`list.html` 과 맞출지)

### 알아둘 것

- 달력은 `<button>` 이라 **네이티브 `required` 검증이 사라진다.** 그래서 submit 핸들러
  맨 앞에서 `datePicker.getValue()` 가 비었는지 직접 보고 "날짜를 선택해 주세요." 를
  띄운다. 다른 폼에 달력을 더 붙일 때도 이 검증을 같이 넣어야 한다.
- `<label>` 이 달력 버튼을 감싸고 있다. `button` 은 label 대상이 되는 요소라
  "날짜" 글자를 눌러도 달력이 열린다. 의도한 동작이다.

### 검증

- 브라우저(localhost:3000)에서 달력 열림 · 날짜 선택 · × 로 지우기 확인
- 날짜를 비우고 제출하면 네트워크 요청 전에 막히는 것 확인 (콘솔 오류 없음)
- 수정 모드 프리필(`datePicker.setValue`)은 로그인이 필요해 코드로만 확인했다

---

## 2026-08-17 · 집 PC

**커밋** `f18c168` 배포 저장소명 수정 · `6d6bf82` 지역·날짜 필터 + 날짜 선택기 · 그리고 이 커밋(작업 규칙 문서)

### 한 일

- 로드맵 1번 **지역·날짜 필터**를 `list.html` 에 넣었다. 스키마는 안 건드리고
  브라우저에서 거른다. 조건은 `?region=&from=&to=` 로 주소창에 남는다.
- 날짜 입력을 `<input type="date">` 에서 직접 만든 달력(`datepicker.js`)으로 바꿨다.

### 저장소 밖 변경

- **Supabase** — Auth ▸ URL Configuration ▸ Redirect URLs 에
  `http://localhost:3000/**` 를 추가했다. 로컬에서 Google 로그인을 시험하려면
  필요하다. Site URL은 건드리지 않았다. **스키마·RLS·함수는 변경 없음.**
- **Vercel** — 변경 없음. 확인만 했다. 아래 "알아둘 것" 참고.
- **집 PC에 새로 설치** — git 2.55, gh 2.97, Node 24.19 LTS.
  이 PC에 아무것도 없어서 winget으로 깔았다. 직장 PC에는 이미 있을 테니 할 일 없음.

### 다음 할 일

- 로드맵 2번 **지도 보강** — `opportunities` 에 `lat`/`lng` 컬럼을 두고 등록할 때
  한 번만 좌표를 찾아 저장한다. 지금은 `map.html` 이 볼 때마다 Nominatim으로
  주소를 찾고 브라우저에 캐시한다. **이건 스키마 변경이라 Supabase 접근이 필요하다.**
- `map.html` 왼쪽 목록에는 아직 필터가 없다. `list.html` 과 맞출지 정해야 한다.
- `new.html` 등록 폼의 날짜 입력도 `datepicker.js` 로 바꿀 수 있다. 두 줄이면 된다.

### 알아둘 것

- **Vercel 프로젝트명은 `vlntr_mockdata`** 다. 저장소명(`vlntr`)과 달라서
  대시보드에서 헷갈린다. mock 데이터 쓰던 시절 이름이 남은 것이고 동작은 정상이다.
- 공개 주소는 **`vlntr.vercel.app`** (별칭 `vlntrmockdata.vercel.app`). 둘 다 열린다.
  GitHub API의 `environment_url` 이 알려주는 `...-pv43oanyj-...` 주소는
  **배포별 프리뷰 URL이라 Vercel 로그인 벽이 걸린다.** 이걸 보고 사이트가
  막힌 줄 알고 설정을 뒤졌는데, 프로덕션 도메인은 멀쩡했다. 시간 낭비 주의.
- auto-deploy는 웹훅이 아니라 **GitHub App** 으로 붙어 있다.
  `gh api repos/axhw-jin/vlntr/hooks` 가 0건이어도 정상이다.
  배포 확인은 `gh api repos/axhw-jin/vlntr/deployments` 로 한다.
- `location` 은 자유 입력이라 "서울"과 "서울특별시"가 섞인다.
  `datepicker.js` 가 아니라 `list.html` 의 `REGION_ALIAS` 표에서 합친다.
  나중에 등록 폼에 시/도 선택을 넣으면 이 표는 필요 없어진다.
- `event_date` 는 `"2026-08-22 (토)"` 형태의 **문자열**이다. 날짜 타입이 아니다.
  앞 10자가 ISO라 문자열 비교로 정렬·범위 판정이 된다.

### 검증

- 필터 로직: `list.html` 에서 실제 함수를 꺼내 라이브 Supabase 데이터로 18개 통과
- 날짜 선택기: jsdom으로 29개 통과 (앞뒤 36개월 순회, 선택·삭제, 중복 열림 방지 포함)

# UniMap — 한국 대학 3D 지도

전국 대학을 3D 지도에서 탐색하는 웹 애플리케이션입니다.

## 실행 방법

### 방법 1: 직접 열기
`index.html` 파일을 Chrome, Edge, Firefox 등의 브라우저에서 직접 엽니다.

### 방법 2: 로컬 서버 (권장)
브라우저 보안 정책으로 인해 로컬 서버를 사용하는 것이 좋습니다.

**Python이 설치되어 있다면:**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

그 다음 브라우저에서 `http://localhost:8000` 접속

**Node.js가 설치되어 있다면:**
```bash
npx serve
```

## 테스트

`test.html` 파일을 열어서 deck.gl이 정상적으로 로드되는지 확인할 수 있습니다.

## 기술 스택

- **deck.gl v8.9.27** - 3D 데이터 시각화
- **MapLibre GL v3.6.2** - 오픈소스 지도 라이브러리
- **Vanilla JavaScript** - 프레임워크 없이 순수 JS
- **CARTO Dark Matter** - 무료 베이스맵

## 주요 기능

- 🗺️ **3D 지도 시각화**: 캠퍼스 면적에 비례하는 3D 건물
- 🔍 **실시간 검색**: 대학명, 캠퍼스명, 학과명 검색
- 🏷️ **필터링**: 국립/사립 필터
- 📊 **상세 정보**: 경쟁률, 등록금, 학과별 데이터
- 📱 **반응형**: 모바일/태블릿 지원

## 데이터 추가

`data/universities.js` 파일의 `UNIVERSITIES` 배열에 다음 형식으로 추가:

```javascript
{
  id: 16,
  name: "대학명",
  campus: "캠퍼스명",
  type: "국립" 또는 "사립",
  founded: "YYYY-MM-DD",
  address: "주소",
  landSize: 1000000, // 제곱미터
  lat: 37.1234,
  lng: 127.1234,
  website: "https://...",
  avgCompetition: 4.5,
  tuition: 8000000,
  departments: [
    { name: "학과명", competition: 5.0, capacity: 100 },
    // ...
  ]
}
```

## 문제 해결

### 지도가 표시되지 않는 경우
1. 브라우저 콘솔(F12)에서 오류 확인
2. 인터넷 연결 확인 (CDN 라이브러리 로드 필요)
3. `test.html`로 기본 동작 확인

### CORS 오류가 발생하는 경우
로컬 서버를 사용하세요 (위의 "방법 2" 참고)

## 라이선스

MIT License

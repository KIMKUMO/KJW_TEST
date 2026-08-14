# 반응속도 측정기

버튼을 누르면 화면이 파란색으로 시작하고, 1~12초 사이 무작위 시점에 화면이
빨간색으로 바뀝니다. 빨간색으로 바뀐 순간부터 클릭까지 걸린 시간(ms)을
측정해 초록색 결과 화면에 보여주고, 닉네임을 입력하면 Firebase(Firestore)에
기록을 저장합니다. 빨간색으로 바뀌기 전에 클릭하면 실패 처리됩니다.
10% 확률로는 빨간 화면 대신 깜짝 이미지(점프스케어)가 잠깐 나타났다가
자동으로 실패 처리됩니다.

빌드 도구 없이 순수 HTML/CSS/JS로만 구성되어 있어 정적 파일을 그대로
GitHub Pages에서 서비스할 수 있습니다.

## 폴더 구조

```
index.html          화면 마크업
style.css           상태별(파란/빨간/초록/회색/점프스케어) 화면 스타일
js/game.js          게임 상태 머신(대기 -> 빨간화면 또는 점프스케어 -> 결과/실패)
js/db.js            Firebase 연동 모듈 — saveScore(ms, nickname), getTop(n)
js/firebase-config.js  Firebase 프로젝트 설정값(직접 채워야 함)
js/main.js           게임과 Firebase를 연결하는 진입점
firestore.rules      Firestore 보안 규칙
assets/jumpscare.jpg 점프스케어에 쓰일 이미지(직접 추가해야 함, 아래 참고)
```

### 점프스케어 이미지 추가하기

`assets/jumpscare.jpg` 경로에 이미지 파일이 없으면 10% 확률로 점프스케어가
발생할 때 화면이 깨진 이미지 아이콘으로 나옵니다. `index.html`의
`#jumpscare-panel` 안 `<img>` 태그가 이 경로를 참조하므로, 원하는 이미지
파일을 저장소에 `assets/jumpscare.jpg`라는 이름으로 추가해주세요(다른
파일명을 쓰려면 `index.html`의 `src` 값도 함께 바꿔주세요).

## 1. Firebase 프로젝트 준비

값을 채우기 전까지는 앱이 동작은 하지만 점수 저장/조회는 콘솔 경고만 찍고
아무 일도 하지 않습니다(로컬 테스트는 그대로 가능).

1. [Firebase 콘솔](https://console.firebase.google.com)에서 새 프로젝트를 만듭니다.
2. 왼쪽 메뉴에서 **빌드 > Firestore Database**로 들어가 데이터베이스를
   생성합니다(프로덕션 모드로 시작해도 무방 — 규칙은 아래에서 별도로 배포).
3. 프로젝트 개요 화면에서 **웹 아이콘(</>)**을 눌러 웹 앱을 등록합니다.
4. 등록 후 나오는 `firebaseConfig` 객체 값(apiKey, authDomain, projectId,
   storageBucket, messagingSenderId, appId)을 아래 두 가지 중 하나에
   반영합니다.
   - **로컬 테스트용**: `js/firebase-config.js`의 동일한 필드에 그대로
     붙여넣습니다. 이 값들은 브라우저에 그대로 노출되는 공개 값이며
     비밀키가 아닙니다 — 실제 보안은 Firestore 보안 규칙이 담당합니다.
   - **배포용(GitHub Actions)**: 저장소 **Settings > Secrets and
     variables > Actions**에서 아래 이름으로 시크릿을 등록합니다.
     `deploy-pages.yml` 워크플로가 배포 직전에 이 값들로
     `js/firebase-config.js`를 자동 생성하므로, 실제 값이 저장소에
     커밋되지 않습니다.
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`

## 2. Firestore 보안 규칙 배포

`firestore.rules` 파일 내용을 다음 중 한 가지 방법으로 적용하세요.

- **콘솔에서 직접 붙여넣기(가장 간단)**: Firebase 콘솔 > Firestore Database >
  규칙 탭에서 `firestore.rules` 내용을 그대로 붙여넣고 게시합니다.
- **Firebase CLI 사용**:
  ```bash
  npm install -g firebase-tools
  firebase login
  firebase init firestore   # 기존 firestore.rules 사용 선택
  firebase deploy --only firestore:rules
  ```

규칙은 다음을 강제합니다.
- 누구나 랭킹(top n)을 읽을 수 있음
- 새 기록 생성만 허용, `nickname`(1~20자 문자열)과 `ms`(0~20000 사이 숫자)
  형식을 검증
- 기존 기록의 수정/삭제는 항상 거부(기록 위·변조 방지)

## 3. 로컬에서 확인하기

빌드가 필요 없으므로 정적 파일 서버로 열기만 하면 됩니다. 예:

```bash
python3 -m http.server 8080
# 브라우저에서 http://localhost:8080 접속
```

`file://`로 직접 열면 브라우저가 ES 모듈(`type="module"`) 로드를 막을 수
있으니 반드시 간단한 로컬 서버를 통해 접속하세요.

## 4. GitHub Pages로 배포하기

이 저장소는 **GitHub Actions**를 통해 배포되도록 설정되어 있습니다
(`.github/workflows/deploy-pages.yml`).

1. GitHub 저장소 > **Settings > Pages**로 이동해 **Source**가
   `GitHub Actions`로 되어 있는지 확인합니다(이미 설정됨).
2. `claude/reaction-time-web-app-vob2h4` 브랜치에 push할 때마다
   `deploy-pages.yml` 워크플로가 자동으로 실행되어 정적 파일 전체를
   Pages에 배포합니다. 저장소 상단 **Actions** 탭에서 진행 상황과
   성공 여부를 확인할 수 있습니다.
3. 배포가 끝나면 `https://<사용자명>.github.io/<저장소명>/` 주소로
   접속해 앱을 확인할 수 있습니다.
4. 필요하면 Actions 탭에서 `Deploy to GitHub Pages` 워크플로를
   `Run workflow` 버튼으로 수동 실행할 수도 있습니다.

## 점수 저장/조회 API

`js/db.js`에서 다음 두 함수만 외부로 노출합니다.

- `saveScore(ms, nickname)` — 반응속도(ms)와 닉네임을 Firestore에 새 기록으로 저장. 성공 시 `true`, 실패 시 `false` 반환.
- `getTop(n)` — 반응속도가 가장 빠른 순으로 상위 `n`개 기록을 `{ nickname, ms }[]` 형태로 반환.

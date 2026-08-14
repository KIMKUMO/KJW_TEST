// Firebase 프로젝트 설정값.
//
// 아래 값은 Firebase 콘솔(https://console.firebase.google.com)에서
// [프로젝트 설정] > [일반] 탭 > [내 앱] > [SDK 설정 및 구성]에서 그대로 복사해 채워 넣으세요.
//
// 이 값들은 클라이언트(브라우저)에 그대로 노출되는 값이며 비밀키가 아닙니다.
// Firebase 웹 앱은 원래 이렇게 동작하며, 실제 보안은 firestore.rules(보안 규칙)로 처리합니다.
//
// 값을 채우기 전까지는 저장/조회가 동작하지 않고 콘솔에 경고만 출력됩니다.
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

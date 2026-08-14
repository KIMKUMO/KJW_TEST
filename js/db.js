// Firebase(Firestore) 연동 모듈.
// 점수 저장/조회는 saveScore(ms, nickname), getTop(n) 두 함수로만 외부에 노출한다.
//
// Firebase SDK는 동적 import()로 지연 로드한다. 정적 import로 CDN 모듈을 불러오면
// 네트워크 문제로 로드에 실패했을 때 이 모듈을 가져오는 쪽(main.js -> game.js 포함)까지
// 통째로 깨져 게임 자체가 멈춰버린다. 동적 import는 실패해도 try/catch로 잡을 수 있어
// Firebase 연결이 안 되더라도 반응속도 게임 자체는 항상 정상 동작하도록 한다.
import { firebaseConfig } from "./firebase-config.js";

const FIREBASE_SDK_VERSION = "10.13.0";
const FIREBASE_APP_URL = `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app.js`;
const FIREBASE_FIRESTORE_URL = `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-firestore.js`;
const SCORES_COLLECTION = "scores";

const isConfigured = Boolean(
  firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("YOUR_")
);

let dbPromise = null;

function getDb() {
  if (!isConfigured) {
    console.warn(
      "[firebase] js/firebase-config.js 값이 아직 채워지지 않았습니다. 점수 저장/조회가 동작하지 않습니다."
    );
    return Promise.resolve(null);
  }

  if (!dbPromise) {
    dbPromise = (async () => {
      try {
        const { initializeApp } = await import(FIREBASE_APP_URL);
        const { getFirestore } = await import(FIREBASE_FIRESTORE_URL);
        const app = initializeApp(firebaseConfig);
        return getFirestore(app);
      } catch (err) {
        console.error("[firebase] SDK 로드 실패(네트워크 확인 필요):", err);
        return null;
      }
    })();
  }
  return dbPromise;
}

/**
 * 반응속도 기록을 Firestore에 저장한다.
 * @param {number} ms 반응속도(밀리초)
 * @param {string} nickname 닉네임
 * @returns {Promise<boolean>} 저장 성공 여부
 */
export async function saveScore(ms, nickname) {
  const db = await getDb();
  if (!db) return false;

  try {
    const { collection, addDoc, serverTimestamp } = await import(
      FIREBASE_FIRESTORE_URL
    );
    await addDoc(collection(db, SCORES_COLLECTION), {
      ms,
      nickname,
      createdAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.error("[firebase] saveScore 실패:", err);
    return false;
  }
}

/**
 * 반응속도가 가장 빠른(ms가 작은) 순으로 상위 n개의 기록을 가져온다.
 * @param {number} n 가져올 개수
 * @returns {Promise<Array<{nickname: string, ms: number}>>}
 */
export async function getTop(n) {
  const db = await getDb();
  if (!db) return [];

  try {
    const { collection, query, orderBy, limit, getDocs } = await import(
      FIREBASE_FIRESTORE_URL
    );
    const q = query(
      collection(db, SCORES_COLLECTION),
      orderBy("ms", "asc"),
      limit(n)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return { nickname: data.nickname, ms: data.ms };
    });
  } catch (err) {
    console.error("[firebase] getTop 실패:", err);
    return [];
  }
}

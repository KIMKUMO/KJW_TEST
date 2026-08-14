// Firebase(Firestore) 연동 모듈.
// 점수 저장/조회는 saveScore(ms, nickname), getTop(n) 두 함수로만 외부에 노출한다.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const SCORES_COLLECTION = "scores";

const isConfigured = Boolean(
  firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("YOUR_")
);

let db = null;
if (isConfigured) {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} else {
  console.warn(
    "[firebase] js/firebase-config.js 값이 아직 채워지지 않았습니다. 점수 저장/조회가 동작하지 않습니다."
  );
}

/**
 * 반응속도 기록을 Firestore에 저장한다.
 * @param {number} ms 반응속도(밀리초)
 * @param {string} nickname 닉네임
 * @returns {Promise<boolean>} 저장 성공 여부
 */
export async function saveScore(ms, nickname) {
  if (!db) return false;
  try {
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
  if (!db) return [];
  try {
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

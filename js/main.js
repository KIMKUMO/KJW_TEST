// 앱 진입점. 게임 상태 머신과 Firebase 연동을 연결한다.
import { area } from "./game.js";
import { saveScore, getTop } from "./db.js";

const TOP_N = 5;

const resultMsEl = document.getElementById("result-ms");
const saveForm = document.getElementById("save-form");
const nicknameInput = document.getElementById("nickname-input");
const saveBtn = document.getElementById("save-btn");
const saveStatusEl = document.getElementById("save-status");
const rankingListEl = document.getElementById("ranking-list");

let currentMs = null;

area.addEventListener("reaction-result", async (e) => {
  currentMs = e.detail.ms;
  resultMsEl.textContent = `${currentMs} ms`;
  saveStatusEl.textContent = "";
  nicknameInput.value = "";
  saveBtn.disabled = false;
  await renderRanking();
});

saveForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (currentMs == null) return;

  const nickname = nicknameInput.value.trim();
  if (!nickname) return;

  saveBtn.disabled = true;
  saveStatusEl.textContent = "저장 중...";

  const ok = await saveScore(currentMs, nickname);
  saveStatusEl.textContent = ok ? "저장되었습니다!" : "저장에 실패했습니다.";
  if (!ok) saveBtn.disabled = false;

  await renderRanking();
});

async function renderRanking() {
  const top = await getTop(TOP_N);
  rankingListEl.innerHTML = "";

  if (top.length === 0) {
    const li = document.createElement("li");
    li.textContent = "아직 기록이 없습니다.";
    rankingListEl.appendChild(li);
    return;
  }

  for (const { nickname, ms } of top) {
    const li = document.createElement("li");
    li.textContent = `${nickname} - ${ms} ms`;
    rankingListEl.appendChild(li);
  }
}

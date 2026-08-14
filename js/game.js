// 반응속도 게임의 상태 머신.
// 상태: idle(대기) -> waiting(빨간색 전환 대기) -> ready(빨간색, 측정 중)
//       -> result(결과) / waiting 중 클릭 시 -> fail(실패)
// DB(Firebase) 연동과는 분리되어 있으며, 측정 결과는 'reaction-result' 커스텀 이벤트로 알려준다.

const MIN_DELAY_MS = 1000;
const MAX_DELAY_MS = 12000;

const area = document.getElementById("game-area");

const panels = {
  idle: document.getElementById("idle-panel"),
  waiting: document.getElementById("waiting-panel"),
  ready: document.getElementById("ready-panel"),
  fail: document.getElementById("fail-panel"),
  result: document.getElementById("result-panel"),
};

const startBtn = document.getElementById("start-btn");
const failRetryBtn = document.getElementById("fail-retry-btn");
const retryBtn = document.getElementById("retry-btn");

let state = "idle";
let readyTimeoutId = null;
let readyAt = 0; // 빨간 화면으로 바뀐 시각(performance.now() 기준)

function setState(next) {
  state = next;
  area.classList.remove(
    "state-idle",
    "state-waiting",
    "state-ready",
    "state-fail",
    "state-result"
  );
  area.classList.add(`state-${next}`);

  for (const [key, el] of Object.entries(panels)) {
    el.classList.toggle("hidden", key !== next);
  }
}

function startRound() {
  const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
  setState("waiting");
  readyTimeoutId = setTimeout(() => {
    readyTimeoutId = null;
    readyAt = performance.now();
    setState("ready");
  }, delay);
}

function handleAreaClick() {
  if (state === "waiting") {
    // 빨간색으로 바뀌기 전에 클릭 -> 실패
    clearTimeout(readyTimeoutId);
    readyTimeoutId = null;
    setState("fail");
    return;
  }

  if (state === "ready") {
    const ms = Math.round(performance.now() - readyAt);
    setState("result");
    area.dispatchEvent(new CustomEvent("reaction-result", { detail: { ms } }));
  }
}

startBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  startRound();
});

failRetryBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  setState("idle");
});

retryBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  setState("idle");
});

area.addEventListener("click", handleAreaClick);

export { area };

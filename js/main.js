// 앱 진입점. 게임 상태 머신을 초기화하고, 측정 결과가 나오면 화면에 표시한다.
import { area } from "./game.js";

const resultMsEl = document.getElementById("result-ms");

area.addEventListener("reaction-result", (e) => {
  const { ms } = e.detail;
  resultMsEl.textContent = `${ms} ms`;
});

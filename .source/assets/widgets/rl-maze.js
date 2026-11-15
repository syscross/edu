(() => {
  const STYLE_ID = "edu-rl-maze-style";
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .edu-rl-root {
        background: #161b22;
        border: 1px solid #30363d;
        border-radius: 10px;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, "Noto Sans KR", sans-serif;
        color: #c9d1d9;
        user-select: none;
        margin: 18px 0;
      }
      .edu-rl-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 9px 14px;
        background: #0d1117;
        border-bottom: 1px solid #21262d;
        font-size: 12px;
        flex-wrap: wrap;
      }
      .edu-rl-stats {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        font-family: "Noto Sans Mono", ui-monospace, monospace;
      }
      .edu-rl-stat b {
        color: #f0f6fc;
      }
      .edu-rl-stat.is-pos b {
        color: #3fb950;
      }
      .edu-rl-stat.is-neg b {
        color: #f85149;
      }
      .edu-rl-log {
        padding: 6px 14px;
        background: #0b0f14;
        border-bottom: 1px solid #21262d;
        font-size: 12px;
        color: #8b949e;
        height: 30px;
        line-height: 18px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        box-sizing: border-box;
      }
      .edu-rl-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 14px;
        padding: 10px 16px 0;
        font-size: 11.5px;
        color: #8b949e;
      }
      .edu-rl-legend-item {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .edu-rl-body {
        display: grid;
        grid-template-columns: minmax(220px, 270px) 1fr;
        gap: 14px;
        padding: 12px 16px 14px;
        align-items: start;
      }
      @media (max-width: 600px) {
        .edu-rl-body {
          grid-template-columns: 1fr;
        }
      }
      .edu-rl-grid {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        grid-template-rows: repeat(6, 1fr);
        gap: 4px;
        aspect-ratio: 1 / 1;
        width: 100%;
        max-width: 270px;
        margin: 0 auto;
      }
      .edu-rl-cell {
        position: relative;
        min-width: 0;
        min-height: 0;
        background: #0d1117;
        border: 1px solid #21262d;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 17px;
        transition: border-color 0.12s, background-color 0.15s;
        overflow: hidden;
      }
      .edu-rl-cell:hover {
        border-color: #58a6ff;
      }
      .edu-rl-cell.is-wall {
        background: #21262d;
        border-color: #30363d;
      }
      .edu-rl-cell.is-trap {
        background: rgba(248, 81, 73, 0.14);
        border-color: rgba(248, 81, 73, 0.45);
      }
      .edu-rl-cell.is-goal {
        background: rgba(63, 185, 80, 0.16);
        border-color: rgba(63, 185, 80, 0.55);
      }
      .edu-rl-cell.is-start {
        border-color: #388bfd;
      }
      .edu-rl-cell.is-agent {
        box-shadow: inset 0 0 0 2px #58a6ff;
      }
      .edu-rl-tile-icon {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
      }
      .edu-rl-arrow {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 700;
        pointer-events: none;
        opacity: 0.8;
      }
      .edu-rl-qscore {
        position: absolute;
        bottom: 2px;
        right: 3px;
        font-size: 9px;
        line-height: 1;
        font-family: "Noto Sans Mono", ui-monospace, monospace;
        color: #8b949e;
        pointer-events: none;
      }
      .edu-rl-agent-icon {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;
        font-size: 19px;
        line-height: 1;
        pointer-events: none;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.75));
      }
      .edu-rl-panel {
        background: #0d1117;
        border: 1px solid #21262d;
        border-radius: 8px;
        padding: 10px 12px;
      }
      .edu-rl-panel-title {
        font-size: 11px;
        font-weight: 600;
        color: #8b949e;
        margin-bottom: 8px;
      }
      .edu-rl-tools {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 6px;
      }
      .edu-rl-tool,
      .edu-rl-btn {
        background: #161b22;
        color: #c9d1d9;
        border: 1px solid #30363d;
        border-radius: 6px;
        padding: 6px 10px;
        font-size: 12px;
        cursor: pointer;
        transition: background 0.12s, border-color 0.12s;
      }
      .edu-rl-tool:hover,
      .edu-rl-btn:hover:not(:disabled) {
        background: #21262d;
        border-color: #58a6ff;
      }
      .edu-rl-tool.is-active {
        background: rgba(88, 166, 255, 0.15);
        border-color: #58a6ff;
        color: #f0f6fc;
      }
      .edu-rl-btn.is-primary {
        background: #238636;
        border-color: #2ea043;
        color: #ffffff;
      }
      .edu-rl-btn.is-primary:hover:not(:disabled) {
        background: #2ea043;
        border-color: #3fb950;
      }
      .edu-rl-hint {
        font-size: 11.5px;
        color: #8b949e;
        line-height: 1.5;
        margin-top: 8px;
      }
      .edu-rl-controls {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px 14px;
        padding: 10px 14px;
        border-top: 1px solid #21262d;
        background: #0d1117;
        flex-wrap: wrap;
      }
      .edu-rl-slider {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: #8b949e;
      }
      .edu-rl-slider input {
        width: 82px;
        accent-color: #58a6ff;
      }
      .edu-rl-slider-val {
        font-family: "Noto Sans Mono", ui-monospace, monospace;
        color: #f0f6fc;
        min-width: 24px;
      }
      .edu-rl-btns {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }
    `;
    document.head.appendChild(style);
  }

  const SIZE = 6;
  const ACTIONS = [
    { dr: -1, dc: 0, arrow: "↑" },
    { dr: 0, dc: 1, arrow: "→" },
    { dr: 1, dc: 0, arrow: "↓" },
    { dr: 0, dc: -1, arrow: "←" },
  ];

  // 0: empty, 1: wall, 2: trap, 3: goal
  const DEFAULT_GRID = [
    [0, 0, 0, 1, 0, 0],
    [0, 1, 0, 1, 0, 2],
    [0, 1, 0, 0, 0, 0],
    [0, 2, 1, 1, 0, 1],
    [0, 0, 0, 2, 0, 0],
    [0, 1, 0, 0, 0, 3],
  ];

  function cloneDefaultGrid() {
    return DEFAULT_GRID.map((row) => row.slice());
  }

  function mountWidget(container) {
    const root = document.createElement("div");
    root.className = "edu-rl-root";

    // Header
    const header = document.createElement("div");
    header.className = "edu-rl-header";

    const stats = document.createElement("div");
    stats.className = "edu-rl-stats";
    const epStat = document.createElement("span");
    epStat.className = "edu-rl-stat";
    const winStat = document.createElement("span");
    winStat.className = "edu-rl-stat is-pos";
    const scoreStat = document.createElement("span");
    scoreStat.className = "edu-rl-stat";
    const epsStat = document.createElement("span");
    epsStat.className = "edu-rl-stat";
    stats.append(epStat, winStat, scoreStat, epsStat);
    header.append(stats);

    const logEl = document.createElement("div");
    logEl.className = "edu-rl-log";
    logEl.textContent = "아무것도 모르는 상태입니다. 자동 또는 50판 학습을 눌러보세요.";

    // Legend above grid
    const legend = document.createElement("div");
    legend.className = "edu-rl-legend";
    legend.innerHTML = `
      <span class="edu-rl-legend-item">🤖 로봇(출발)</span>
      <span class="edu-rl-legend-item">💎 목표(+100)</span>
      <span class="edu-rl-legend-item">⚡ 함정(-50)</span>
      <span class="edu-rl-legend-item">🧱 벽(-6)</span>
      <span class="edu-rl-legend-item">↑↓←→·숫자: 로봇이 기억한 방향과 예상 점수</span>
    `;

    // Body
    const body = document.createElement("div");
    body.className = "edu-rl-body";

    const gridEl = document.createElement("div");
    gridEl.className = "edu-rl-grid";

    // Map editor panel
    const mapPanel = document.createElement("div");
    mapPanel.className = "edu-rl-panel";
    mapPanel.innerHTML = `<div class="edu-rl-panel-title">맵 직접 고치기 (칸 클릭)</div>`;
    const toolsWrap = document.createElement("div");
    toolsWrap.className = "edu-rl-tools";

    const toolDefs = [
      { id: 1, label: "🧱 벽 세우기" },
      { id: 2, label: "⚡ 함정 (-50)" },
      { id: 3, label: "💎 목표 (+100)" },
      { id: 0, label: "🧹 지우기" },
    ];
    let activeTool = 1;
    const toolBtns = toolDefs.map((t) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = `edu-rl-tool${t.id === activeTool ? " is-active" : ""}`;
      b.textContent = t.label;
      b.addEventListener("click", () => {
        activeTool = t.id;
        toolBtns.forEach((btn, idx) => {
          btn.classList.toggle("is-active", toolDefs[idx].id === activeTool);
        });
      });
      toolsWrap.appendChild(b);
      return b;
    });
    const mapHint = document.createElement("div");
    mapHint.className = "edu-rl-hint";
    mapHint.textContent =
      "빈 칸을 한 걸음 걸을 때마다 -1점, 벽은 -6점, 함정은 -50점입니다. 길을 다 찾은 뒤 벽으로 막아보면 새 길을 다시 배웁니다.";
    mapPanel.append(toolsWrap, mapHint);

    body.append(gridEl, mapPanel);

    // Controls
    const controls = document.createElement("div");
    controls.className = "edu-rl-controls";

    const speedWrap = document.createElement("label");
    speedWrap.className = "edu-rl-slider";
    speedWrap.innerHTML = `<span>속도</span><input type="range" min="1" max="5" step="1" value="3"><span class="edu-rl-slider-val">3x</span>`;
    const speedInput = speedWrap.querySelector("input");
    const speedVal = speedWrap.querySelector(".edu-rl-slider-val");

    const btnsWrap = document.createElement("div");
    btnsWrap.className = "edu-rl-btns";

    const stepBtn = document.createElement("button");
    stepBtn.type = "button";
    stepBtn.className = "edu-rl-btn";
    stepBtn.textContent = "1걸음";

    const autoBtn = document.createElement("button");
    autoBtn.type = "button";
    autoBtn.className = "edu-rl-btn is-primary";
    autoBtn.textContent = "자동";

    const fastBtn = document.createElement("button");
    fastBtn.type = "button";
    fastBtn.className = "edu-rl-btn";
    fastBtn.textContent = "50판 학습";

    const resetBrainBtn = document.createElement("button");
    resetBrainBtn.type = "button";
    resetBrainBtn.className = "edu-rl-btn";
    resetBrainBtn.textContent = "뇌 초기화";

    const resetMapBtn = document.createElement("button");
    resetMapBtn.type = "button";
    resetMapBtn.className = "edu-rl-btn";
    resetMapBtn.textContent = "맵 초기화";

    btnsWrap.append(stepBtn, autoBtn, fastBtn, resetBrainBtn, resetMapBtn);
    controls.append(speedWrap, btnsWrap);

    root.append(header, logEl, legend, body, controls);
    container.innerHTML = "";
    container.appendChild(root);

    // State
    let grid = cloneDefaultGrid();
    let q = new Float64Array(SIZE * SIZE * 4);
    let agentR = 0;
    let agentC = 0;
    let episodes = 0;
    let wins = 0;
    let epScore = 0;
    let epSteps = 0;
    let epsilon = 0.85;
    let autoTimer = null;

    const ALPHA = 0.25;
    const GAMMA = 0.9;
    const MAX_STEPS = 45;

    const cells = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const cell = document.createElement("div");
        cell.className = "edu-rl-cell";

        const tileIcon = document.createElement("span");
        tileIcon.className = "edu-rl-tile-icon";

        const arrowEl = document.createElement("span");
        arrowEl.className = "edu-rl-arrow";

        const scoreEl = document.createElement("span");
        scoreEl.className = "edu-rl-qscore";

        const botEl = document.createElement("span");
        botEl.className = "edu-rl-agent-icon";
        botEl.textContent = "🤖";
        botEl.style.display = "none";

        cell.append(tileIcon, arrowEl, scoreEl, botEl);

        cell.addEventListener("click", () => {
          if (r === 0 && c === 0) return;
          grid[r][c] = grid[r][c] === activeTool ? 0 : activeTool;
          if (agentR === r && agentC === c && grid[r][c] === 1) {
            agentR = 0;
            agentC = 0;
          }
          render();
        });
        gridEl.appendChild(cell);
        cells.push({ r, c, el: cell, tileIcon, arrowEl, scoreEl, botEl });
      }
    }

    function qIdx(r, c, a) {
      return (r * SIZE + c) * 4 + a;
    }

    function maxQ(r, c) {
      let m = -Infinity;
      for (let a = 0; a < 4; a++) {
        const v = q[qIdx(r, c, a)];
        if (v > m) m = v;
      }
      return m;
    }

    function bestAction(r, c) {
      let bestVal = -Infinity;
      let candidates = [];
      for (let a = 0; a < 4; a++) {
        const v = q[qIdx(r, c, a)];
        if (v > bestVal + 1e-9) {
          bestVal = v;
          candidates = [a];
        } else if (Math.abs(v - bestVal) <= 1e-9) {
          candidates.push(a);
        }
      }
      return candidates[Math.floor(Math.random() * candidates.length)];
    }

    function chooseAction(r, c) {
      if (Math.random() < epsilon) {
        return Math.floor(Math.random() * 4);
      }
      return bestAction(r, c);
    }

    function finishEpisode(msg) {
      episodes++;
      epsilon = Math.max(0.06, epsilon * 0.94);
      agentR = 0;
      agentC = 0;
      epScore = 0;
      epSteps = 0;
      if (msg) logEl.textContent = msg;
    }

    function stepEnv(silent) {
      const r = agentR;
      const c = agentC;
      const a = chooseAction(r, c);
      const nr = r + ACTIONS[a].dr;
      const nc = c + ACTIONS[a].dc;

      let nextR = nr;
      let nextC = nc;
      let reward = -1;
      let done = false;
      let msg = "";

      if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE || grid[nr][nc] === 1) {
        nextR = r;
        nextC = c;
        reward = -6;
        msg = "벽에 부딪혀 -6점!";
      } else if (grid[nr][nc] === 2) {
        reward = -50;
        done = true;
        msg = "함정(⚡)에 빠져 -50점! 처음부터 다시 시작합니다.";
      } else if (grid[nr][nc] === 3) {
        reward = 100;
        done = true;
        wins++;
        msg = `목표(💎) 도착! +100점 획득 (${epSteps + 1}걸음)`;
      } else {
        msg = `${ACTIONS[a].arrow} 이동 (-1점)`;
      }

      const oldQ = q[qIdx(r, c, a)];
      const target = done ? reward : reward + GAMMA * maxQ(nextR, nextC);
      q[qIdx(r, c, a)] = oldQ + ALPHA * (target - oldQ);

      epScore += reward;
      epSteps++;
      agentR = nextR;
      agentC = nextC;

      if (done) {
        finishEpisode(msg);
      } else if (epSteps >= MAX_STEPS) {
        finishEpisode(`45걸음 안에 못 찾아 종료 (점수 ${epScore})`);
      } else if (!silent) {
        logEl.textContent = msg;
      }
    }

    function render() {
      epStat.innerHTML = `시도 <b>${episodes}</b>`;
      winStat.innerHTML = `성공 <b>${wins}</b>`;
      scoreStat.className = `edu-rl-stat ${epScore > 0 ? "is-pos" : epScore < 0 ? "is-neg" : ""}`;
      scoreStat.innerHTML = `현재점수 <b>${epScore > 0 ? `+${epScore}` : epScore}</b>`;
      epsStat.innerHTML = `탐험 <b>${Math.round(epsilon * 100)}%</b>`;

      for (const cellObj of cells) {
        const { r, c, el, tileIcon, arrowEl, scoreEl, botEl } = cellObj;
        const type = grid[r][c];
        const isAgent = r === agentR && c === agentC;

        el.className = "edu-rl-cell";
        if (r === 0 && c === 0) el.classList.add("is-start");
        if (isAgent) el.classList.add("is-agent");
        el.style.backgroundColor = "";

        if (type === 1) {
          el.classList.add("is-wall");
          tileIcon.textContent = "🧱";
          arrowEl.textContent = "";
          scoreEl.textContent = "";
        } else if (type === 2) {
          el.classList.add("is-trap");
          tileIcon.textContent = "⚡";
          arrowEl.textContent = "";
          scoreEl.textContent = "";
        } else if (type === 3) {
          el.classList.add("is-goal");
          tileIcon.textContent = "💎";
          arrowEl.textContent = "";
          scoreEl.textContent = "";
        } else {
          tileIcon.textContent = "";
          let bestA = 0;
          let bestV = -Infinity;
          let allZero = true;
          for (let a = 0; a < 4; a++) {
            const v = q[qIdx(r, c, a)];
            if (Math.abs(v) > 0.05) allZero = false;
            if (v > bestV) {
              bestV = v;
              bestA = a;
            }
          }
          if (!allZero && !isAgent) {
            const intensity = Math.min(0.45, Math.abs(bestV) / 110);
            if (bestV > 0) {
              el.style.backgroundColor = `rgba(63, 185, 80, ${intensity.toFixed(2)})`;
            } else if (bestV < 0) {
              el.style.backgroundColor = `rgba(248, 81, 73, ${intensity.toFixed(2)})`;
            }
            arrowEl.style.color = bestV >= 0 ? "#3fb950" : "#f85149";
            arrowEl.textContent = ACTIONS[bestA].arrow;
            scoreEl.textContent = Math.round(bestV);
          } else {
            arrowEl.textContent = "";
            scoreEl.textContent = "";
          }
        }

        botEl.style.display = isAgent ? "flex" : "none";
      }
    }

    function stopAuto() {
      if (autoTimer) {
        clearTimeout(autoTimer);
        autoTimer = null;
        autoBtn.textContent = "자동";
      }
    }

    function getSpeedMs() {
      return 430 - Number(speedInput.value) * 75;
    }

    speedInput.addEventListener("input", () => {
      speedVal.textContent = `${speedInput.value}x`;
    });

    stepBtn.addEventListener("click", () => {
      stopAuto();
      stepEnv(false);
      render();
    });

    autoBtn.addEventListener("click", () => {
      if (autoTimer) {
        stopAuto();
        return;
      }
      autoBtn.textContent = "멈추기";
      const tick = () => {
        if (!autoTimer) return;
        stepEnv(false);
        render();
        autoTimer = setTimeout(tick, getSpeedMs());
      };
      autoTimer = setTimeout(tick, 0);
    });

    fastBtn.addEventListener("click", () => {
      stopAuto();
      const targetEp = episodes + 50;
      let guard = 0;
      while (episodes < targetEp && guard < 3000) {
        stepEnv(true);
        guard++;
      }
      logEl.textContent = "50판 학습 완료! 이제 로봇이 길을 어떻게 기억했는지 보세요.";
      render();
    });

    resetBrainBtn.addEventListener("click", () => {
      stopAuto();
      q = new Float64Array(SIZE * SIZE * 4);
      agentR = 0;
      agentC = 0;
      episodes = 0;
      wins = 0;
      epScore = 0;
      epSteps = 0;
      epsilon = 0.85;
      speedInput.value = "3";
      speedVal.textContent = "3x";
      logEl.textContent = "로봇의 기억을 초기화했습니다. 다시 아무것도 모릅니다.";
      render();
    });

    resetMapBtn.addEventListener("click", () => {
      stopAuto();
      grid = cloneDefaultGrid();
      agentR = 0;
      agentC = 0;
      epScore = 0;
      epSteps = 0;
      logEl.textContent = "기본 맵으로 되돌렸습니다.";
      render();
    });

    render();
  }

  function init() {
    document.querySelectorAll('[data-widget="rl-maze"]').forEach(mountWidget);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

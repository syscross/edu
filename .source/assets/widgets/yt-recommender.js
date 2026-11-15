(() => {
  const STYLE_ID = "edu-yt-rec-style";
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .edu-yt-root {
        background: #161b22;
        border: 1px solid #30363d;
        border-radius: 10px;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, "Noto Sans KR", sans-serif;
        color: #c9d1d9;
        user-select: none;
        margin: 18px 0;
      }
      .edu-yt-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 10px 14px;
        background: #0d1117;
        border-bottom: 1px solid #21262d;
        font-size: 12px;
        flex-wrap: wrap;
      }
      .edu-yt-math {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        font-family: "Noto Sans Mono", ui-monospace, monospace;
      }
      .edu-yt-math b {
        color: #58a6ff;
      }
      .edu-yt-formula {
        color: #8b949e;
      }
      .edu-yt-reset {
        background: #161b22;
        color: #c9d1d9;
        border: 1px solid #30363d;
        border-radius: 6px;
        padding: 5px 10px;
        font-size: 12px;
        cursor: pointer;
      }
      .edu-yt-reset:hover {
        background: #21262d;
        border-color: #58a6ff;
      }
      .edu-yt-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 14px;
        padding: 10px 16px 0;
        font-size: 11.5px;
        color: #8b949e;
      }
      .edu-yt-dot-swatch {
        display: inline-block;
        width: 9px;
        height: 9px;
        border-radius: 50%;
        margin-right: 4px;
        vertical-align: middle;
      }
      .edu-yt-body {
        display: grid;
        grid-template-columns: minmax(230px, 280px) 1fr;
        gap: 16px;
        padding: 12px 16px 16px;
        align-items: stretch;
      }
      @media (max-width: 640px) {
        .edu-yt-body {
          grid-template-columns: 1fr;
        }
      }
      .edu-yt-canvas-wrap {
        position: relative;
        width: 100%;
        max-width: 280px;
        margin: 0 auto;
        aspect-ratio: 1 / 1;
        background: #0d1117;
        border: 1px solid #21262d;
        border-radius: 8px;
        overflow: hidden;
      }
      .edu-yt-canvas {
        width: 100%;
        height: 100%;
        display: block;
      }
      .edu-yt-tooltip {
        position: absolute;
        left: 8px;
        bottom: 8px;
        right: 8px;
        background: rgba(13, 17, 23, 0.9);
        border: 1px solid #30363d;
        border-radius: 6px;
        padding: 4px 8px;
        font-size: 11px;
        color: #f0f6fc;
        pointer-events: none;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        opacity: 0;
        transition: opacity 0.12s;
      }
      .edu-yt-tooltip.is-visible {
        opacity: 1;
      }
      .edu-yt-right {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 12px;
      }
      .edu-yt-card {
        background: #0d1117;
        border: 1px solid #30363d;
        border-radius: 10px;
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .edu-yt-card-badge {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 11px;
        color: #8b949e;
        font-family: "Noto Sans Mono", ui-monospace, monospace;
      }
      .edu-yt-card-badge b {
        color: #58a6ff;
      }
      .edu-yt-card-title {
        font-size: 17px;
        font-weight: 700;
        color: #f0f6fc;
        line-height: 1.35;
      }
      .edu-yt-card-meta {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        font-size: 11.5px;
        color: #8b949e;
      }
      .edu-yt-tag {
        background: #161b22;
        border: 1px solid #21262d;
        border-radius: 999px;
        padding: 2px 8px;
      }
      .edu-yt-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: 4px;
      }
      .edu-yt-act {
        background: #161b22;
        border: 1px solid #30363d;
        border-radius: 8px;
        padding: 10px 12px;
        font-size: 14px;
        font-weight: 600;
        color: #f0f6fc;
        cursor: pointer;
        transition: background 0.12s, border-color 0.12s;
      }
      .edu-yt-act.is-like:hover {
        background: rgba(63, 185, 80, 0.18);
        border-color: #3fb950;
        color: #3fb950;
      }
      .edu-yt-act.is-dislike:hover {
        background: rgba(248, 81, 73, 0.18);
        border-color: #f85149;
        color: #f85149;
      }
      .edu-yt-prev {
        background: #0b0f14;
        border: 1px solid #21262d;
        border-radius: 8px;
        padding: 9px 12px;
        font-size: 12px;
        color: #8b949e;
        min-height: 40px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .edu-yt-prev-text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .edu-yt-prev-badge {
        font-size: 11px;
        font-weight: 600;
        padding: 2px 7px;
        border-radius: 999px;
        flex-shrink: 0;
      }
      .edu-yt-prev-badge.is-like {
        background: rgba(63, 185, 80, 0.16);
        color: #3fb950;
      }
      .edu-yt-prev-badge.is-dislike {
        background: rgba(248, 81, 73, 0.16);
        color: #f85149;
      }
    `;
    document.head.appendChild(style);
  }

  const VIDEOS = [
    { id: 0, title: "파이썬 1분 핵심 요약", x: -0.75, y: 0.72, tags: ["지식", "짧음"] },
    { id: 1, title: "영어 단어 30초 암기", x: -0.52, y: 0.85, tags: ["지식", "짧음"] },
    { id: 2, title: "고양이 댄스 쇼츠", x: 0.80, y: 0.84, tags: ["오락", "짧음"] },
    { id: 3, title: "매운 떡볶이 1분 먹방", x: 0.62, y: 0.56, tags: ["오락", "짧음"] },
    { id: 4, title: "예능 레전드 클립", x: 0.48, y: 0.22, tags: ["오락", "가벼움"] },
    { id: 5, title: "우주 다큐멘터리 1시간", x: -0.84, y: -0.78, tags: ["지식", "긴영상"] },
    { id: 6, title: "현대 물리학 심층 특강", x: -0.68, y: -0.56, tags: ["지식", "긴영상"] },
    { id: 7, title: "경제 뉴스 분석 리포트", x: -0.44, y: -0.38, tags: ["지식", "깊이"] },
    { id: 8, title: "공포 게임 풀버전 2시간", x: 0.82, y: -0.74, tags: ["오락", "긴영상"] },
    { id: 9, title: "아이돌 콘서트 풀캠 모음", x: 0.64, y: -0.40, tags: ["오락", "긴영상"] },
  ];

  function mountWidget(container) {
    const root = document.createElement("div");
    root.className = "edu-yt-root";

    // Header
    const header = document.createElement("div");
    header.className = "edu-yt-header";

    const mathEl = document.createElement("div");
    mathEl.className = "edu-yt-math";
    const wText = document.createElement("span");
    const formulaText = document.createElement("span");
    formulaText.className = "edu-yt-formula";
    formulaText.textContent = "점수 = w₁·x + w₂·y";
    mathEl.append(wText, formulaText);

    const resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.className = "edu-yt-reset";
    resetBtn.textContent = "초기화";

    header.append(mathEl, resetBtn);

    // Legend
    const legend = document.createElement("div");
    legend.className = "edu-yt-legend";
    legend.innerHTML = `
      <span><i class="edu-yt-dot-swatch" style="background:#3fb950"></i>좋아요</span>
      <span><i class="edu-yt-dot-swatch" style="background:#f85149"></i>싫어요</span>
      <span><i class="edu-yt-dot-swatch" style="background:#8b949e"></i>미평가</span>
      <span><i class="edu-yt-dot-swatch" style="background:#f0f6fc"></i>현재 추천</span>
      <span><i class="edu-yt-dot-swatch" style="background:#58a6ff"></i>내 취향 화살표(w)</span>
    `;

    // Body
    const body = document.createElement("div");
    body.className = "edu-yt-body";

    const canvasWrap = document.createElement("div");
    canvasWrap.className = "edu-yt-canvas-wrap";
    const canvas = document.createElement("canvas");
    canvas.className = "edu-yt-canvas";
    const tooltip = document.createElement("div");
    tooltip.className = "edu-yt-tooltip";
    canvasWrap.append(canvas, tooltip);

    const right = document.createElement("div");
    right.className = "edu-yt-right";

    const card = document.createElement("div");
    card.className = "edu-yt-card";
    const cardBadge = document.createElement("div");
    cardBadge.className = "edu-yt-card-badge";
    const cardTitle = document.createElement("div");
    cardTitle.className = "edu-yt-card-title";
    const cardMeta = document.createElement("div");
    cardMeta.className = "edu-yt-card-meta";

    const actions = document.createElement("div");
    actions.className = "edu-yt-actions";
    const likeBtn = document.createElement("button");
    likeBtn.type = "button";
    likeBtn.className = "edu-yt-act is-like";
    likeBtn.textContent = "👍 좋아요";
    const dislikeBtn = document.createElement("button");
    dislikeBtn.type = "button";
    dislikeBtn.className = "edu-yt-act is-dislike";
    dislikeBtn.textContent = "👎 싫어요";
    actions.append(likeBtn, dislikeBtn);

    card.append(cardBadge, cardTitle, cardMeta, actions);

    const prevBox = document.createElement("div");
    prevBox.className = "edu-yt-prev";
    const prevText = document.createElement("span");
    prevText.className = "edu-yt-prev-text";
    prevText.textContent = "이전 평가: 아직 없음";
    const prevBadge = document.createElement("span");
    prevBadge.className = "edu-yt-prev-badge";
    prevBadge.style.display = "none";
    prevBox.append(prevText, prevBadge);

    right.append(card, prevBox);
    body.append(canvasWrap, right);
    root.append(header, legend, body);
    container.innerHTML = "";
    container.appendChild(root);

    // State
    const ratings = new Int8Array(VIDEOS.length);
    let w1 = 0;
    let w2 = 0;
    let currentId = Math.floor(Math.random() * VIDEOS.length);
    let prevAction = null; // { title, vote, score }
    let hoveredId = -1;

    function recomputeWeights() {
      let sx = 0;
      let sy = 0;
      for (let i = 0; i < VIDEOS.length; i++) {
        if (ratings[i] === 0) continue;
        sx += ratings[i] * 0.4 * VIDEOS[i].x;
        sy += ratings[i] * 0.4 * VIDEOS[i].y;
      }
      const norm = Math.hypot(sx, sy);
      if (norm > 1.0) {
        sx /= norm;
        sy /= norm;
      }
      w1 = sx;
      w2 = sy;
    }

    function scoreVideo(v) {
      return w1 * v.x + w2 * v.y;
    }

    function getProbabilities() {
      const temp = 3.0;
      const logits = VIDEOS.map((v) => scoreVideo(v) * temp);
      const maxL = Math.max(...logits);
      const exps = logits.map((l) => Math.exp(l - maxL));
      const sum = exps.reduce((a, b) => a + b, 0);
      return exps.map((e) => e / sum);
    }

    function pickNextVideo(excludeId) {
      const probs = getProbabilities();
      const pool = VIDEOS.map((v, i) => ({ id: v.id, p: v.id === excludeId ? 0 : probs[i] }));
      const total = pool.reduce((a, b) => a + b.p, 0);
      let r = Math.random() * total;
      for (const item of pool) {
        r -= item.p;
        if (r <= 0) return item.id;
      }
      return pool[0].id;
    }

    function drawSpace() {
      const rect = canvas.getBoundingClientRect();
      const size = Math.max(220, Math.round(rect.width || 270));
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== size * dpr || canvas.height !== size * dpr) {
        canvas.width = size * dpr;
        canvas.height = size * dpr;
      }
      const ctx = canvas.getContext("2d");
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, size, size);

      const pad = 26;
      const plot = size - pad * 2;
      const toPx = (x) => pad + ((x + 1) / 2) * plot;
      const toPy = (y) => pad + ((1 - y) / 2) * plot;

      // Background decision field if |w| > 0.02
      const wLen = Math.hypot(w1, w2);
      if (wLen > 0.02) {
        const step = 6;
        for (let py = pad; py < pad + plot; py += step) {
          const y = 1 - ((py - pad) / plot) * 2;
          for (let px = pad; px < pad + plot; px += step) {
            const x = ((px - pad) / plot) * 2 - 1;
            const s = w1 * x + w2 * y;
            const alpha = Math.min(0.24, Math.abs(s) * 0.24);
            ctx.fillStyle =
              s >= 0
                ? `rgba(63, 185, 80, ${alpha.toFixed(3)})`
                : `rgba(248, 81, 73, ${alpha.toFixed(3)})`;
            ctx.fillRect(px, py, step, step);
          }
        }
      }

      // Axes
      ctx.strokeStyle = "#30363d";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad, size / 2);
      ctx.lineTo(size - pad, size / 2);
      ctx.moveTo(size / 2, pad);
      ctx.lineTo(size / 2, size - pad);
      ctx.stroke();

      // Axis labels
      ctx.fillStyle = "#8b949e";
      ctx.font = "10px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("짧음·빠름 (+y)", size / 2, 14);
      ctx.fillText("깊이·긴영상 (-y)", size / 2, size - 8);
      ctx.textAlign = "left";
      ctx.fillText("지식", 6, size / 2 - 5);
      ctx.textAlign = "right";
      ctx.fillText("오락", size - 6, size / 2 - 5);

      // Decision boundary w1*x + w2*y = 0
      if (wLen > 0.02) {
        ctx.save();
        ctx.strokeStyle = "rgba(240, 246, 252, 0.45)";
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.2;
        const dx = -w2 / wLen;
        const dy = w1 / wLen;
        ctx.beginPath();
        ctx.moveTo(toPx(dx * 1.4), toPy(dy * 1.4));
        ctx.lineTo(toPx(-dx * 1.4), toPy(-dy * 1.4));
        ctx.stroke();
        ctx.restore();
      }

      // Videos as dots
      for (const v of VIDEOS) {
        const px = toPx(v.x);
        const py = toPy(v.y);
        const rState = ratings[v.id];
        const isCurrent = v.id === currentId;
        const isHover = v.id === hoveredId;

        if (isCurrent) {
          ctx.beginPath();
          ctx.arc(px, py, 9, 0, Math.PI * 2);
          ctx.strokeStyle = "#f0f6fc";
          ctx.lineWidth = 1.8;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(px, py, isHover || isCurrent ? 6 : 5, 0, Math.PI * 2);
        if (rState === 1) {
          ctx.fillStyle = "#3fb950";
        } else if (rState === -1) {
          ctx.fillStyle = "#f85149";
        } else {
          ctx.fillStyle = "#8b949e";
        }
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#0d1117";
        ctx.stroke();
      }

      // Preference vector w arrow
      if (wLen > 0.02) {
        const ox = toPx(0);
        const oy = toPy(0);
        const tx = toPx(w1);
        const ty = toPy(w2);

        ctx.strokeStyle = "#58a6ff";
        ctx.fillStyle = "#58a6ff";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(tx, ty);
        ctx.stroke();

        const ang = Math.atan2(ty - oy, tx - ox);
        const head = 8;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx - head * Math.cos(ang - 0.45), ty - head * Math.sin(ang - 0.45));
        ctx.lineTo(tx - head * Math.cos(ang + 0.45), ty - head * Math.sin(ang + 0.45));
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    }

    function render() {
      const sign1 = w1 >= 0 ? "+" : "";
      const sign2 = w2 >= 0 ? "+" : "";
      wText.innerHTML = `내 취향 <b>w = (${sign1}${w1.toFixed(2)}, ${sign2}${w2.toFixed(2)})</b>`;

      const probs = getProbabilities();
      const v = VIDEOS[currentId];
      const sc = scoreVideo(v);
      const probPct = Math.round(probs[currentId] * 100);

      cardBadge.innerHTML = `<span>지금 추천된 영상</span><span>추천 확률 <b>${probPct}%</b></span>`;
      cardTitle.textContent = v.title;
      cardMeta.innerHTML = `
        <span class="edu-yt-tag">${v.tags[0]}</span>
        <span class="edu-yt-tag">${v.tags[1]}</span>
        <span class="edu-yt-tag">좌표 (${v.x.toFixed(2)}, ${v.y.toFixed(2)})</span>
        <span class="edu-yt-tag">점수 ${sc >= 0 ? "+" : ""}${sc.toFixed(2)}</span>
      `;

      if (prevAction) {
        prevText.textContent = `이전: ${prevAction.title} (당시 점수 ${prevAction.score >= 0 ? "+" : ""}${prevAction.score.toFixed(2)})`;
        prevBadge.style.display = "inline-block";
        prevBadge.className = `edu-yt-prev-badge ${prevAction.vote === 1 ? "is-like" : "is-dislike"}`;
        prevBadge.textContent = prevAction.vote === 1 ? "👍 좋아요" : "👎 싫어요";
      } else {
        prevText.textContent = "이전 평가: 아직 없음";
        prevBadge.style.display = "none";
      }

      drawSpace();
    }

    function handleVote(vote) {
      const v = VIDEOS[currentId];
      const prevScore = scoreVideo(v);
      ratings[currentId] = vote;
      prevAction = { title: v.title, vote, score: prevScore };
      recomputeWeights();
      currentId = pickNextVideo(currentId);
      render();
    }

    likeBtn.addEventListener("click", () => handleVote(1));
    dislikeBtn.addEventListener("click", () => handleVote(-1));

    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const size = rect.width;
      const pad = 26;
      const plot = size - pad * 2;

      let found = null;
      let bestDist = 14;
      for (const v of VIDEOS) {
        const px = pad + ((v.x + 1) / 2) * plot;
        const py = pad + ((1 - v.y) / 2) * plot;
        const d = Math.hypot(mx - px, my - py);
        if (d < bestDist) {
          bestDist = d;
          found = v;
        }
      }

      if (found) {
        hoveredId = found.id;
        tooltip.textContent = `${found.title} (${found.x.toFixed(2)}, ${found.y.toFixed(2)})`;
        tooltip.classList.add("is-visible");
      } else {
        hoveredId = -1;
        tooltip.classList.remove("is-visible");
      }
      drawSpace();
    });

    canvas.addEventListener("mouseleave", () => {
      hoveredId = -1;
      tooltip.classList.remove("is-visible");
      drawSpace();
    });

    resetBtn.addEventListener("click", () => {
      ratings.fill(0);
      prevAction = null;
      recomputeWeights();
      currentId = Math.floor(Math.random() * VIDEOS.length);
      render();
    });

    window.addEventListener("resize", drawSpace);
    render();
  }

  function init() {
    document.querySelectorAll('[data-widget="yt-recommender"]').forEach(mountWidget);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

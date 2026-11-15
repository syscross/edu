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
        padding: 4px 10px;
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
        grid-template-columns: minmax(240px, 300px) 1fr;
        gap: 16px;
        padding: 12px 16px 16px;
        align-items: start;
      }
      @media (max-width: 660px) {
        .edu-yt-body {
          grid-template-columns: 1fr;
        }
      }
      .edu-yt-canvas-wrap {
        position: relative;
        width: 100%;
        max-width: 300px;
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
      .edu-yt-feed {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .edu-yt-feed-title {
        font-size: 11.5px;
        font-weight: 600;
        color: #8b949e;
        margin-bottom: 2px;
      }
      .edu-yt-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 6px 10px;
        background: #0d1117;
        border: 1px solid #21262d;
        border-radius: 7px;
        transition: border-color 0.12s, background 0.12s;
      }
      .edu-yt-item.is-like {
        border-color: rgba(63, 185, 80, 0.45);
      }
      .edu-yt-item.is-dislike {
        border-color: rgba(248, 81, 73, 0.45);
        opacity: 0.78;
      }
      .edu-yt-item-info {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }
      .edu-yt-item-dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        flex-shrink: 0;
        background: #8b949e;
      }
      .edu-yt-item.is-like .edu-yt-item-dot {
        background: #3fb950;
      }
      .edu-yt-item.is-dislike .edu-yt-item-dot {
        background: #f85149;
      }
      .edu-yt-item-title {
        font-size: 12.5px;
        color: #f0f6fc;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .edu-yt-item-right {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
      }
      .edu-yt-score {
        font-family: "Noto Sans Mono", ui-monospace, monospace;
        font-size: 11px;
        min-width: 44px;
        text-align: right;
        color: #8b949e;
      }
      .edu-yt-score.is-pos {
        color: #3fb950;
      }
      .edu-yt-score.is-neg {
        color: #f85149;
      }
      .edu-yt-act {
        background: #161b22;
        border: 1px solid #30363d;
        border-radius: 5px;
        padding: 3px 7px;
        font-size: 12px;
        cursor: pointer;
        line-height: 1.2;
      }
      .edu-yt-act:hover {
        background: #21262d;
      }
      .edu-yt-act.is-like-on {
        background: rgba(63, 185, 80, 0.2);
        border-color: #3fb950;
      }
      .edu-yt-act.is-dislike-on {
        background: rgba(248, 81, 73, 0.2);
        border-color: #f85149;
      }
    `;
    document.head.appendChild(style);
  }

  const VIDEOS = [
    { id: 0, title: "파이썬 1분 핵심 요약", x: -0.75, y: 0.72 },
    { id: 1, title: "영어 단어 30초 암기", x: -0.52, y: 0.85 },
    { id: 2, title: "고양이 댄스 쇼츠", x: 0.80, y: 0.84 },
    { id: 3, title: "매운 떡볶이 1분 먹방", x: 0.62, y: 0.56 },
    { id: 4, title: "예능 레전드 클립", x: 0.48, y: 0.22 },
    { id: 5, title: "우주 다큐멘터리 1시간", x: -0.84, y: -0.78 },
    { id: 6, title: "현대 물리학 심층 특강", x: -0.68, y: -0.56 },
    { id: 7, title: "경제 뉴스 분석 리포트", x: -0.44, y: -0.38 },
    { id: 8, title: "공포 게임 풀버전 2시간", x: 0.82, y: -0.74 },
    { id: 9, title: "아이돌 콘서트 풀캠 모음", x: 0.64, y: -0.40 },
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

    const feed = document.createElement("div");
    feed.className = "edu-yt-feed";
    const feedTitle = document.createElement("div");
    feedTitle.className = "edu-yt-feed-title";
    feedTitle.textContent = "홈 추천 순위 (점수 높은 순)";
    const feedList = document.createElement("div");
    feedList.className = "edu-yt-feed";
    feed.append(feedTitle, feedList);

    body.append(canvasWrap, feed);
    root.append(header, legend, body);
    container.innerHTML = "";
    container.appendChild(root);

    // State: 0 = neutral, 1 = like, -1 = dislike
    const ratings = new Int8Array(VIDEOS.length);
    let w1 = 0;
    let w2 = 0;
    let hoveredId = -1;

    function recomputeWeights() {
      let sx = 0;
      let sy = 0;
      for (let i = 0; i < VIDEOS.length; i++) {
        if (ratings[i] === 0) continue;
        sx += ratings[i] * 0.35 * VIDEOS[i].x;
        sy += ratings[i] * 0.35 * VIDEOS[i].y;
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

    function drawSpace() {
      const rect = canvas.getBoundingClientRect();
      const size = Math.max(220, Math.round(rect.width || 280));
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
        ctx.beginPath();
        ctx.arc(px, py, hoveredId === v.id ? 7 : 5.5, 0, Math.PI * 2);
        if (rState === 1) {
          ctx.fillStyle = "#3fb950";
        } else if (rState === -1) {
          ctx.fillStyle = "#f85149";
        } else {
          ctx.fillStyle = "#8b949e";
        }
        ctx.fill();
        ctx.lineWidth = hoveredId === v.id ? 2 : 1;
        ctx.strokeStyle = hoveredId === v.id ? "#f0f6fc" : "#0d1117";
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

      const ranked = VIDEOS.map((v) => ({
        v,
        score: scoreVideo(v),
        rating: ratings[v.id],
      })).sort((a, b) => {
        if (Math.abs(b.score - a.score) > 1e-6) return b.score - a.score;
        return a.v.id - b.v.id;
      });

      feedList.innerHTML = "";
      for (const row of ranked) {
        const { v, score, rating } = row;
        const item = document.createElement("div");
        item.className = `edu-yt-item${rating === 1 ? " is-like" : rating === -1 ? " is-dislike" : ""}`;

        const info = document.createElement("div");
        info.className = "edu-yt-item-info";
        const dot = document.createElement("span");
        dot.className = "edu-yt-item-dot";
        const title = document.createElement("span");
        title.className = "edu-yt-item-title";
        title.textContent = v.title;
        info.append(dot, title);

        const right = document.createElement("div");
        right.className = "edu-yt-item-right";

        const scoreEl = document.createElement("span");
        scoreEl.className = `edu-yt-score${score > 0.01 ? " is-pos" : score < -0.01 ? " is-neg" : ""}`;
        scoreEl.textContent = `${score >= 0 ? "+" : ""}${score.toFixed(2)}`;

        const likeBtn = document.createElement("button");
        likeBtn.type = "button";
        likeBtn.className = `edu-yt-act${rating === 1 ? " is-like-on" : ""}`;
        likeBtn.textContent = "👍";
        likeBtn.addEventListener("click", () => {
          ratings[v.id] = ratings[v.id] === 1 ? 0 : 1;
          recomputeWeights();
          render();
        });

        const dislikeBtn = document.createElement("button");
        dislikeBtn.type = "button";
        dislikeBtn.className = `edu-yt-act${rating === -1 ? " is-dislike-on" : ""}`;
        dislikeBtn.textContent = "👎";
        dislikeBtn.addEventListener("click", () => {
          ratings[v.id] = ratings[v.id] === -1 ? 0 : -1;
          recomputeWeights();
          render();
        });

        right.append(scoreEl, likeBtn, dislikeBtn);
        item.append(info, right);

        item.addEventListener("mouseenter", () => {
          hoveredId = v.id;
          drawSpace();
        });
        item.addEventListener("mouseleave", () => {
          hoveredId = -1;
          drawSpace();
        });

        feedList.appendChild(item);
      }

      drawSpace();
    }

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
      recomputeWeights();
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

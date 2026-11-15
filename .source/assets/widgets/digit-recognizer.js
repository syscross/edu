(() => {
  const CSS = `
    .edu-ai-stage {
      width: 100%;
      max-width: 480px;
      margin: 20px auto 28px;
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 14px;
      overflow: hidden;
      user-select: none;
      -webkit-user-select: none;
      box-sizing: border-box;
    }
    .edu-ai-body {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      padding: 16px;
      align-items: stretch;
    }
    .edu-ai-draw-wrap {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .edu-ai-canvas {
      width: 100%;
      aspect-ratio: 1 / 1;
      display: block;
      background: #0d1117;
      border: 1px solid #30363d;
      border-radius: 10px;
      cursor: crosshair;
      touch-action: none;
      box-sizing: border-box;
    }
    .edu-ai-probs {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 3px;
      padding: 8px 10px;
      background: #0d1117;
      border: 1px solid #30363d;
      border-radius: 10px;
      box-sizing: border-box;
    }
    .edu-ai-row {
      display: grid;
      grid-template-columns: 16px 1fr 34px;
      align-items: center;
      gap: 6px;
      font-family: "Noto Sans Mono", ui-monospace, monospace;
      font-size: 12px;
      color: #8b949e;
    }
    .edu-ai-row.is-top {
      color: #f0f6fc;
      font-weight: 700;
    }
    .edu-ai-bar-bg {
      height: 8px;
      background: #161b22;
      border-radius: 999px;
      overflow: hidden;
    }
    .edu-ai-bar-fill {
      height: 100%;
      width: 0%;
      background: #30363d;
      border-radius: 999px;
      transition: width 0.08s ease, background-color 0.08s ease;
    }
    .edu-ai-row.is-top .edu-ai-bar-fill {
      background: #58a6ff;
    }
    .edu-ai-pct {
      text-align: right;
      font-size: 11px;
    }
    .edu-ai-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 9px 14px;
      font-size: 13px;
      color: #8b949e;
      border-top: 1px solid #21262d;
      background: #0d1117;
    }
    .edu-ai-pred {
      font-family: "Noto Sans Mono", ui-monospace, monospace;
      color: #f0f6fc;
      font-weight: 700;
    }
    .edu-ai-clear {
      padding: 5px 12px;
      border: 1px solid #30363d;
      border-radius: 6px;
      background: #161b22;
      color: #c9d1d9;
      font-family: inherit;
      font-size: 12px;
      cursor: pointer;
      touch-action: manipulation;
    }
    .edu-ai-clear:hover {
      border-color: #58a6ff;
      color: #f0f6fc;
    }
    @media (max-width: 420px) {
      .edu-ai-body {
        gap: 10px;
        padding: 12px;
      }
      .edu-ai-probs {
        padding: 6px 8px;
      }
      .edu-ai-row {
        font-size: 11px;
        gap: 4px;
        grid-template-columns: 14px 1fr 30px;
      }
    }
  `;

  if (!document.getElementById("edu-ai-widget-style")) {
    const style = document.createElement("style");
    style.id = "edu-ai-widget-style";
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  let weightsPromise = null;
  function loadWeights() {
    if (!weightsPromise) {
      weightsPromise = fetch("/assets/widgets/mnist-weights.json").then((r) => r.json());
    }
    return weightsPromise;
  }

  function forward(input, model) {
    const { w1, b1, w2, b2 } = model;
    const hiddenSize = b1.length;
    const hidden = new Float32Array(hiddenSize);

    for (let j = 0; j < hiddenSize; j++) {
      let sum = b1[j];
      for (let i = 0; i < input.length; i++) {
        sum += input[i] * w1[i][j];
      }
      hidden[j] = sum > 0 ? sum : 0; // ReLU
    }

    const logits = new Float32Array(10);
    let maxLogit = -Infinity;
    for (let k = 0; k < 10; k++) {
      let sum = b2[k];
      for (let j = 0; j < hiddenSize; j++) {
        sum += hidden[j] * w2[j][k];
      }
      logits[k] = sum;
      if (sum > maxLogit) maxLogit = sum;
    }

    const probs = new Float32Array(10);
    let expSum = 0;
    for (let k = 0; k < 10; k++) {
      const e = Math.exp(logits[k] - maxLogit);
      probs[k] = e;
      expSum += e;
    }
    for (let k = 0; k < 10; k++) {
      probs[k] /= expSum;
    }
    return probs;
  }

  function initWidget(root) {
    if (root.dataset.mounted) return;
    root.dataset.mounted = "1";

    const stage = document.createElement("div");
    stage.className = "edu-ai-stage";

    const body = document.createElement("div");
    body.className = "edu-ai-body";

    const drawWrap = document.createElement("div");
    drawWrap.className = "edu-ai-draw-wrap";

    const canvas = document.createElement("canvas");
    canvas.className = "edu-ai-canvas";
    canvas.width = 196;
    canvas.height = 196;
    canvas.setAttribute("aria-label", "0부터 9까지 숫자를 그리는 캔버스");
    drawWrap.appendChild(canvas);

    const probsBox = document.createElement("div");
    probsBox.className = "edu-ai-probs";

    const rows = [];
    for (let d = 0; d < 10; d++) {
      const row = document.createElement("div");
      row.className = "edu-ai-row";
      row.innerHTML = `
        <span>${d}</span>
        <div class="edu-ai-bar-bg"><div class="edu-ai-bar-fill"></div></div>
        <span class="edu-ai-pct">0%</span>
      `;
      probsBox.appendChild(row);
      rows.push({
        row,
        fill: row.querySelector(".edu-ai-bar-fill"),
        pct: row.querySelector(".edu-ai-pct"),
      });
    }

    body.append(drawWrap, probsBox);

    const footer = document.createElement("div");
    footer.className = "edu-ai-footer";

    const predEl = document.createElement("span");
    predEl.className = "edu-ai-pred";
    predEl.textContent = "여기에 0~9를 그려 보세요";

    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "edu-ai-clear";
    clearBtn.textContent = "지우기";

    footer.append(predEl, clearBtn);
    stage.append(body, footer);
    root.appendChild(stage);

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 15;

    // 14x14 축소 및 중앙 정렬용 오프스크린 캔버스
    const smallCanvas = document.createElement("canvas");
    smallCanvas.width = 14;
    smallCanvas.height = 14;
    const smallCtx = smallCanvas.getContext("2d", { willReadFrequently: true });

    let model = null;
    let drawing = false;
    let hasInk = false;
    let lastPos = null;

    loadWeights().then((m) => {
      model = m;
    });

    function getPos(e) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * canvas.width,
        y: ((e.clientY - rect.top) / rect.height) * canvas.height,
      };
    }

    function extractInput() {
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { data, width, height } = img;

      let minX = width, minY = height, maxX = -1, maxY = -1;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const alpha = data[(y * width + x) * 4 + 3];
          if (alpha > 15) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      if (maxX < minX) return null;

      // MNIST 스타일 중앙 정렬 (14x14 안에 10x10 크기로 비율 유지 배치)
      const bw = maxX - minX + 1;
      const bh = maxY - minY + 1;
      const box = Math.max(bw, bh);
      const scale = 10 / box;
      const dw = bw * scale;
      const dh = bh * scale;
      const dx = (14 - dw) / 2;
      const dy = (14 - dh) / 2;

      smallCtx.clearRect(0, 0, 14, 14);
      smallCtx.drawImage(canvas, minX, minY, bw, bh, dx, dy, dw, dh);

      const smallData = smallCtx.getImageData(0, 0, 14, 14).data;
      const input = new Float32Array(196);
      for (let i = 0; i < 196; i++) {
        input[i] = smallData[i * 4 + 3] / 255.0;
      }
      return input;
    }

    function predict() {
      if (!model || !hasInk) return;
      const input = extractInput();
      if (!input) return;

      const probs = forward(input, model);
      let topDigit = 0;
      for (let d = 1; d < 10; d++) {
        if (probs[d] > probs[topDigit]) topDigit = d;
      }

      for (let d = 0; d < 10; d++) {
        const pct = Math.round(probs[d] * 100);
        rows[d].row.classList.toggle("is-top", d === topDigit);
        rows[d].fill.style.width = `${pct}%`;
        rows[d].pct.textContent = `${pct}%`;
      }

      predEl.textContent = `예측: ${topDigit} (${Math.round(probs[topDigit] * 100)}%)`;
    }

    function clearAll() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hasInk = false;
      for (let d = 0; d < 10; d++) {
        rows[d].row.classList.remove("is-top");
        rows[d].fill.style.width = "0%";
        rows[d].pct.textContent = "0%";
      }
      predEl.textContent = "여기에 0~9를 그려 보세요";
    }

    canvas.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);
      drawing = true;
      hasInk = true;
      lastPos = getPos(e);
      ctx.beginPath();
      ctx.arc(lastPos.x, lastPos.y, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      predict();
    });

    canvas.addEventListener("pointermove", (e) => {
      if (!drawing) return;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      lastPos = pos;
      predict();
    });

    const endDraw = () => {
      if (!drawing) return;
      drawing = false;
      lastPos = null;
      predict();
    };
    canvas.addEventListener("pointerup", endDraw);
    canvas.addEventListener("pointercancel", endDraw);
    clearBtn.addEventListener("click", clearAll);
  }

  document.querySelectorAll('[data-widget="digit-recognizer"]').forEach(initWidget);
})();

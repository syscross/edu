(() => {
  const STYLE_ID = "edu-diff-style";
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .edu-diff-root {
        background: #161b22;
        border: 1px solid #30363d;
        border-radius: 10px;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, "Noto Sans KR", sans-serif;
        color: #c9d1d9;
        user-select: none;
        margin: 18px 0;
      }
      .edu-diff-header {
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
      .edu-diff-stats {
        display: flex;
        gap: 12px;
        font-family: "Noto Sans Mono", ui-monospace, monospace;
      }
      .edu-diff-stats b {
        color: #58a6ff;
      }
      .edu-diff-prompts {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 10px 14px;
        border-bottom: 1px solid #21262d;
        flex-wrap: wrap;
      }
      .edu-diff-prompts-label {
        font-size: 12px;
        color: #8b949e;
        margin-right: 4px;
      }
      .edu-diff-digit {
        width: 28px;
        height: 28px;
        border-radius: 6px;
        border: 1px solid #30363d;
        background: #0d1117;
        color: #c9d1d9;
        font-family: "Noto Sans Mono", ui-monospace, monospace;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.12s, border-color 0.12s;
      }
      .edu-diff-digit:hover {
        border-color: #58a6ff;
      }
      .edu-diff-digit.is-active {
        background: #1f6feb;
        border-color: #58a6ff;
        color: #ffffff;
      }
      .edu-diff-body {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        padding: 16px;
      }
      .edu-diff-canvas-wrap {
        width: 224px;
        height: 224px;
        border: 1px solid #30363d;
        border-radius: 8px;
        overflow: hidden;
        background: #0d1117;
      }
      .edu-diff-canvas {
        width: 100%;
        height: 100%;
        display: block;
        image-rendering: pixelated;
      }
      .edu-diff-bar-wrap {
        width: 224px;
        height: 6px;
        background: #0d1117;
        border: 1px solid #21262d;
        border-radius: 999px;
        overflow: hidden;
      }
      .edu-diff-bar {
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, #58a6ff, #3fb950);
        transition: width 0.12s;
      }
      .edu-diff-status {
        font-size: 12px;
        color: #8b949e;
        height: 18px;
        line-height: 18px;
      }
      .edu-diff-controls {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px 14px;
        padding: 10px 14px;
        border-top: 1px solid #21262d;
        background: #0d1117;
        flex-wrap: wrap;
      }
      .edu-diff-sliders {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }
      .edu-diff-slider {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: #8b949e;
      }
      .edu-diff-slider input {
        width: 76px;
        accent-color: #58a6ff;
      }
      .edu-diff-slider-val {
        font-family: "Noto Sans Mono", ui-monospace, monospace;
        color: #f0f6fc;
        min-width: 26px;
      }
      .edu-diff-btns {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }
      .edu-diff-btn {
        background: #161b22;
        color: #c9d1d9;
        border: 1px solid #30363d;
        border-radius: 6px;
        padding: 6px 10px;
        font-size: 12px;
        cursor: pointer;
        transition: background 0.12s, border-color 0.12s;
      }
      .edu-diff-btn:hover:not(:disabled) {
        background: #21262d;
        border-color: #58a6ff;
      }
      .edu-diff-btn.is-primary {
        background: #238636;
        border-color: #2ea043;
        color: #ffffff;
      }
      .edu-diff-btn.is-primary:hover:not(:disabled) {
        background: #2ea043;
        border-color: #3fb950;
      }
      .edu-diff-btn:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
    `;
    document.head.appendChild(style);
  }

  let cachedModelPromise = null;
  function loadModel() {
    if (!cachedModelPromise) {
      cachedModelPromise = fetch("/assets/widgets/tiny-diffusion.json")
        .then((r) => r.json())
        .then((raw) => {
          function unpackLinear(obj) {
            const w = new Float32Array(obj.w.length);
            for (let i = 0; i < obj.w.length; i++) w[i] = obj.w[i] * obj.scale;
            return { inDim: obj.in, outDim: obj.out, w, b: new Float32Array(obj.b) };
          }
          function unpackConv(obj) {
            const w = new Float32Array(obj.w.length);
            for (let i = 0; i < obj.w.length; i++) w[i] = obj.w[i] * obj.scale;
            return { inC: obj.inC, outC: obj.outC, w, b: new Float32Array(obj.b) };
          }
          return {
            steps: raw.steps,
            cond0: unpackLinear(raw.cond0),
            cond2: unpackLinear(raw.cond2),
            enc1: unpackConv(raw.enc1),
            p_enc1: unpackLinear(raw.p_enc1),
            enc2: unpackConv(raw.enc2),
            p_enc2: unpackLinear(raw.p_enc2),
            mid1: unpackConv(raw.mid1),
            p_mid1: unpackLinear(raw.p_mid1),
            mid2: unpackConv(raw.mid2),
            p_mid2: unpackLinear(raw.p_mid2),
            dec2: unpackConv(raw.dec2),
            p_dec2: unpackLinear(raw.p_dec2),
            dec1: unpackConv(raw.dec1),
            p_dec1: unpackLinear(raw.p_dec1),
            out: unpackConv(raw.out),
          };
        });
    }
    return cachedModelPromise;
  }

  const T_FREQS = [1, 2, 4, 8, 16, 32].map((f) => f * Math.PI);

  function linearForward(layer, x) {
    const { inDim, outDim, w, b } = layer;
    const out = new Float32Array(outDim);
    for (let o = 0; o < outDim; o++) {
      let sum = b[o];
      const rowOff = o * inDim;
      for (let i = 0; i < inDim; i++) {
        sum += w[rowOff + i] * x[i];
      }
      out[o] = sum;
    }
    return out;
  }

  function siluInPlace(arr) {
    for (let i = 0; i < arr.length; i++) {
      const v = arr[i];
      arr[i] = v / (1 + Math.exp(-v));
    }
    return arr;
  }

  function conv3x3Forward(layer, x, H, W, extraBias) {
    const { inC, outC, w, b } = layer;
    const HW = H * W;
    const out = new Float32Array(outC * HW);
    for (let oc = 0; oc < outC; oc++) {
      const baseBias = b[oc] + (extraBias ? extraBias[oc] : 0);
      const outOff = oc * HW;
      for (let i = 0; i < HW; i++) out[outOff + i] = baseBias;

      for (let ic = 0; ic < inC; ic++) {
        const inOff = ic * HW;
        const wOff = (oc * inC + ic) * 9;
        const w0 = w[wOff], w1 = w[wOff + 1], w2 = w[wOff + 2];
        const w3 = w[wOff + 3], w4 = w[wOff + 4], w5 = w[wOff + 5];
        const w6 = w[wOff + 6], w7 = w[wOff + 7], w8 = w[wOff + 8];

        for (let r = 0; r < H; r++) {
          const rowOut = outOff + r * W;
          const rUp = r > 0 ? inOff + (r - 1) * W : -1;
          const rMid = inOff + r * W;
          const rDn = r < H - 1 ? inOff + (r + 1) * W : -1;

          for (let c = 0; c < W; c++) {
            let acc = 0;
            if (rUp >= 0) {
              if (c > 0) acc += w0 * x[rUp + c - 1];
              acc += w1 * x[rUp + c];
              if (c < W - 1) acc += w2 * x[rUp + c + 1];
            }
            if (c > 0) acc += w3 * x[rMid + c - 1];
            acc += w4 * x[rMid + c];
            if (c < W - 1) acc += w5 * x[rMid + c + 1];
            if (rDn >= 0) {
              if (c > 0) acc += w6 * x[rDn + c - 1];
              acc += w7 * x[rDn + c];
              if (c < W - 1) acc += w8 * x[rDn + c + 1];
            }
            out[rowOut + c] += acc;
          }
        }
      }
    }
    return out;
  }

  function avgPool2x2(x, C, H, W) {
    const H2 = H >> 1;
    const W2 = W >> 1;
    const out = new Float32Array(C * H2 * W2);
    for (let ch = 0; ch < C; ch++) {
      const inOff = ch * H * W;
      const outOff = ch * H2 * W2;
      for (let r = 0; r < H2; r++) {
        const r0 = inOff + r * 2 * W;
        const r1 = r0 + W;
        const oRow = outOff + r * W2;
        for (let c = 0; c < W2; c++) {
          const c0 = c * 2;
          out[oRow + c] = 0.25 * (x[r0 + c0] + x[r0 + c0 + 1] + x[r1 + c0] + x[r1 + c0 + 1]);
        }
      }
    }
    return out;
  }

  function upsample2x(x, C, H, W) {
    const H2 = H * 2;
    const W2 = W * 2;
    const out = new Float32Array(C * H2 * W2);
    for (let ch = 0; ch < C; ch++) {
      const inOff = ch * H * W;
      const outOff = ch * H2 * W2;
      for (let r = 0; r < H; r++) {
        const inRow = inOff + r * W;
        const oRow0 = outOff + r * 2 * W2;
        const oRow1 = oRow0 + W2;
        for (let c = 0; c < W; c++) {
          const v = x[inRow + c];
          const c0 = c * 2;
          out[oRow0 + c0] = v;
          out[oRow0 + c0 + 1] = v;
          out[oRow1 + c0] = v;
          out[oRow1 + c0 + 1] = v;
        }
      }
    }
    return out;
  }

  function concatChannels(a, b) {
    const out = new Float32Array(a.length + b.length);
    out.set(a, 0);
    out.set(b, a.length);
    return out;
  }

  function forwardVelocity(model, x, t, digitIdx) {
    const condIn = new Float32Array(12 + 10);
    for (let i = 0; i < 6; i++) {
      const ang = t * T_FREQS[i];
      condIn[i] = Math.sin(ang);
      condIn[6 + i] = Math.cos(ang);
    }
    if (digitIdx >= 0 && digitIdx < 10) {
      condIn[12 + digitIdx] = 1.0;
    }
    const c = linearForward(model.cond2, siluInPlace(linearForward(model.cond0, condIn)));

    const e1 = siluInPlace(conv3x3Forward(model.enc1, x, 28, 28, linearForward(model.p_enc1, c)));
    const e2 = siluInPlace(
      conv3x3Forward(model.enc2, avgPool2x2(e1, 24, 28, 28), 14, 14, linearForward(model.p_enc2, c))
    );

    let m = siluInPlace(
      conv3x3Forward(model.mid1, avgPool2x2(e2, 48, 14, 14), 7, 7, linearForward(model.p_mid1, c))
    );
    const m2 = siluInPlace(conv3x3Forward(model.mid2, m, 7, 7, linearForward(model.p_mid2, c)));
    for (let i = 0; i < m.length; i++) m[i] += m2[i];

    const u2 = concatChannels(upsample2x(m, 64, 7, 7), e2);
    const d2 = siluInPlace(conv3x3Forward(model.dec2, u2, 14, 14, linearForward(model.p_dec2, c)));

    const u1 = concatChannels(upsample2x(d2, 48, 14, 14), e1);
    const d1 = siluInPlace(conv3x3Forward(model.dec1, u1, 28, 28, linearForward(model.p_dec1, c)));

    return conv3x3Forward(model.out, d1, 28, 28, null);
  }

  // Deterministic PRNG + Box-Muller Gaussian noise
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function sampleNoise(seed) {
    const rng = mulberry32(seed);
    const out = new Float32Array(784);
    for (let i = 0; i < 784; i += 2) {
      const u1 = Math.max(1e-7, rng());
      const u2 = rng();
      const mag = Math.sqrt(-2.0 * Math.log(u1));
      out[i] = mag * Math.cos(2.0 * Math.PI * u2);
      if (i + 1 < 784) {
        out[i + 1] = mag * Math.sin(2.0 * Math.PI * u2);
      }
    }
    return out;
  }

  function mountWidget(container) {
    const root = document.createElement("div");
    root.className = "edu-diff-root";

    // Header
    const header = document.createElement("div");
    header.className = "edu-diff-header";

    const stats = document.createElement("div");
    stats.className = "edu-diff-stats";
    const stepStat = document.createElement("span");
    const seedStat = document.createElement("span");
    stats.append(stepStat, seedStat);

    const newSeedBtn = document.createElement("button");
    newSeedBtn.type = "button";
    newSeedBtn.className = "edu-diff-btn";
    newSeedBtn.textContent = "🎲 새 노이즈";
    header.append(stats, newSeedBtn);

    // Prompts
    const promptsBar = document.createElement("div");
    promptsBar.className = "edu-diff-prompts";
    promptsBar.innerHTML = `<span class="edu-diff-prompts-label">만들 숫자:</span>`;
    let selectedDigit = 3;
    const digitBtns = [];
    for (let d = 0; d < 10; d++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `edu-diff-digit${d === selectedDigit ? " is-active" : ""}`;
      btn.textContent = String(d);
      btn.addEventListener("click", () => {
        selectedDigit = d;
        digitBtns.forEach((b, idx) => b.classList.toggle("is-active", idx === selectedDigit));
        resetToNoise(false);
      });
      promptsBar.appendChild(btn);
      digitBtns.push(btn);
    }

    // Body
    const body = document.createElement("div");
    body.className = "edu-diff-body";

    const canvasWrap = document.createElement("div");
    canvasWrap.className = "edu-diff-canvas-wrap";
    const canvas = document.createElement("canvas");
    canvas.className = "edu-diff-canvas";
    canvas.width = 28;
    canvas.height = 28;
    canvasWrap.appendChild(canvas);

    const barWrap = document.createElement("div");
    barWrap.className = "edu-diff-bar-wrap";
    const bar = document.createElement("div");
    bar.className = "edu-diff-bar";
    barWrap.appendChild(bar);

    const statusEl = document.createElement("div");
    statusEl.className = "edu-diff-status";
    statusEl.textContent = "초소형 확산 모델 불러오는 중...";

    body.append(canvasWrap, barWrap, statusEl);

    // Controls
    const controls = document.createElement("div");
    controls.className = "edu-diff-controls";

    const slidersWrap = document.createElement("div");
    slidersWrap.className = "edu-diff-sliders";

    const cfgWrap = document.createElement("label");
    cfgWrap.className = "edu-diff-slider";
    cfgWrap.innerHTML = `<span>안내강도</span><input type="range" min="1.0" max="4.0" step="0.5" value="2.5"><span class="edu-diff-slider-val">2.5</span>`;
    const cfgInput = cfgWrap.querySelector("input");
    const cfgVal = cfgWrap.querySelector(".edu-diff-slider-val");

    const speedWrap = document.createElement("label");
    speedWrap.className = "edu-diff-slider";
    speedWrap.innerHTML = `<span>속도</span><input type="range" min="1" max="5" step="1" value="3"><span class="edu-diff-slider-val">3x</span>`;
    const speedInput = speedWrap.querySelector("input");
    const speedVal = speedWrap.querySelector(".edu-diff-slider-val");

    slidersWrap.append(cfgWrap, speedWrap);

    const btnsWrap = document.createElement("div");
    btnsWrap.className = "edu-diff-btns";

    const stepBtn = document.createElement("button");
    stepBtn.type = "button";
    stepBtn.className = "edu-diff-btn";
    stepBtn.textContent = "1단계";
    stepBtn.disabled = true;

    const autoBtn = document.createElement("button");
    autoBtn.type = "button";
    autoBtn.className = "edu-diff-btn is-primary";
    autoBtn.textContent = "자동";
    autoBtn.disabled = true;

    const resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.className = "edu-diff-btn";
    resetBtn.textContent = "초기화";

    btnsWrap.append(stepBtn, autoBtn, resetBtn);
    controls.append(slidersWrap, btnsWrap);

    root.append(header, promptsBar, body, controls);
    container.innerHTML = "";
    container.appendChild(root);

    // State
    let model = null;
    let seed = 1042;
    let curStep = 0;
    let totalSteps = 16;
    let stateX = sampleNoise(seed);
    let autoTimer = null;

    const ctx = canvas.getContext("2d");
    const imgData = ctx.createImageData(28, 28);

    function renderCanvas() {
      const d = imgData.data;
      for (let i = 0; i < 784; i++) {
        const norm = Math.max(0, Math.min(1, (stateX[i] + 1) * 0.5));
        const val = Math.round(norm * 255);
        const off = i * 4;
        d[off] = val;
        d[off + 1] = val;
        d[off + 2] = val;
        d[off + 3] = 255;
      }
      ctx.putImageData(imgData, 0, 0);

      stepStat.innerHTML = `단계 <b>${curStep} / ${totalSteps}</b>`;
      seedStat.innerHTML = `Seed <b>#${seed}</b>`;
      bar.style.width = `${Math.round((curStep / totalSteps) * 100)}%`;
    }

    function stopAuto() {
      if (autoTimer) {
        clearTimeout(autoTimer);
        autoTimer = null;
        autoBtn.textContent = "자동";
      }
    }

    function resetToNoise(resetSliders) {
      stopAuto();
      if (resetSliders) {
        cfgInput.value = "2.5";
        cfgVal.textContent = "2.5";
        speedInput.value = "3";
        speedVal.textContent = "3x";
      }
      curStep = 0;
      stateX = sampleNoise(seed);
      if (model) {
        statusEl.textContent = "랜덤 노이즈 상태입니다. 자동 또는 1단계를 눌러보세요.";
      }
      renderCanvas();
    }

    function stepOnce() {
      if (!model || curStep >= totalSteps) return false;
      const dt = 1.0 / totalSteps;
      const t = curStep * dt;
      const cfg = Number(cfgInput.value);

      const vCond = forwardVelocity(model, stateX, t, selectedDigit);
      if (Math.abs(cfg - 1.0) > 1e-4) {
        const vUncond = forwardVelocity(model, stateX, t, -1);
        for (let i = 0; i < 784; i++) {
          stateX[i] += dt * (vUncond[i] + cfg * (vCond[i] - vUncond[i]));
        }
      } else {
        for (let i = 0; i < 784; i++) {
          stateX[i] += dt * vCond[i];
        }
      }

      curStep++;
      if (curStep >= totalSteps) {
        statusEl.textContent = `완성! 같은 '${selectedDigit}'도 Seed가 다르면 다른 모양이 됩니다.`;
      } else {
        statusEl.textContent = `노이즈 제거 중... (${curStep}/${totalSteps})`;
      }
      renderCanvas();
      return curStep < totalSteps;
    }

    function getSpeedMs() {
      return 340 - Number(speedInput.value) * 60;
    }

    cfgInput.addEventListener("input", () => {
      cfgVal.textContent = cfgInput.value;
    });

    speedInput.addEventListener("input", () => {
      speedVal.textContent = `${speedInput.value}x`;
    });

    newSeedBtn.addEventListener("click", () => {
      seed = Math.floor(1000 + Math.random() * 9000);
      resetToNoise(false);
    });

    resetBtn.addEventListener("click", () => {
      resetToNoise(true);
    });

    stepBtn.addEventListener("click", () => {
      stopAuto();
      if (curStep >= totalSteps) {
        resetToNoise(false);
      }
      stepOnce();
    });

    autoBtn.addEventListener("click", () => {
      if (!model) return;
      if (autoTimer) {
        stopAuto();
        return;
      }
      if (curStep >= totalSteps) {
        resetToNoise(false);
      }
      autoBtn.textContent = "중지";
      const tick = () => {
        if (!autoTimer) return;
        const cont = stepOnce();
        if (!cont) {
          stopAuto();
          return;
        }
        autoTimer = setTimeout(tick, getSpeedMs());
      };
      autoTimer = setTimeout(tick, 0);
    });

    renderCanvas();

    loadModel().then((m) => {
      model = m;
      totalSteps = m.steps;
      stepBtn.disabled = false;
      autoBtn.disabled = false;
      statusEl.textContent = "랜덤 노이즈 상태입니다. 자동 또는 1단계를 눌러보세요.";
      renderCanvas();
    });
  }

  function init() {
    document.querySelectorAll('[data-widget="tiny-diffusion"]').forEach(mountWidget);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

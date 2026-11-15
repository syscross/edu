(() => {
  const CSS = `
    .edu-gpt-stage {
      width: 100%;
      max-width: 480px;
      margin: 20px auto 28px;
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 14px;
      overflow: hidden;
      box-sizing: border-box;
    }
    .edu-gpt-presets {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 12px 14px 0;
    }
    .edu-gpt-preset {
      padding: 4px 9px;
      border: 1px solid #30363d;
      border-radius: 999px;
      background: #0d1117;
      color: #8b949e;
      font-family: "Noto Sans Mono", ui-monospace, monospace;
      font-size: 11px;
      cursor: pointer;
      touch-action: manipulation;
    }
    .edu-gpt-preset:hover,
    .edu-gpt-preset.is-active {
      border-color: #58a6ff;
      color: #f0f6fc;
    }
    .edu-gpt-input-wrap {
      padding: 10px 14px;
    }
    .edu-gpt-textarea {
      width: 100%;
      min-height: 70px;
      padding: 10px 12px;
      box-sizing: border-box;
      border: 1px solid #30363d;
      border-radius: 10px;
      background: #0d1117;
      color: #f0f6fc;
      font-family: "Noto Sans Mono", ui-monospace, monospace;
      font-size: 14px;
      line-height: 1.5;
      resize: vertical;
      outline: none;
    }
    .edu-gpt-textarea:focus {
      border-color: #58a6ff;
    }
    .edu-gpt-probs {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 4px 14px 12px;
    }
    .edu-gpt-cand {
      display: grid;
      grid-template-columns: 78px 1fr 44px;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      border: 1px solid #30363d;
      border-radius: 8px;
      background: #0d1117;
      color: #c9d1d9;
      font-family: "Noto Sans Mono", ui-monospace, monospace;
      font-size: 13px;
      cursor: pointer;
      text-align: left;
      touch-action: manipulation;
      transition: border-color 0.12s ease, background-color 0.12s ease;
    }
    .edu-gpt-cand:hover {
      border-color: #58a6ff;
      background: #132030;
    }
    .edu-gpt-cand.is-top {
      color: #f0f6fc;
      font-weight: 700;
    }
    .edu-gpt-word {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .edu-gpt-bar-bg {
      height: 8px;
      background: #161b22;
      border-radius: 999px;
      overflow: hidden;
    }
    .edu-gpt-bar-fill {
      height: 100%;
      background: #30363d;
      border-radius: 999px;
      transition: width 0.12s ease;
    }
    .edu-gpt-cand.is-top .edu-gpt-bar-fill {
      background: #58a6ff;
    }
    .edu-gpt-pct {
      text-align: right;
      font-size: 12px;
      color: #8b949e;
    }
    .edu-gpt-controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px 14px;
      padding: 10px 14px;
      border-top: 1px solid #21262d;
      background: #0d1117;
      flex-wrap: wrap;
    }
    .edu-gpt-sliders {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .edu-gpt-temp {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #8b949e;
    }
    .edu-gpt-temp input {
      width: 78px;
      accent-color: #58a6ff;
    }
    .edu-gpt-temp-val {
      font-family: "Noto Sans Mono", ui-monospace, monospace;
      color: #f0f6fc;
      min-width: 26px;
    }
    .edu-gpt-btns {
      display: flex;
      gap: 6px;
    }
    .edu-gpt-btn {
      padding: 5px 11px;
      border: 1px solid #30363d;
      border-radius: 7px;
      background: #161b22;
      color: #f0f6fc;
      font-family: inherit;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      touch-action: manipulation;
    }
    .edu-gpt-btn:hover:not(:disabled) {
      border-color: #58a6ff;
    }
    .edu-gpt-btn.is-primary {
      background: #1f6feb;
      border-color: #388bfd;
    }
    .edu-gpt-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  `;

  if (!document.getElementById("edu-gpt-widget-style")) {
    const style = document.createElement("style");
    style.id = "edu-gpt-widget-style";
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  let modelPromise = null;

  function decodeTensor(qObj) {
    const bin = atob(qObj.data);
    const out = new Float32Array(bin.length);
    const scale = qObj.scale;
    for (let i = 0; i < bin.length; i++) {
      let v = bin.charCodeAt(i);
      if (v > 127) v -= 256;
      out[i] = v * scale;
    }
    return { data: out, shape: qObj.shape };
  }

  function loadModel() {
    if (!modelPromise) {
      modelPromise = fetch("/assets/widgets/tiny-gpt.json")
        .then((r) => r.json())
        .then((raw) => {
          const stoi = new Map();
          raw.vocab.forEach((w, i) => stoi.set(w, i));
          return {
            config: raw.config,
            vocab: raw.vocab,
            stoi,
            wte: decodeTensor(raw.wte).data,
            wpe: decodeTensor(raw.wpe).data,
            ln_f_w: Float32Array.from(raw.ln_f_w),
            ln_f_b: Float32Array.from(raw.ln_f_b),
            blocks: raw.blocks.map((b) => ({
              ln1_w: Float32Array.from(b.ln1_w),
              ln1_b: Float32Array.from(b.ln1_b),
              c_attn_w: decodeTensor(b.c_attn_w).data,
              c_attn_b: Float32Array.from(b.c_attn_b),
              c_proj_w: decodeTensor(b.c_proj_w).data,
              c_proj_b: Float32Array.from(b.c_proj_b),
              ln2_w: Float32Array.from(b.ln2_w),
              ln2_b: Float32Array.from(b.ln2_b),
              fc1_w: decodeTensor(b.fc1_w).data,
              fc1_b: Float32Array.from(b.fc1_b),
              fc2_w: decodeTensor(b.fc2_w).data,
              fc2_b: Float32Array.from(b.fc2_b),
            })),
          };
        });
    }
    return modelPromise;
  }

  function layerNorm(x, w, b, C) {
    let mean = 0;
    for (let i = 0; i < C; i++) mean += x[i];
    mean /= C;
    let v = 0;
    for (let i = 0; i < C; i++) {
      const d = x[i] - mean;
      v += d * d;
    }
    const inv = 1 / Math.sqrt(v / C + 1e-5);
    const out = new Float32Array(C);
    for (let i = 0; i < C; i++) {
      out[i] = (x[i] - mean) * inv * w[i] + b[i];
    }
    return out;
  }

  function linear(x, w, b, inDim, outDim) {
    const out = new Float32Array(outDim);
    for (let o = 0; o < outDim; o++) {
      let s = b[o];
      const off = o * inDim;
      for (let i = 0; i < inDim; i++) {
        s += x[i] * w[off + i];
      }
      out[o] = s;
    }
    return out;
  }

  function forwardLogits(ids, m) {
    const { vocabSize, blockSize, dModel, nHead, ffnDim } = m.config;
    const seq = ids.slice(-blockSize);
    const T = seq.length;
    const headDim = dModel / nHead;

    let x = new Array(T);
    for (let t = 0; t < T; t++) {
      const vec = new Float32Array(dModel);
      const tokOff = seq[t] * dModel;
      const posOff = t * dModel;
      for (let c = 0; c < dModel; c++) {
        vec[c] = m.wte[tokOff + c] + m.wpe[posOff + c];
      }
      x[t] = vec;
    }

    for (const blk of m.blocks) {
      const qAll = new Array(T);
      const kAll = new Array(T);
      const vAll = new Array(T);

      for (let t = 0; t < T; t++) {
        const ln = layerNorm(x[t], blk.ln1_w, blk.ln1_b, dModel);
        const qkv = linear(ln, blk.c_attn_w, blk.c_attn_b, dModel, 3 * dModel);
        qAll[t] = qkv.subarray(0, dModel);
        kAll[t] = qkv.subarray(dModel, 2 * dModel);
        vAll[t] = qkv.subarray(2 * dModel, 3 * dModel);
      }

      for (let t = 0; t < T; t++) {
        const attnOut = new Float32Array(dModel);
        for (let h = 0; h < nHead; h++) {
          const hOff = h * headDim;
          const scores = new Float32Array(t + 1);
          let maxS = -Infinity;
          const scale = 1 / Math.sqrt(headDim);
          for (let s = 0; s <= t; s++) {
            let dot = 0;
            for (let d = 0; d < headDim; d++) {
              dot += qAll[t][hOff + d] * kAll[s][hOff + d];
            }
            const val = dot * scale;
            scores[s] = val;
            if (val > maxS) maxS = val;
          }
          let sumExp = 0;
          for (let s = 0; s <= t; s++) {
            scores[s] = Math.exp(scores[s] - maxS);
            sumExp += scores[s];
          }
          for (let s = 0; s <= t; s++) {
            const w = scores[s] / sumExp;
            for (let d = 0; d < headDim; d++) {
              attnOut[hOff + d] += w * vAll[s][hOff + d];
            }
          }
        }
        const proj = linear(attnOut, blk.c_proj_w, blk.c_proj_b, dModel, dModel);
        for (let c = 0; c < dModel; c++) x[t][c] += proj[c];

        const ln2 = layerNorm(x[t], blk.ln2_w, blk.ln2_b, dModel);
        const h1 = linear(ln2, blk.fc1_w, blk.fc1_b, dModel, ffnDim);
        for (let i = 0; i < ffnDim; i++) if (h1[i] < 0) h1[i] = 0;
        const h2 = linear(h1, blk.fc2_w, blk.fc2_b, ffnDim, dModel);
        for (let c = 0; c < dModel; c++) x[t][c] += h2[c];
      }
    }

    const last = layerNorm(x[T - 1], m.ln_f_w, m.ln_f_b, dModel);
    const logits = new Float32Array(vocabSize);
    for (let v = 0; v < vocabSize; v++) {
      let dot = 0;
      const off = v * dModel;
      for (let c = 0; c < dModel; c++) dot += last[c] * m.wte[off + c];
      logits[v] = dot;
    }
    return logits;
  }

  function logitsToProbs(logits, temp) {
    const probs = new Float32Array(logits.length);
    let maxL = -Infinity;
    for (let i = 1; i < logits.length; i++) {
      const val = logits[i] / temp;
      if (val > maxL) maxL = val;
    }
    let sum = 0;
    for (let i = 1; i < logits.length; i++) {
      const e = Math.exp(logits[i] / temp - maxL);
      probs[i] = e;
      sum += e;
    }
    for (let i = 1; i < logits.length; i++) probs[i] /= sum;
    return probs;
  }

  function tokenize(text, stoi) {
    const re = /[a-z]+('[a-z]+)?|[.,!?]/g;
    const matches = text.toLowerCase().match(re) || [];
    if (matches.length === 0) return [stoi.get("once") || 1];
    return matches.map((t) => (stoi.has(t) ? stoi.get(t) : 0));
  }

  function appendToken(text, tok) {
    const trimmed = text.trimEnd();
    if (!trimmed) return tok;
    if (/^[.,!?]$/.test(tok)) return trimmed + tok + " ";
    return trimmed + " " + tok;
  }

  const PRESETS = [
    "Once upon a",
    "The little dog wanted to",
    "She was very",
    "They lived happily",
  ];

  function initWidget(root) {
    if (root.dataset.mounted) return;
    root.dataset.mounted = "1";

    const stage = document.createElement("div");
    stage.className = "edu-gpt-stage";

    const presetsWrap = document.createElement("div");
    presetsWrap.className = "edu-gpt-presets";

    const inputWrap = document.createElement("div");
    inputWrap.className = "edu-gpt-input-wrap";
    const textarea = document.createElement("textarea");
    textarea.className = "edu-gpt-textarea";
    textarea.placeholder = "Write a short English sentence...";
    textarea.value = PRESETS[0];
    inputWrap.appendChild(textarea);

    const probsWrap = document.createElement("div");
    probsWrap.className = "edu-gpt-probs";
    const candEls = [];
    for (let i = 0; i < 5; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "edu-gpt-cand" + (i === 0 ? " is-top" : "");
      btn.innerHTML = `
        <span class="edu-gpt-word">...</span>
        <div class="edu-gpt-bar-bg"><div class="edu-gpt-bar-fill"></div></div>
        <span class="edu-gpt-pct">--%</span>
      `;
      probsWrap.appendChild(btn);
      candEls.push({
        btn,
        word: btn.querySelector(".edu-gpt-word"),
        fill: btn.querySelector(".edu-gpt-bar-fill"),
        pct: btn.querySelector(".edu-gpt-pct"),
        token: "",
      });
    }

    const controls = document.createElement("div");
    controls.className = "edu-gpt-controls";

    const slidersWrap = document.createElement("div");
    slidersWrap.className = "edu-gpt-sliders";

    const tempWrap = document.createElement("label");
    tempWrap.className = "edu-gpt-temp";
    tempWrap.innerHTML = `<span>창의성</span><input type="range" min="0.2" max="1.5" step="0.1" value="0.7"><span class="edu-gpt-temp-val">0.7</span>`;
    const tempInput = tempWrap.querySelector("input");
    const tempVal = tempWrap.querySelector(".edu-gpt-temp-val");

    const speedWrap = document.createElement("label");
    speedWrap.className = "edu-gpt-temp";
    speedWrap.innerHTML = `<span>속도</span><input type="range" min="1" max="5" step="1" value="3"><span class="edu-gpt-temp-val">3x</span>`;
    const speedInput = speedWrap.querySelector("input");
    const speedVal = speedWrap.querySelector(".edu-gpt-temp-val");

    slidersWrap.append(tempWrap, speedWrap);

    const btnsWrap = document.createElement("div");
    btnsWrap.className = "edu-gpt-btns";

    const stepBtn = document.createElement("button");
    stepBtn.type = "button";
    stepBtn.className = "edu-gpt-btn is-primary";
    stepBtn.textContent = "생성";
    stepBtn.disabled = true;

    const autoBtn = document.createElement("button");
    autoBtn.type = "button";
    autoBtn.className = "edu-gpt-btn is-primary";
    autoBtn.textContent = "자동";
    autoBtn.disabled = true;

    const resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.className = "edu-gpt-btn";
    resetBtn.textContent = "초기화";

    btnsWrap.append(stepBtn, autoBtn, resetBtn);
    controls.append(slidersWrap, btnsWrap);

    stage.append(presetsWrap, inputWrap, probsWrap, controls);
    root.appendChild(stage);

    let model = null;
    let currentPreset = PRESETS[0];
    let autoTimer = null;

    PRESETS.forEach((p, idx) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "edu-gpt-preset" + (idx === 0 ? " is-active" : "");
      b.textContent = p;
      b.addEventListener("click", () => {
        stopAuto();
        currentPreset = p;
        textarea.value = p;
        presetsWrap.querySelectorAll(".edu-gpt-preset").forEach((el) => el.classList.remove("is-active"));
        b.classList.add("is-active");
        updatePredictions();
      });
      presetsWrap.appendChild(b);
    });

    function stopAuto() {
      if (autoTimer) {
        clearTimeout(autoTimer);
        autoTimer = null;
        autoBtn.textContent = "자동";
      }
    }

    function getSpeedMs() {
      return 650 - Number(speedInput.value) * 110;
    }

    function stepOnce() {
      if (!model) return null;
      const probs = updatePredictions();
      let r = Math.random();
      let chosen = 1;
      for (let i = 1; i < probs.length; i++) {
        r -= probs[i];
        if (r <= 0) {
          chosen = i;
          break;
        }
      }
      const tok = model.vocab[chosen];
      textarea.value = appendToken(textarea.value, tok);
      updatePredictions();
      return tok;
    }

    function updatePredictions() {
      if (!model) return;
      const temp = parseFloat(tempInput.value);
      const ids = tokenize(textarea.value, model.stoi);
      const logits = forwardLogits(ids, model);
      const probs = logitsToProbs(logits, temp);

      const top = [];
      for (let i = 1; i < probs.length; i++) {
        top.push({ id: i, p: probs[i] });
      }
      top.sort((a, b) => b.p - a.p);

      for (let i = 0; i < 5; i++) {
        const item = top[i];
        const w = model.vocab[item.id];
        const pct = Math.round(item.p * 100);
        candEls[i].token = w;
        candEls[i].word.textContent = w;
        candEls[i].fill.style.width = `${pct}%`;
        candEls[i].pct.textContent = `${pct}%`;
      }
      return probs;
    }

    candEls.forEach((c) => {
      c.btn.addEventListener("click", () => {
        if (!c.token) return;
        stopAuto();
        textarea.value = appendToken(textarea.value, c.token);
        updatePredictions();
      });
    });

    textarea.addEventListener("input", () => {
      stopAuto();
      updatePredictions();
    });

    tempInput.addEventListener("input", () => {
      tempVal.textContent = tempInput.value;
      updatePredictions();
    });

    speedInput.addEventListener("input", () => {
      speedVal.textContent = `${speedInput.value}x`;
    });

    resetBtn.addEventListener("click", () => {
      stopAuto();
      tempInput.value = "0.7";
      tempVal.textContent = "0.7";
      speedInput.value = "3";
      speedVal.textContent = "3x";
      textarea.value = currentPreset;
      updatePredictions();
    });

    stepBtn.addEventListener("click", () => {
      if (!model) return;
      stopAuto();
      stepOnce();
    });

    autoBtn.addEventListener("click", () => {
      if (!model) return;
      if (autoTimer) {
        stopAuto();
        return;
      }
      let steps = 0;
      autoBtn.textContent = "중지";
      const tick = () => {
        if (!autoTimer) return;
        stepOnce();
        steps++;
        if (steps >= 60) {
          stopAuto();
          return;
        }
        autoTimer = setTimeout(tick, getSpeedMs());
      };
      autoTimer = setTimeout(tick, 0);
    });

    loadModel().then((m) => {
      model = m;
      stepBtn.disabled = false;
      autoBtn.disabled = false;
      updatePredictions();
    });
  }

  document.querySelectorAll('[data-widget="tiny-gpt"]').forEach(initWidget);
})();

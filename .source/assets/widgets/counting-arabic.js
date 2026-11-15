(() => {
  const CSS = `
    .edu-arabic-stage {
      width: 100%;
      max-width: 480px;
      margin: 20px auto 28px;
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 14px;
      overflow: hidden;
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
      box-sizing: border-box;
    }
    .edu-arabic-canvas {
      display: block;
      width: 100%;
      height: auto;
      aspect-ratio: 4 / 3;
      touch-action: manipulation;
    }
    .edu-arabic-controls {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      padding: 10px 12px;
      border-top: 1px solid #21262d;
      background: #0d1117;
    }
    .edu-arabic-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      padding: 10px 6px;
      border: 1px solid #30363d;
      border-radius: 10px;
      background: #161b22;
      color: #f0f6fc;
      font-family: inherit;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      touch-action: manipulation;
      transition: background-color 0.15s ease, border-color 0.15s ease, opacity 0.15s ease, transform 0.08s ease;
    }
    .edu-arabic-btn:hover:not(:disabled) {
      background: #1f2937;
      border-color: #58a6ff;
    }
    .edu-arabic-btn:active:not(:disabled) {
      transform: scale(0.97);
    }
    .edu-arabic-btn:disabled {
      opacity: 0.32;
      cursor: not-allowed;
    }
    .edu-arabic-btn-sub {
      font-size: 11px;
      font-weight: 500;
      color: #8b949e;
    }
  `;

  if (!document.getElementById("edu-arabic-widget-style")) {
    const style = document.createElement("style");
    style.id = "edu-arabic-widget-style";
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const easeInCubic = (t) => t * t * t;

  function initWidget(root) {
    if (root.dataset.mounted) return;
    root.dataset.mounted = "1";

    const stage = document.createElement("div");
    stage.className = "edu-arabic-stage";

    const canvas = document.createElement("canvas");
    canvas.className = "edu-arabic-canvas";
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", "아라비아 숫자 주문서에 맞춰 사과 묶음 담기 인터랙티브 위젯");

    const controls = document.createElement("div");
    controls.className = "edu-arabic-controls";

    function makeBtn(amount, label, sub) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "edu-arabic-btn";
      btn.innerHTML = `<span>${label}</span><span class="edu-arabic-btn-sub">${sub}</span>`;
      btn.addEventListener("click", () => addPack(amount));
      return btn;
    }

    const btn10 = makeBtn(10, "10개 묶음", "+10");
    const btn5 = makeBtn(5, "5개 묶음", "+5");
    const btn1 = makeBtn(1, "사과 1개", "+1");
    controls.append(btn10, btn5, btn1);

    stage.appendChild(canvas);
    stage.appendChild(controls);
    root.appendChild(stage);

    const ctx = canvas.getContext("2d");
    const W = 480;
    const H = 360;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    const REST_X = 190;
    const OFF_X = 630;
    const BASKET_Y = 264;
    const BASKET_W = 174;
    const BASKET_H = 72;
    const CARD_OFFSET_X = 136;
    const CARD_Y = 104;

    let state = "ENTERING";
    let stateTime = 0;
    let basketX = OFF_X;
    let target = 0;
    let lastTarget = 0;
    let current = 0;
    let items = []; // { amount: 10 | 5 | 1, offsetX, y, vy, settled, rot }
    let lastTs = 0;

    function pickTarget() {
      let next;
      do {
        // 10~99 중 가끔 일의 자리가 0인 수도 자연스럽게 등장
        next = Math.floor(Math.random() * 90) + 10;
      } while (next === lastTarget);
      lastTarget = next;
      return next;
    }

    function syncButtons() {
      const rem = target - current;
      const active = state === "COLLECTING" && rem > 0;
      btn10.disabled = !active || rem < 10;
      btn5.disabled = !active || rem < 5;
      btn1.disabled = !active || rem < 1;
    }

    function startRound() {
      target = pickTarget();
      current = 0;
      items = [];
      basketX = OFF_X;
      state = "ENTERING";
      stateTime = 0;
      syncButtons();
    }

    function addPack(amount) {
      if (state !== "COLLECTING") return;
      if (current + amount > target) return;

      current += amount;
      const spread = BASKET_W * 0.3;
      const offsetX =
        amount === 10
          ? (Math.random() - 0.5) * (spread * 0.7)
          : (Math.random() - 0.5) * spread * 1.4;

      items.push({
        amount,
        offsetX,
        y: 68,
        vy: 0,
        settled: false,
        rot: (Math.random() - 0.5) * (amount === 1 ? 0.35 : 0.14),
      });

      if (current === target) {
        state = "SETTLE";
        stateTime = 0;
      }
      syncButtons();
    }

    function drawApple(x, y, rot, scale = 1) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.scale(scale, scale);

      ctx.fillStyle = "#e5484d";
      ctx.beginPath();
      ctx.arc(-4.5, 0, 10.5, 0, Math.PI * 2);
      ctx.arc(4.5, 0, 10.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, 2.5, 12.5, 11.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.26)";
      ctx.beginPath();
      ctx.ellipse(-5, -3.5, 2.8, 4.8, -0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#8d5b2d";
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.quadraticCurveTo(2, -15, 4.5, -16);
      ctx.stroke();

      ctx.fillStyle = "#3fb950";
      ctx.beginPath();
      ctx.ellipse(5, -12.5, 5, 2.8, -0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function drawPack5(x, y, rot) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);

      ctx.fillStyle = "#1f6feb";
      ctx.strokeStyle = "#58a6ff";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(-20, -14, 40, 28, 7);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#f0f6fc";
      ctx.font = "700 13px 'Noto Sans Mono', ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("5", 0, 1);

      ctx.restore();
    }

    function drawPack10(x, y, rot) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);

      ctx.fillStyle = "#9e6a03";
      ctx.strokeStyle = "#d29922";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-27, -17, 54, 34, 7);
      ctx.fill();
      ctx.stroke();

      // 상자 가로 띠
      ctx.fillStyle = "rgba(255,255,255,0.16)";
      ctx.fillRect(-25, -4, 50, 8);

      ctx.fillStyle = "#fff8c5";
      ctx.font = "700 15px 'Noto Sans Mono', ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("10", 0, 1);

      ctx.restore();
    }

    function drawOrderCard(cx, cy, isDone) {
      ctx.save();
      // 고객의 위쪽 팔/소매
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.1);
      ctx.fillStyle = "#388bfd";
      ctx.beginPath();
      ctx.roundRect(48, -8, W - cx + 140, 30, 15);
      ctx.fill();
      ctx.fillStyle = "#f0f6fc";
      ctx.beginPath();
      ctx.roundRect(44, -9, 9, 32, 4);
      ctx.fill();
      ctx.restore();

      // 아라비아 숫자 주문서 카드
      ctx.fillStyle = isDone ? "#1a3b27" : "#0d1117";
      ctx.strokeStyle = isDone ? "#3fb950" : "#586069";
      ctx.lineWidth = isDone ? 3 : 2.5;
      ctx.beginPath();
      ctx.roundRect(cx - 56, cy - 48, 112, 96, 14);
      ctx.fill();
      ctx.stroke();

      // 목표 아라비아 숫자
      ctx.fillStyle = isDone ? "#56d364" : "#f0f6fc";
      ctx.font = "700 44px 'Noto Sans Mono', ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(target), cx, cy - 6);

      // 현재 담긴 수
      ctx.fillStyle = isDone ? "#7ee787" : "#8b949e";
      ctx.font = "600 13px 'Noto Sans Mono', ui-monospace, monospace";
      ctx.fillText(`${current} / ${target}`, cx, cy + 30);

      // 카드 오른쪽을 잡은 손
      ctx.fillStyle = "#f5caa4";
      ctx.strokeStyle = "#9c6b45";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(cx + 46, cy - 6, 22, 24, 9);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    function drawArmAndBasket(bx) {
      const rightEdge = bx + BASKET_W / 2;

      ctx.save();
      ctx.fillStyle = "#388bfd";
      ctx.beginPath();
      ctx.roundRect(rightEdge + 22, BASKET_Y - 12, W - rightEdge + 120, 34, 17);
      ctx.fill();

      ctx.fillStyle = "#f0f6fc";
      ctx.fillRect(rightEdge + 18, BASKET_Y - 13, 10, 36);

      ctx.fillStyle = "#f5caa4";
      ctx.beginPath();
      ctx.roundRect(rightEdge - 8, BASKET_Y - 10, 32, 30, 12);
      ctx.fill();

      ctx.beginPath();
      ctx.roundRect(rightEdge - 10, BASKET_Y - 16, 16, 10, 5);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.fillStyle = "#8a5a2b";
      ctx.beginPath();
      ctx.ellipse(bx, BASKET_Y - BASKET_H / 2 + 6, BASKET_W / 2, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawBasketFront(bx) {
      const topY = BASKET_Y - BASKET_H / 2 + 6;
      const botY = BASKET_Y + BASKET_H / 2;
      const topHalf = BASKET_W / 2;
      const botHalf = BASKET_W * 0.37;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(bx - topHalf, topY);
      ctx.lineTo(bx + topHalf, topY);
      ctx.lineTo(bx + botHalf, botY - 8);
      ctx.quadraticCurveTo(bx + botHalf, botY, bx + botHalf - 10, botY);
      ctx.lineTo(bx - botHalf + 10, botY);
      ctx.quadraticCurveTo(bx - botHalf, botY, bx - botHalf, botY - 8);
      ctx.closePath();
      ctx.fillStyle = "#c68b45";
      ctx.fill();

      ctx.save();
      ctx.clip();
      ctx.strokeStyle = "#9e692c";
      ctx.lineWidth = 2;
      for (let y = topY + 14; y < botY; y += 14) {
        ctx.beginPath();
        ctx.moveTo(bx - topHalf, y);
        ctx.lineTo(bx + topHalf, y);
        ctx.stroke();
      }
      for (let x = bx - topHalf + 16; x < bx + topHalf; x += 22) {
        ctx.beginPath();
        ctx.moveTo(x, topY);
        ctx.lineTo(x + (bx - x) * 0.18, botY);
        ctx.stroke();
      }
      ctx.restore();

      ctx.fillStyle = "#dfa358";
      ctx.strokeStyle = "#8a5a2b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(bx - topHalf - 4, topY - 7, BASKET_W + 8, 13, 6.5);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    function update(dt) {
      stateTime += dt;

      if (state === "ENTERING") {
        const t = Math.min(stateTime / 0.48, 1);
        basketX = OFF_X + (REST_X - OFF_X) * easeOutCubic(t);
        if (t >= 1) {
          basketX = REST_X;
          state = "COLLECTING";
          stateTime = 0;
          syncButtons();
        }
      } else if (state === "EXITING") {
        const t = Math.min(stateTime / 0.52, 1);
        basketX = REST_X + (OFF_X - REST_X) * easeInCubic(t);
        if (t >= 1) {
          state = "PAUSE";
          stateTime = 0;
        }
      } else if (state === "PAUSE") {
        if (stateTime >= 0.18) startRound();
      }

      const gravity = 1650;
      const floorY = BASKET_Y - 12;
      let allSettled = true;

      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const myFloor = floorY - Math.floor(i / 4) * 14;
        if (!it.settled) {
          it.vy += gravity * dt;
          it.y += it.vy * dt;
          if (it.y >= myFloor) {
            it.y = myFloor;
            if (Math.abs(it.vy) > 140) it.vy = -it.vy * 0.25;
            else {
              it.vy = 0;
              it.settled = true;
            }
          }
        }
        if (!it.settled) allSettled = false;
      }

      if (state === "SETTLE" && allSettled && stateTime >= 0.35) {
        state = "EXITING";
        stateTime = 0;
        syncButtons();
      }
    }

    function render() {
      ctx.clearRect(0, 0, W, H);

      ctx.strokeStyle = "#21262d";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(24, BASKET_Y + BASKET_H / 2 + 12);
      ctx.lineTo(W - 24, BASKET_Y + BASKET_H / 2 + 12);
      ctx.stroke();

      if (state !== "PAUSE") {
        const isDone = current === target && target > 0;
        drawOrderCard(basketX + CARD_OFFSET_X, CARD_Y, isDone);
        drawArmAndBasket(basketX);

        for (const it of items) {
          const ix = basketX + it.offsetX;
          if (it.amount === 10) drawPack10(ix, it.y, it.rot);
          else if (it.amount === 5) drawPack5(ix, it.y, it.rot);
          else drawApple(ix, it.y, it.rot);
        }

        drawBasketFront(basketX);
      }
    }

    function loop(ts) {
      if (!lastTs) lastTs = ts;
      const dt = Math.min((ts - lastTs) / 1000, 0.05);
      lastTs = ts;
      update(dt);
      render();
      requestAnimationFrame(loop);
    }

    startRound();
    requestAnimationFrame(loop);
  }

  document.querySelectorAll('[data-widget="counting-arabic"]').forEach(initWidget);
})();

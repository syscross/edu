(() => {
  const CSS = `
    .edu-tally-stage {
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
    .edu-tally-canvas {
      display: block;
      width: 100%;
      height: auto;
      aspect-ratio: 4 / 3;
      cursor: pointer;
      touch-action: manipulation;
    }
    .edu-tally-hint {
      padding: 8px 14px;
      font-size: 13px;
      color: #8b949e;
      text-align: center;
      border-top: 1px solid #21262d;
      background: #0d1117;
    }
  `;

  if (!document.getElementById("edu-tally-widget-style")) {
    const style = document.createElement("style");
    style.id = "edu-tally-widget-style";
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const easeInCubic = (t) => t * t * t;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  function initWidget(root) {
    if (root.dataset.mounted) return;
    root.dataset.mounted = "1";

    const stage = document.createElement("div");
    stage.className = "edu-tally-stage";

    const canvas = document.createElement("canvas");
    canvas.className = "edu-tally-canvas";
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", "석판 눈금 개수만큼 사과 담기 인터랙티브 위젯");

    const hint = document.createElement("div");
    hint.className = "edu-tally-hint";
    hint.textContent = "화면을 클릭하거나 탭해서 석판의 눈금만큼 사과를 담아 보세요";

    stage.appendChild(canvas);
    stage.appendChild(hint);
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

    const REST_X = 195;
    const OFF_X = 630;
    const BASKET_Y = 266;
    const BASKET_W = 156;
    const BASKET_H = 68;
    const SLATE_OFFSET_X = 128;
    const SLATE_Y = 104;

    let state = "ENTERING";
    let stateTime = 0;
    let basketX = OFF_X;
    let target = 0;
    let lastTarget = 0;
    let mode = "tally"; // "tally" | "jeong"
    let apples = [];
    let ripples = [];
    let lastTs = 0;

    function pickTarget() {
      let next;
      do {
        next = Math.floor(Math.random() * 15) + 6; // 6 ~ 20
      } while (next === lastTarget);
      lastTarget = next;
      return next;
    }

    function startRound() {
      target = pickTarget();
      mode = Math.random() < 0.5 ? "tally" : "jeong";
      apples = [];
      basketX = OFF_X;
      state = "ENTERING";
      stateTime = 0;
    }

    function spawnApple(clientX, clientY) {
      if (state !== "COLLECTING") return;
      if (apples.length >= target) return;

      const rect = canvas.getBoundingClientRect();
      const tapX = (clientX - rect.left) * (W / rect.width);
      const tapY = (clientY - rect.top) * (H / rect.height);

      ripples.push({ x: tapX, y: tapY, r: 4, alpha: 0.6 });

      const minOff = -BASKET_W * 0.35;
      const maxOff = BASKET_W * 0.35;
      const offsetX = clamp((tapX - basketX) * 0.65 + (Math.random() - 0.5) * 14, minOff, maxOff);
      const startY = clamp(tapY, 110, 175);

      apples.push({
        offsetX,
        y: startY,
        vy: 0,
        settled: false,
        rot: (Math.random() - 0.5) * 0.35,
      });

      if (apples.length === target) {
        state = "SETTLE";
        stateTime = 0;
      }
    }

    canvas.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      spawnApple(e.clientX, e.clientY);
    });

    function drawApple(x, y, rot) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);

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

    // 한 칸(1~5)에 탈리 마크(4빗금 + 가로선) 그리기
    function drawTallyCell(cx, cy, count) {
      if (count <= 0) return;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.strokeStyle = "#f0f6fc";
      ctx.lineWidth = 2.6;
      ctx.lineCap = "round";

      const bars = Math.min(count, 4);
      const spacing = 8.5;
      const startX = -13;
      for (let i = 0; i < bars; i++) {
        const x = startX + i * spacing;
        ctx.beginPath();
        ctx.moveTo(x + 2, -13);
        ctx.lineTo(x - 2, 13);
        ctx.stroke();
      }
      if (count === 5) {
        ctx.strokeStyle = "#ffa657";
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(-19, 2);
        ctx.lineTo(19, -3);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 한 칸(1~5)에 바를 정(正) 획순 그리기
    function drawJeongCell(cx, cy, count) {
      if (count <= 0) return;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.strokeStyle = "#f0f6fc";
      ctx.lineWidth = 2.6;
      ctx.lineCap = "round";

      // 1획: 맨 위 가로선
      if (count >= 1) {
        ctx.beginPath();
        ctx.moveTo(-13, -12);
        ctx.lineTo(13, -12);
        ctx.stroke();
      }
      // 2획: 가운데 세로선
      if (count >= 2) {
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(0, 12);
        ctx.stroke();
      }
      // 3획: 가운데 오른쪽 짧은 가로선
      if (count >= 3) {
        ctx.beginPath();
        ctx.moveTo(0, -1);
        ctx.lineTo(11, -1);
        ctx.stroke();
      }
      // 4획: 왼쪽 짧은 세로선
      if (count >= 4) {
        ctx.beginPath();
        ctx.moveTo(-9, -2);
        ctx.lineTo(-9, 12);
        ctx.stroke();
      }
      // 5획: 맨 아래 긴 가로선 (완성 시 강조)
      if (count >= 5) {
        ctx.strokeStyle = "#ffa657";
        ctx.beginPath();
        ctx.moveTo(-15, 12);
        ctx.lineTo(15, 12);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 오른쪽에서 고객이 들고 나온 2x2 석판 주문서
    function drawSlate(sx, sy, total, isDone) {
      const slateW = 124;
      const slateH = 112;

      ctx.save();
      // 고객의 위쪽 팔/소매 (석판을 오른쪽에서 받쳐 듦)
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(-0.1);
      ctx.fillStyle = "#388bfd";
      ctx.beginPath();
      ctx.roundRect(slateW / 2 - 4, -8, W - sx + 140, 30, 15);
      ctx.fill();
      ctx.fillStyle = "#f0f6fc";
      ctx.beginPath();
      ctx.roundRect(slateW / 2 - 8, -9, 9, 32, 4);
      ctx.fill();
      ctx.restore();

      // 석판 몸통
      ctx.fillStyle = "#2d333b";
      ctx.strokeStyle = isDone ? "#3fb950" : "#586069";
      ctx.lineWidth = isDone ? 3 : 2.5;
      ctx.beginPath();
      ctx.roundRect(sx - slateW / 2, sy - slateH / 2, slateW, slateH, 10);
      ctx.fill();
      ctx.stroke();

      // 석판 안쪽 2x2 그리드 구분선
      ctx.strokeStyle = "rgba(139, 148, 158, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx, sy - slateH / 2 + 10);
      ctx.lineTo(sx, sy + slateH / 2 - 10);
      ctx.moveTo(sx - slateW / 2 + 10, sy);
      ctx.lineTo(sx + slateW / 2 - 10, sy);
      ctx.stroke();

      // 2x2 각 칸에 최대 5개씩 채움
      const cells = [
        { cx: sx - 28, cy: sy - 25 },
        { cx: sx + 28, cy: sy - 25 },
        { cx: sx - 28, cy: sy + 25 },
        { cx: sx + 28, cy: sy + 25 },
      ];

      let rem = total;
      for (const cell of cells) {
        const c = Math.min(rem, 5);
        if (c > 0) {
          if (mode === "tally") drawTallyCell(cell.cx, cell.cy, c);
          else drawJeongCell(cell.cx, cell.cy, c);
        }
        rem -= c;
      }

      // 석판 오른쪽 가장자리를 잡은 손가락
      ctx.fillStyle = "#f5caa4";
      ctx.strokeStyle = "#9c6b45";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(sx + slateW / 2 - 10, sy - 6, 22, 24, 9);
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
      const botHalf = BASKET_W * 0.36;

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

      const gravity = 1550;
      const floorY = BASKET_Y - 12;
      let allSettled = true;

      for (let i = 0; i < apples.length; i++) {
        const a = apples[i];
        const myFloor = floorY - Math.floor(i / 6) * 11;
        if (!a.settled) {
          a.vy += gravity * dt;
          a.y += a.vy * dt;
          if (a.y >= myFloor) {
            a.y = myFloor;
            if (Math.abs(a.vy) > 140) a.vy = -a.vy * 0.28;
            else {
              a.vy = 0;
              a.settled = true;
            }
          }
        }
        if (!a.settled) allSettled = false;
      }

      if (state === "SETTLE" && allSettled && stateTime >= 0.35) {
        state = "EXITING";
        stateTime = 0;
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        ripples[i].r += 90 * dt;
        ripples[i].alpha -= 1.8 * dt;
        if (ripples[i].alpha <= 0) ripples.splice(i, 1);
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

      for (const rp of ripples) {
        ctx.strokeStyle = `rgba(240, 246, 252, ${rp.alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (state !== "PAUSE") {
        const isDone = apples.length === target && target > 0;
        drawSlate(basketX + SLATE_OFFSET_X, SLATE_Y, target, isDone);
        drawArmAndBasket(basketX);

        for (const a of apples) {
          drawApple(basketX + a.offsetX, a.y, a.rot);
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

  document.querySelectorAll('[data-widget="counting-tally"]').forEach(initWidget);
})();

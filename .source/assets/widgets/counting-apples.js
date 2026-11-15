(() => {
  const CSS = `
    .edu-apple-stage {
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
    .edu-apple-canvas {
      display: block;
      width: 100%;
      height: auto;
      aspect-ratio: 4 / 3;
      cursor: pointer;
      touch-action: manipulation;
    }
    .edu-apple-hint {
      padding: 8px 14px;
      font-size: 13px;
      color: #8b949e;
      text-align: center;
      border-top: 1px solid #21262d;
      background: #0d1117;
    }
  `;

  if (!document.getElementById("edu-apple-widget-style")) {
    const style = document.createElement("style");
    style.id = "edu-apple-widget-style";
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function easeInCubic(t) {
    return t * t * t;
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function initWidget(root) {
    if (root.dataset.mounted) return;
    root.dataset.mounted = "1";

    const stage = document.createElement("div");
    stage.className = "edu-apple-stage";

    const canvas = document.createElement("canvas");
    canvas.className = "edu-apple-canvas";
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", "손가락 개수만큼 사과 담기 인터랙티브 위젯");

    const hint = document.createElement("div");
    hint.className = "edu-apple-hint";
    hint.textContent = "화면을 클릭하거나 탭해서 손가락 개수만큼 사과를 담아 보세요";

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

    // 오른쪽 손 + 바구니 기준 위치
    const REST_X = 215;
    const OFF_X = 620;
    const BASKET_Y = 262;
    const BASKET_W = 148;
    const BASKET_H = 68;

    // 고객의 위쪽 손 (손가락 1~5 표시, 오른쪽에서 뻗음)
    const HAND_OFFSET_X = 110;
    const HAND_Y = 112;

    let state = "ENTERING"; // ENTERING | COLLECTING | SETTLE | EXITING | PAUSE
    let stateTime = 0;
    let basketX = OFF_X;
    let target = 0;
    let lastTarget = 0;
    let apples = []; // { offsetX, y, vy, settled, rot }
    let ripples = []; // { x, y, r, alpha }
    let lastTs = 0;

    function pickTarget() {
      let next;
      do {
        next = Math.floor(Math.random() * 5) + 1;
      } while (next === lastTarget);
      lastTarget = next;
      return next;
    }

    function startRound() {
      target = pickTarget();
      apples = [];
      basketX = OFF_X;
      state = "ENTERING";
      stateTime = 0;
    }

    function spawnApple(clientX, clientY) {
      if (state !== "COLLECTING") return;
      if (apples.length >= target) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      const tapX = (clientX - rect.left) * scaleX;
      const tapY = (clientY - rect.top) * scaleY;

      ripples.push({ x: tapX, y: tapY, r: 4, alpha: 0.6 });

      const minOff = -BASKET_W * 0.34;
      const maxOff = BASKET_W * 0.34;
      const rawOff = tapX - basketX;
      const jitter = (Math.random() - 0.5) * 14;
      const offsetX = clamp(rawOff * 0.65 + jitter, minOff, maxOff);
      const startY = clamp(tapY, 128, 175);

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

    function drawApple(x, y, rot, scale = 1) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.scale(scale, scale);

      ctx.fillStyle = "#e5484d";
      ctx.beginPath();
      ctx.arc(-5, 0, 12, 0, Math.PI * 2);
      ctx.arc(5, 0, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(0, 3, 14, 13, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.28)";
      ctx.beginPath();
      ctx.ellipse(-6, -4, 3.2, 5.5, -0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#8d5b2d";
      ctx.lineWidth = 2.6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.quadraticCurveTo(2, -17, 5, -18);
      ctx.stroke();

      ctx.fillStyle = "#3fb950";
      ctx.beginPath();
      ctx.ellipse(6, -14, 6, 3.2, -0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // 오른쪽에서 고객이 뻗은 위쪽 손 (손가락 1~5개를 위로 펴서 표시)
    function drawTopHand(cx, cy, count, isDone) {
      ctx.save();
      ctx.translate(cx, cy);

      const skin = "#f5caa4";
      const skinDark = "#e0ad82";
      const outline = "#9c6b45";

      // 오른쪽 아래에서 부드럽게 올라오는 팔/소매
      ctx.save();
      ctx.rotate(-0.14);
      ctx.fillStyle = "#388bfd";
      ctx.beginPath();
      ctx.roundRect(22, -14, W - cx + 140, 32, 16);
      ctx.fill();

      // 소매 커프스
      ctx.fillStyle = "#f0f6fc";
      ctx.beginPath();
      ctx.roundRect(17, -15, 10, 34, 4);
      ctx.fill();
      ctx.restore();

      // 손목 ~ 손바닥 연결부 (부드러운 곡선 실루엣)
      ctx.fillStyle = skin;
      ctx.strokeStyle = outline;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(22, -10);
      ctx.quadraticCurveTo(18, -22, 6, -24);
      ctx.lineTo(-14, -22);
      ctx.quadraticCurveTo(-28, -18, -28, 2);
      ctx.quadraticCurveTo(-28, 20, -10, 22);
      ctx.lineTo(14, 20);
      ctx.quadraticCurveTo(24, 18, 24, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 엄지 (5일 때 펴고, 1~4일 때는 손바닥 앞으로 자연스럽게 접음)
      if (count >= 5) {
        ctx.save();
        ctx.translate(-22, 6);
        ctx.rotate(-0.68);
        ctx.fillStyle = skin;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-30, -6.5, 34, 13, 6.5);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // 4개 손가락 (검지, 중지, 약지, 소지) — 부채꼴 각도로 자연스럽게 배치
      const fingers = [
        { bx: -17, by: -18, angle: -0.13, len: 39, w: 11,   up: count >= 1 }, // 검지
        { bx: -6,  by: -20, angle: -0.04, len: 44, w: 11,   up: count >= 2 }, // 중지
        { bx: 5,   by: -19, angle: 0.05,  len: 40, w: 10.5, up: count >= 3 }, // 약지
        { bx: 16,  by: -16, angle: 0.15,  len: 32, w: 9.5,  up: count >= 4 }, // 소지
      ];

      // 1) 펴진 손가락 먼저 그리기 (손바닥 뒤/위쪽에서 뻗음)
      for (const f of fingers) {
        if (!f.up) continue;
        ctx.save();
        ctx.translate(f.bx, f.by);
        ctx.rotate(f.angle);

        ctx.fillStyle = skin;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-f.w / 2, -f.len, f.w, f.len + 7, f.w / 2);
        ctx.fill();
        ctx.stroke();

        // 손가락 끝 하이라이트
        ctx.fillStyle = "rgba(255,255,255,0.28)";
        ctx.beginPath();
        ctx.roundRect(-f.w / 4, -f.len + 4, f.w / 2, 5, 2.5);
        ctx.fill();

        ctx.restore();
      }

      // 손바닥 앞면 덮어주기 (펴진 손가락 뿌리가 자연스럽게 이어지도록)
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.ellipse(-2, 0, 22, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // 손바닥 손금 라인 (은은하게)
      ctx.strokeStyle = "rgba(156, 107, 69, 0.35)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-14, -4);
      ctx.quadraticCurveTo(0, -1, 13, 4);
      ctx.stroke();

      // 2) 접힌 손가락은 손바닥 위로 말려 내려온 둥근 마디로 그리기
      for (const f of fingers) {
        if (f.up) continue;
        ctx.save();
        ctx.translate(f.bx, f.by + 11);
        ctx.rotate(f.angle * 0.5);

        ctx.fillStyle = skinDark;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(-f.w / 2, -11, f.w, 17, f.w / 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // 1~4일 때 접힌 엄지가 접힌 손가락 위에 얹히도록 마지막에 그리기
      if (count < 5) {
        ctx.save();
        ctx.translate(-15, 6);
        ctx.rotate(-0.22);
        ctx.fillStyle = skinDark;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(-8, -6, 26, 12, 6);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      if (isDone) {
        ctx.strokeStyle = "rgba(86, 211, 100, 0.75)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(-2, -14, 50, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }

    function drawArmAndBasket(bx) {
      const rightEdge = bx + BASKET_W / 2;

      ctx.save();
      // 오른쪽 팔 소매
      ctx.fillStyle = "#388bfd";
      ctx.beginPath();
      ctx.roundRect(rightEdge + 22, BASKET_Y - 12, W - rightEdge + 120, 34, 17);
      ctx.fill();

      // 커프스
      ctx.fillStyle = "#f0f6fc";
      ctx.fillRect(rightEdge + 18, BASKET_Y - 13, 10, 36);

      // 손
      ctx.fillStyle = "#f2c6a0";
      ctx.beginPath();
      ctx.roundRect(rightEdge - 8, BASKET_Y - 10, 32, 30, 12);
      ctx.fill();

      // 엄지
      ctx.beginPath();
      ctx.roundRect(rightEdge - 10, BASKET_Y - 16, 16, 10, 5);
      ctx.fill();
      ctx.restore();

      // 바구니 뒤쪽 테두리
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
        const dur = 0.48;
        const t = Math.min(stateTime / dur, 1);
        basketX = OFF_X + (REST_X - OFF_X) * easeOutCubic(t);
        if (t >= 1) {
          basketX = REST_X;
          state = "COLLECTING";
          stateTime = 0;
        }
      } else if (state === "EXITING") {
        const dur = 0.52;
        const t = Math.min(stateTime / dur, 1);
        basketX = REST_X + (OFF_X - REST_X) * easeInCubic(t);
        if (t >= 1) {
          state = "PAUSE";
          stateTime = 0;
        }
      } else if (state === "PAUSE") {
        if (stateTime >= 0.18) {
          startRound();
        }
      }

      const gravity = 1550;
      const floorY = BASKET_Y - 12;
      let allSettled = true;

      for (let i = 0; i < apples.length; i++) {
        const a = apples[i];
        const layerOffset = Math.floor(i / 4) * 14;
        const myFloor = floorY - layerOffset;

        if (!a.settled) {
          a.vy += gravity * dt;
          a.y += a.vy * dt;
          if (a.y >= myFloor) {
            a.y = myFloor;
            if (Math.abs(a.vy) > 140) {
              a.vy = -a.vy * 0.28;
            } else {
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
        drawTopHand(basketX + HAND_OFFSET_X, HAND_Y, target, isDone);
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

  document.querySelectorAll('[data-widget="counting-apples"]').forEach(initWidget);
})();

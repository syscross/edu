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
    canvas.setAttribute("aria-label", "사과 수 세기 인터랙티브 위젯");

    const hint = document.createElement("div");
    hint.className = "edu-apple-hint";
    hint.textContent = "화면을 클릭하거나 탭해서 숫자만큼 사과를 담아 보세요";

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

    // 바구니 기준 위치 (중앙~약간 왼쪽에 바구니, 오른쪽에서 손이 뻗음)
    const REST_X = 215;
    const OFF_X = 620;
    const BASKET_Y = 250;
    const BASKET_W = 148;
    const BASKET_H = 68;

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
        next = Math.floor(Math.random() * 9) + 1;
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

      // 바구니 입구 안으로 자연스럽게 들어가도록 X 오프셋 계산
      const minOff = -BASKET_W * 0.34;
      const maxOff = BASKET_W * 0.34;
      const rawOff = tapX - basketX;
      const jitter = (Math.random() - 0.5) * 14;
      const offsetX = clamp(rawOff * 0.65 + jitter, minOff, maxOff);

      // 사과가 위쪽에서 떨어지도록 (탭 위치가 바구니보다 위면 그 높이, 아래면 상단에서)
      const startY = clamp(tapY, 36, 130);

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

      // 그림자/바디
      ctx.fillStyle = "#e5484d";
      ctx.beginPath();
      ctx.arc(-5, 0, 12, 0, Math.PI * 2);
      ctx.arc(5, 0, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(0, 3, 14, 13, 0, 0, Math.PI * 2);
      ctx.fill();

      // 하이라이트
      ctx.fillStyle = "rgba(255,255,255,0.28)";
      ctx.beginPath();
      ctx.ellipse(-6, -4, 3.2, 5.5, -0.4, 0, Math.PI * 2);
      ctx.fill();

      // 꼭지
      ctx.strokeStyle = "#8d5b2d";
      ctx.lineWidth = 2.6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.quadraticCurveTo(2, -17, 5, -18);
      ctx.stroke();

      // 잎
      ctx.fillStyle = "#3fb950";
      ctx.beginPath();
      ctx.ellipse(6, -14, 6, 3.2, -0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function drawArmAndBasket(bx) {
      const rightEdge = bx + BASKET_W / 2;

      // 오른쪽에서 뻗어 나오는 팔 + 손
      ctx.save();
      // 소매 / 팔
      ctx.fillStyle = "#388bfd";
      ctx.beginPath();
      ctx.roundRect(rightEdge + 22, BASKET_Y - 12, W - rightEdge + 120, 34, 17);
      ctx.fill();

      // 손목 커프스
      ctx.fillStyle = "#f0f6fc";
      ctx.fillRect(rightEdge + 18, BASKET_Y - 13, 10, 36);

      // 손바닥 + 손가락 (바구니 오른쪽 손잡이를 잡은 모습)
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
      // 바구니 몸통 (사다리꼴 둥근 바닥)
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

      // 격자 무늬 (바구니 결)
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

      // 바구니 윗입구 림
      ctx.fillStyle = "#dfa358";
      ctx.strokeStyle = "#8a5a2b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(bx - topHalf - 4, topY - 7, BASKET_W + 8, 13, 6.5);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    function drawBadge(bx) {
      // 손 위쪽 말풍선 / 목표 숫자 카드
      const cardX = bx + 98;
      const cardY = 104;
      const isDone = apples.length === target && target > 0;

      ctx.save();
      // 말풍선 카드
      ctx.fillStyle = isDone ? "#1a3b27" : "#0d1117";
      ctx.strokeStyle = isDone ? "#3fb950" : "#30363d";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(cardX - 54, cardY - 46, 108, 92, 16);
      ctx.fill();
      ctx.stroke();

      // 목표 숫자 (크게)
      ctx.fillStyle = isDone ? "#56d364" : "#f0f6fc";
      ctx.font = "700 44px 'Noto Sans Mono', ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(target), cardX, cardY - 6);

      // 현재 진행도 (작게)
      ctx.fillStyle = isDone ? "#7ee787" : "#8b949e";
      ctx.font = "600 13px 'Noto Sans Mono', ui-monospace, monospace";
      ctx.fillText(`${apples.length} / ${target}`, cardX, cardY + 29);
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

      // 사과 낙하 물리
      const gravity = 1550;
      const floorY = BASKET_Y - 12;
      let allSettled = true;

      for (let i = 0; i < apples.length; i++) {
        const a = apples[i];
        // 쌓인 느낌을 주기 위해 인덱스별로 살짝 다른 착지 높이
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

      // 탭 리플
      for (let i = ripples.length - 1; i >= 0; i--) {
        ripples[i].r += 90 * dt;
        ripples[i].alpha -= 1.8 * dt;
        if (ripples[i].alpha <= 0) ripples.splice(i, 1);
      }
    }

    function render() {
      ctx.clearRect(0, 0, W, H);

      // 은은한 배경 점선/바닥선
      ctx.strokeStyle = "#21262d";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(24, BASKET_Y + BASKET_H / 2 + 12);
      ctx.lineTo(W - 24, BASKET_Y + BASKET_H / 2 + 12);
      ctx.stroke();

      // 탭 리플
      for (const rp of ripples) {
        ctx.strokeStyle = `rgba(240, 246, 252, ${rp.alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (state !== "PAUSE") {
        drawArmAndBasket(basketX);

        // 바구니 안/위 사과 그리기
        for (const a of apples) {
          drawApple(basketX + a.offsetX, a.y, a.rot);
        }

        drawBasketFront(basketX);
        drawBadge(basketX);
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

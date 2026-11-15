(() => {
  const CSS = `
    .edu-base-stage {
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
    .edu-base-body {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 22px 14px 18px;
    }
    .edu-base-step {
      flex: 0 0 auto;
      width: 50px;
      height: 64px;
      border: 1px solid #30363d;
      border-radius: 10px;
      background: #0d1117;
      color: #f0f6fc;
      font-family: "Noto Sans Mono", ui-monospace, monospace;
      font-size: 18px;
      font-weight: 700;
      cursor: pointer;
      touch-action: manipulation;
      transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.08s ease, opacity 0.15s ease;
    }
    .edu-base-step:hover:not(:disabled) {
      background: #1f2937;
      border-color: #58a6ff;
    }
    .edu-base-step:active:not(:disabled) {
      transform: scale(0.95);
    }
    .edu-base-step:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    .edu-base-digits {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 8px;
      flex: 1;
      min-width: 0;
    }
    .edu-base-cell {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }
    .edu-base-place {
      font-family: "Noto Sans Mono", ui-monospace, monospace;
      font-size: 11px;
      color: #8b949e;
      letter-spacing: 0.02em;
    }
    .edu-base-box {
      width: 100%;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #30363d;
      border-radius: 10px;
      background: #0d1117;
      color: #f0f6fc;
      font-family: "Noto Sans Mono", ui-monospace, monospace;
      font-size: 28px;
      font-weight: 700;
      transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease, transform 0.12s ease;
    }
    .edu-base-box.is-clickable {
      cursor: pointer;
    }
    .edu-base-box.is-clickable:hover {
      border-color: #58a6ff;
    }
    .edu-base-box.is-on {
      background: #132c4e;
      border-color: #58a6ff;
      color: #79c0ff;
    }
    .edu-base-box.is-flash {
      border-color: #3fb950;
      transform: translateY(-2px);
    }
    .edu-base-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 9px 14px;
      font-size: 13px;
      color: #8b949e;
      border-top: 1px solid #21262d;
      background: #0d1117;
    }
    .edu-base-dec {
      font-family: "Noto Sans Mono", ui-monospace, monospace;
      color: #f0f6fc;
      font-weight: 700;
    }
    @media (max-width: 400px) {
      .edu-base-body {
        gap: 6px;
        padding: 18px 10px 14px;
      }
      .edu-base-step {
        width: 42px;
        height: 54px;
        font-size: 15px;
      }
      .edu-base-digits {
        gap: 5px;
      }
      .edu-base-box {
        height: 54px;
        font-size: 22px;
      }
    }
  `;

  if (!document.getElementById("edu-base-widget-style")) {
    const style = document.createElement("style");
    style.id = "edu-base-widget-style";
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function initWidget(root) {
    if (root.dataset.mounted) return;
    root.dataset.mounted = "1";

    const base = parseInt(root.dataset.base || "10", 10);
    const digits = parseInt(root.dataset.digits || "4", 10);
    const maxVal = Math.pow(base, digits) - 1;
    let value = parseInt(root.dataset.initial || "0", 10);

    const stage = document.createElement("div");
    stage.className = "edu-base-stage";

    const body = document.createElement("div");
    body.className = "edu-base-body";

    const btnMinus = document.createElement("button");
    btnMinus.type = "button";
    btnMinus.className = "edu-base-step";
    btnMinus.textContent = "-1";
    btnMinus.setAttribute("aria-label", "1 빼기");

    const btnPlus = document.createElement("button");
    btnPlus.type = "button";
    btnPlus.className = "edu-base-step";
    btnPlus.textContent = "+1";
    btnPlus.setAttribute("aria-label", "1 더하기");

    const grid = document.createElement("div");
    grid.className = "edu-base-digits";

    const boxes = [];
    for (let i = digits - 1; i >= 0; i--) {
      const placeVal = Math.pow(base, i);
      const cell = document.createElement("div");
      cell.className = "edu-base-cell";

      const place = document.createElement("div");
      place.className = "edu-base-place";
      place.textContent = String(placeVal);

      const box = document.createElement("div");
      box.className = "edu-base-box";
      if (base === 2) {
        box.classList.add("is-clickable");
        box.setAttribute("role", "button");
        box.setAttribute("tabindex", "0");
        box.setAttribute("aria-label", `${placeVal} 자리 비트 전환`);
        const toggleBit = () => {
          const prev = value;
          value = value ^ placeVal;
          render(prev);
        };
        box.addEventListener("click", toggleBit);
        box.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleBit();
          }
        });
      }

      cell.append(place, box);
      grid.appendChild(cell);
      boxes.push({ box, placeVal });
    }

    body.append(btnMinus, grid, btnPlus);

    const footer = document.createElement("div");
    footer.className = "edu-base-footer";
    const labelSpan = document.createElement("span");
    labelSpan.textContent =
      base === 2
        ? "2진법 (스위치를 눌러도 바뀝니다)"
        : "10진법 (0~9가 차면 다음 자리로)";
    const decSpan = document.createElement("span");
    decSpan.className = "edu-base-dec";
    footer.append(labelSpan, decSpan);

    stage.append(body, footer);
    root.appendChild(stage);

    function toDigits(v) {
      const str = v.toString(base).padStart(digits, "0");
      return str.split("");
    }

    function render(prevValue = value) {
      const curArr = toDigits(value);
      const prevArr = toDigits(prevValue);

      curArr.forEach((ch, idx) => {
        const { box } = boxes[idx];
        box.textContent = ch;
        if (base === 2) {
          box.classList.toggle("is-on", ch === "1");
        }
        if (ch !== prevArr[idx] && prevValue !== value) {
          box.classList.remove("is-flash");
          void box.offsetWidth;
          box.classList.add("is-flash");
          setTimeout(() => box.classList.remove("is-flash"), 220);
        }
      });

      btnMinus.disabled = value <= 0;
      btnPlus.disabled = value >= maxVal;
      decSpan.textContent = base === 2 ? `10진수 = ${value}` : `값 = ${value}`;
    }

    btnMinus.addEventListener("click", () => {
      if (value > 0) {
        const prev = value;
        value -= 1;
        render(prev);
      }
    });

    btnPlus.addEventListener("click", () => {
      if (value < maxVal) {
        const prev = value;
        value += 1;
        render(prev);
      }
    });

    render();
  }

  document.querySelectorAll('[data-widget="counter-base"]').forEach(initWidget);
})();

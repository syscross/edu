(() => {
  const CSS = `
    .edu-px-stage {
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
    .edu-px-body {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      padding: 18px 16px;
    }
    .edu-px-panel {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 4px;
      padding: 8px;
      background: #0d1117;
      border: 1px solid #30363d;
      border-radius: 10px;
      box-sizing: border-box;
    }
    .edu-px-cell,
    .edu-px-bit {
      width: 100%;
      aspect-ratio: 1 / 1;
      padding: 0;
      border: 1px solid #30363d;
      border-radius: 5px;
      cursor: pointer;
      touch-action: manipulation;
      transition: background-color 0.12s ease, border-color 0.12s ease, color 0.12s ease;
    }
    .edu-px-cell {
      background: #161b22;
    }
    .edu-px-cell.is-on {
      background: #f0f6fc;
      border-color: #f0f6fc;
    }
    .edu-px-bit {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #161b22;
      color: #8b949e;
      font-family: "Noto Sans Mono", ui-monospace, monospace;
      font-size: 15px;
      font-weight: 700;
    }
    .edu-px-bit.is-on {
      background: #132c4e;
      border-color: #58a6ff;
      color: #79c0ff;
    }
    .edu-px-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 14px;
      font-size: 13px;
      color: #8b949e;
      border-top: 1px solid #21262d;
      background: #0d1117;
    }
    .edu-px-actions {
      display: flex;
      gap: 6px;
    }
    .edu-px-btn {
      padding: 4px 10px;
      border: 1px solid #30363d;
      border-radius: 6px;
      background: #161b22;
      color: #c9d1d9;
      font-family: inherit;
      font-size: 12px;
      cursor: pointer;
      touch-action: manipulation;
    }
    .edu-px-btn:hover {
      border-color: #58a6ff;
      color: #f0f6fc;
    }
    @media (max-width: 420px) {
      .edu-px-body {
        gap: 10px;
        padding: 14px 12px;
      }
      .edu-px-panel {
        gap: 3px;
        padding: 6px;
      }
      .edu-px-bit {
        font-size: 13px;
      }
    }
  `;

  if (!document.getElementById("edu-px-widget-style")) {
    const style = document.createElement("style");
    style.id = "edu-px-widget-style";
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  // 기본 5x5 A 모양 패턴
  const SIZE = 5;
  const DEFAULT_PATTERN = [
    0, 1, 1, 1, 0,
    1, 0, 0, 0, 1,
    1, 1, 1, 1, 1,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
  ];

  function initWidget(root) {
    if (root.dataset.mounted) return;
    root.dataset.mounted = "1";

    let pixels = [...DEFAULT_PATTERN];

    const stage = document.createElement("div");
    stage.className = "edu-px-stage";

    const body = document.createElement("div");
    body.className = "edu-px-body";

    const grid = document.createElement("div");
    grid.className = "edu-px-panel";

    const bitsWrap = document.createElement("div");
    bitsWrap.className = "edu-px-panel";

    const cellEls = [];
    const bitEls = [];

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const idx = r * SIZE + c;

        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "edu-px-cell";
        cell.setAttribute("aria-label", `${r + 1}행 ${c + 1}열 픽셀 전환`);

        const bit = document.createElement("button");
        bit.type = "button";
        bit.className = "edu-px-bit";
        bit.setAttribute("aria-label", `${r + 1}행 ${c + 1}열 비트 전환`);

        const toggle = () => {
          pixels[idx] = pixels[idx] ? 0 : 1;
          render();
        };
        cell.addEventListener("click", toggle);
        bit.addEventListener("click", toggle);

        grid.appendChild(cell);
        bitsWrap.appendChild(bit);
        cellEls.push(cell);
        bitEls.push(bit);
      }
    }

    body.append(grid, bitsWrap);

    const footer = document.createElement("div");
    footer.className = "edu-px-footer";

    const hint = document.createElement("span");
    hint.textContent = "그림 한 칸 = 비트 1개 (켜짐 1 / 꺼짐 0)";

    const actions = document.createElement("div");
    actions.className = "edu-px-actions";

    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "edu-px-btn";
    clearBtn.textContent = "비우기";
    clearBtn.addEventListener("click", () => {
      pixels.fill(0);
      render();
    });

    const resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.className = "edu-px-btn";
    resetBtn.textContent = "기본값";
    resetBtn.addEventListener("click", () => {
      pixels = [...DEFAULT_PATTERN];
      render();
    });

    actions.append(clearBtn, resetBtn);
    footer.append(hint, actions);

    stage.append(body, footer);
    root.appendChild(stage);

    function render() {
      pixels.forEach((v, i) => {
        cellEls[i].classList.toggle("is-on", v === 1);
        bitEls[i].classList.toggle("is-on", v === 1);
        bitEls[i].textContent = String(v);
      });
    }

    render();
  }

  document.querySelectorAll('[data-widget="binary-pixels"]').forEach(initWidget);
})();

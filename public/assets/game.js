(() => {
  const main = document.querySelector("main.main");
  const header = document.querySelector(".app-header");
  const gameboardEl = document.getElementById("gameboard");
  const infoPopup = document.getElementById("info-popup");
  const infoTextEl = document.getElementById("info-text");
  const infoCloseBtns = infoPopup
    ? infoPopup.querySelectorAll('[data-action="close-info"]')
    : [];
  const audioBtn = document.querySelector('[data-action="toggle-audio"]');
  const restartBtn = document.querySelector('[data-action="restart"]');
  const infoBtn = document.querySelector('[data-action="show-info"]');

  const ROWS = parseInt(gameboardEl.dataset.rows, 10) || 5;
  const COLS = parseInt(gameboardEl.dataset.cols, 10) || 6;
  let board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  let currentPlayer = 1;
  let gameOver = false;
  let playerIconIndex = { 1: 0, 2: 0 };
  let audioOn = true;
  let audioCtx = null;

  function init() {
    document.querySelectorAll(".column").forEach((colEl) => {
      colEl.addEventListener("click", () =>
        handleColumnClick(parseInt(colEl.dataset.col, 10)),
      );
      colEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleColumnClick(parseInt(colEl.dataset.col, 10));
        }
      });
    });

    if (restartBtn) restartBtn.addEventListener("click", restartGame);
    if (audioBtn) audioBtn.addEventListener("click", toggleAudio);
    if (infoBtn) infoBtn.addEventListener("click", showInfo);
    infoCloseBtns.forEach((btn) => btn.addEventListener("click", closeInfo));
  }

  function handleColumnClick(col) {
    if (gameOver) return;
    const row = findAvailableRow(col);
    if (row === -1) return;
    placeToken(row, col, currentPlayer);
    if (audioOn) playDropSound();
    if (checkWin(row, col, currentPlayer)) {
      gameOver = true;
      playWinSound();
      showResult(`Player ${currentPlayer} wins`);
      return;
    }
    if (checkTie()) {
      gameOver = true;
      playDrawSound();
      showResult("It's a tie");
      return;
    }
    currentPlayer = currentPlayer === 1 ? 2 : 1;
  }

  function findAvailableRow(col) {
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][col] === null) return r;
    }
    return -1;
  }

  function placeToken(row, col, player) {
    board[row][col] = player;
    const columnEl = document.querySelector(`.column[data-col="${col}"]`);
    const slotEl = columnEl.querySelector(`.slot[data-row="${row}"]`);

    // Background coin element (separate so we can recolor it per player without affecting the overlay icon)
    const coinBg = document.createElement("div");
    coinBg.className = `coin-bg player${player}`; // coin-bg.player1 / coin-bg.player2

    // Overlay wrapper (will clip the large sprite to the overlay area)
    const iconWrap = document.createElement("div");
    iconWrap.className = "coin-icon"; // uses same CSS sizing (width/height)
    iconWrap.style.position = "absolute";
    iconWrap.style.overflow = "hidden";
    iconWrap.style.left = "50%";
    iconWrap.style.top = "50%";
    iconWrap.style.transform = "translate(-50%, -50%)";

    // Inside wrapper we will place an <img> for the sprite; hiding until loaded
    const spriteImg = document.createElement("img");
    spriteImg.style.position = "absolute";
    spriteImg.style.left = "0px";
    spriteImg.style.top = "0px";
    spriteImg.style.display = "block";
    spriteImg.style.visibility = "hidden";
    spriteImg.alt = "";

    const spriteSrc = `/assets/player${player}_icons.svg`;

    // Append elements first so we can measure overlay size
    slotEl.appendChild(coinBg);
    slotEl.appendChild(iconWrap);
    iconWrap.appendChild(spriteImg);

    // Measure overlay (wrap) size
    const overlayWidth =
      iconWrap.offsetWidth ||
      iconWrap.clientWidth ||
      parseFloat(getComputedStyle(iconWrap).width) ||
      48;
    const overlayHeight =
      iconWrap.offsetHeight ||
      iconWrap.clientHeight ||
      parseFloat(getComputedStyle(iconWrap).height) ||
      overlayWidth;

    const FRAME = 540; // original frame size in the sprite (user-specified)

    // Assume logical sprite layout is 2700x1620 (5 cols × 3 rows of 540px frames)
    const SPRITE_LOGICAL_WIDTH = 2700;
    const SPRITE_LOGICAL_HEIGHT = 1620;
    const cols = Math.max(1, Math.round(SPRITE_LOGICAL_WIDTH / FRAME));
    const rows = Math.max(1, Math.round(SPRITE_LOGICAL_HEIGHT / FRAME));
    const total = cols * rows;

    const idxTotal = playerIconIndex[player] % total;
    const colIdx = idxTotal % cols;
    const rowIdx = Math.floor(idxTotal / cols);

    // compute scale so each FRAME maps to overlayWidth
    const scale = overlayWidth / FRAME;
    const imgW = Math.round(SPRITE_LOGICAL_WIDTH * scale);
    const imgH = Math.round(SPRITE_LOGICAL_HEIGHT * scale);

    // Set sprite <img> size and position to show the correct frame
    spriteImg.onload = function () {
      spriteImg.style.visibility = "visible";
    };
    spriteImg.style.width = imgW + "px";
    spriteImg.style.height = imgH + "px";
    spriteImg.style.left = `-${Math.round(colIdx * FRAME * scale)}px`;
    spriteImg.style.top = `-${Math.round(rowIdx * FRAME * scale)}px`;
    spriteImg.src = spriteSrc;

    playerIconIndex[player] = playerIconIndex[player] + 1;
  }

  function countInDirection(row, col, player, dRow, dCol) {
    let count = 1;
    let r = row + dRow,
      c = col + dCol;
    while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
      count++;
      r += dRow;
      c += dCol;
    }
    r = row - dRow;
    c = col - dCol;
    while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
      count++;
      r -= dRow;
      c -= dCol;
    }
    return count;
  }

  function checkWin(row, col, player) {
    return (
      countInDirection(row, col, player, 0, 1) >= 4 ||
      countInDirection(row, col, player, 1, 0) >= 4 ||
      countInDirection(row, col, player, 1, 1) >= 4 ||
      countInDirection(row, col, player, 1, -1) >= 4
    );
  }

  function checkTie() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c] === null) return false;
      }
    }
    return true;
  }

  function restartGame() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    currentPlayer = 1;
    gameOver = false;
    playerIconIndex = { 1: 0, 2: 0 };
    document.querySelectorAll(".slot").forEach((s) => {
      while (s.firstChild) s.removeChild(s.firstChild);
    });
    const res = document.getElementById("result-overlay");
    if (res) res.remove();
  }

  function toggleAudio() {
    audioOn = !audioOn;
    audioBtn.classList.toggle("muted", !audioOn);
    audioBtn.setAttribute("aria-pressed", String(audioOn));
  }

  function playWinSound() {
    if (!audioOn) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      const sound = new Audio("/assets/win_sound.wav");
      sound.play();
    } catch (err) {
      // ignore
    }
  }

  function playDrawSound() {
    if (!audioOn) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      const sound = new Audio("/assets/draw_sound.wav");
      sound.play();
    } catch (err) {
      // ignore
    }
  }

  function playDropSound() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.frequency.value = 400; // Lower frequency for a heavier feel
      o.type = "triangle"; // Triangle wave for a softer, more plastic sound
      g.gain.value = 0.05; // Slightly higher initial gain
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08); // Exponential decay
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start();
      o.stop(audioCtx.currentTime + 0.06);
    } catch (err) {
      // ignore
    }
  }

  async function showInfo() {
    try {
      const txt = `Connect 4 is a two-player game where players take turns dropping colored discs into the gameboard. Each disc falls to the lowest available space in a column, and players continue placing discs until the board fills up or someone connects four.

To win, be the first player to connect four of your discs in a row horizontally, vertically, or diagonally.`;
      infoTextEl.textContent = txt;
      infoPopup.classList.add("visible");
      main.classList.add("blurred");
      header.classList.add("blurred");
    } catch (err) {
      infoTextEl.textContent = "Failed to load help text.";
      infoPopup.classList.add("visible");
      main.classList.add("blurred");
      header.classList.add("blurred");
    }
  }

  function closeInfo() {
    infoPopup.classList.remove("visible");
    main.classList.remove("blurred");
    header.classList.remove("blurred");
  }

  function showResult(message) {
    // remove any existing result banner
    const prev = document.getElementById("result-overlay");
    if (prev) prev.remove();

    const container = document.createElement("div");
    container.id = "result-overlay";

    const msg = document.createElement("div");
    msg.className = "result-message";
    msg.textContent = message;

    const btn = document.createElement("button");
    btn.id = "overlay-restart";
    btn.textContent = "Restart";
    btn.addEventListener("click", () => {
      if (container && container.parentNode)
        container.parentNode.removeChild(container);
      restartGame();
    });

    container.appendChild(msg);
    container.appendChild(btn);

    // Insert the result banner immediately after the game wrapper so it appears below the board
    const wrapper =
      document.getElementById("game-wrapper") || gameboardEl.parentElement;
    if (wrapper && wrapper.parentNode) {
      wrapper.parentNode.insertBefore(container, wrapper.nextSibling);
    } else if (main) {
      main.appendChild(container);
    } else {
      document.body.appendChild(container);
    }
  }

  window.addEventListener("DOMContentLoaded", init);
})();

// Enhanced interactivity, visuals, and sound for the Valentine proposal page.
// - Smarter No dodge (distance-based, smooth)
// - Floating hearts background particles
// - Confetti hearts + typed overlay message + WebAudio chime

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const noBtn = document.getElementById('noBtn');
  const yesBtn = document.getElementById('yesBtn');
  const btnRow = document.getElementById('btnRow');
  const overlay = document.getElementById('overlay');
  const closeOverlay = document.getElementById('closeOverlay') || document.getElementById('closeOverlay'); // closeOverlay is dynamic only in overlay actions
  const confettiRoot = document.getElementById('confetti');
  const floatingHeartsRoot = document.getElementById('floatingHearts');
  const typedEl = document.getElementById('typed');
  const shareBtn = document.getElementById('shareBtn');

  // Safety checks
  if (!noBtn || !yesBtn || !btnRow) return;

  // Utility
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  // Ensure container is positioned
  btnRow.style.position = 'relative';

  // INITIAL POSITIONING
  function setInitialPositions() {
    const rowRect = btnRow.getBoundingClientRect();
    const yesRect = yesBtn.getBoundingClientRect();
    const noRect = noBtn.getBoundingClientRect();

    // Place Yes near left center
    const yesLeft = Math.round(rowRect.width * 0.12);
    const yesTop = Math.round((rowRect.height - yesRect.height) / 2);
    yesBtn.style.position = 'absolute';
    yesBtn.style.left = `${yesLeft}px`;
    yesBtn.style.top = `${yesTop}px`;

    // Place No near right center
    const noLeft = Math.round(rowRect.width - noRect.width - (rowRect.width * 0.12));
    const noTop = Math.round((rowRect.height - noRect.height) / 2);
    noBtn.style.position = 'absolute';
    noBtn.style.left = `${noLeft}px`;
    noBtn.style.top = `${noTop}px`;
  }

  // Move No away smoothly using pointer distance and animate wiggle
  function moveNoAwayFromPointer(clientX, clientY) {
    const rowRect = btnRow.getBoundingClientRect();
    const noRect = noBtn.getBoundingClientRect();
    const localX = clientX - rowRect.left;
    const localY = clientY - rowRect.top;

    const noCenterX = (noRect.left - rowRect.left) + noRect.width / 2;
    const noCenterY = (noRect.top - rowRect.top) + noRect.height / 2;

    const dx = noCenterX - localX;
    const dy = noCenterY - localY;
    const dist = Math.hypot(dx, dy) || 1;

    // threshold scales with row width
    const threshold = Math.max(80, Math.min(160, rowRect.width * 0.16));
    if (dist > threshold + 10) return; // far enough; no move

    // Move amount grows when pointer is closer
    const push = threshold + 50 + (1 - clamp(dist / threshold, 0, 1)) * 140;
    const nx = noCenterX + (dx / dist) * push + (Math.random() * 60 - 30);
    const ny = noCenterY + (dy / dist) * push + (Math.random() * 40 - 20);

    const maxLeft = rowRect.width - noRect.width - 8;
    const maxTop = rowRect.height - noRect.height - 8;
    const clampedX = clamp(nx - noRect.width / 2, 8, maxLeft);
    const clampedY = clamp(ny - noRect.height / 2, 8, maxTop);

    // Smooth movement using CSS transitions
    noBtn.style.transition = 'left 280ms cubic-bezier(.2,.9,.3,1), top 280ms cubic-bezier(.2,.9,.3,1)';
    noBtn.style.left = `${Math.round(clampedX)}px`;
    noBtn.style.top = `${Math.round(clampedY)}px`;

    // Add a playful wiggle class
    noBtn.classList.remove('no-wiggle');
    // force reflow to restart animation
    void noBtn.offsetWidth;
    noBtn.classList.add('no-wiggle');
  }

  // High-level pointer handler
  let lastPointer = { x: null, y: null };
  function handlePointer(e) {
    const cx = e.clientX ?? (e.touches && e.touches[0] && e.touches[0].clientX);
    const cy = e.clientY ?? (e.touches && e.touches[0] && e.touches[0].clientY);
    if (cx == null || cy == null) return;
    // avoid firing too often; require a minimal movement
    if (lastPointer.x !== null) {
      const dx = Math.abs(cx - lastPointer.x);
      const dy = Math.abs(cy - lastPointer.y);
      if (dx < 4 && dy < 4) return;
    }
    lastPointer.x = cx; lastPointer.y = cy;
    moveNoAwayFromPointer(cx, cy);
  }

  // Handlers
  document.addEventListener('pointermove', (e) => handlePointer(e));
  document.addEventListener('touchstart', (e) => handlePointer(e), { passive: true });

  // Click/tap attempt on No -> move away
  noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // emulate pointer trying to click at the center of button
    const rect = noBtn.getBoundingClientRect();
    handlePointer({ clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 });
  });

  // keyboard accessibility
  noBtn.addEventListener('keydown', (e) => {
    const keys = ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter',' '];
    if (keys.includes(e.key)) {
      e.preventDefault();
      const rowRect = btnRow.getBoundingClientRect();
      moveNoAwayFromPointer(rowRect.left + rowRect.width / 2, rowRect.top + rowRect.height / 2);
    }
  });

  // Floating hearts background (gentle particles)
  function spawnFloatingHeart() {
    const el = document.createElement('div');
    el.className = 'floating-heart';
    const size = 12 + Math.random() * 28;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.left = `${Math.random() * 100}vw`;
    el.style.top = `${100 + Math.random() * 20}vh`;
    el.style.opacity = 0.85;
    el.style.position = 'fixed';
    el.style.zIndex = 2;
    el.style.pointerEvents = 'none';
    el.innerHTML = `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M12 21s-7.5-4.8-10-8.2C-0.6 7.9 4.2 3 7.8 5.4 9.6 6.7 10.5 8.6 12 10.2c1.5-1.6 2.4-3.5 4.2-4.8C19.8 3 24.6 7.9 22 12.8 19.5 16.2 12 21 12 21z" fill="${['#ff6b9a','#ff3864','#ff9bb3','#ffd7e2'][Math.floor(Math.random()*4)]}"></path></svg>`;
    floatingHeartsRoot.appendChild(el);
    const duration = 5500 + Math.random() * 2500;
    el.animate([
      { transform: 'translateY(0) scale(.9)', opacity: 0.95 },
      { transform: `translateY(-120vh) scale(1.1)`, opacity: 0 }
    ], { duration: duration, easing: 'linear' });
    setTimeout(() => el.remove(), duration + 50);
  }
  // spawn hearts periodically
  setInterval(spawnFloatingHeart, 700);
  // spawn a few at start
  for (let i=0;i<6;i++) setTimeout(spawnFloatingHeart, i*200);

  // Confetti hearts for Yes
  function spawnConfetti(count = 24) {
    const colors = ['#ff6b9a','#ff3864','#ff9bb3','#ffd7e2','#ffb2d0'];
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-heart';
      const size = 14 + Math.random() * 28;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.left = `${Math.random() * 100}vw`;
      el.style.top = `${-10 - Math.random() * 20}vh`;
      el.style.zIndex = 70;
      el.style.pointerEvents = 'none';
      const color = colors[Math.floor(Math.random() * colors.length)];
      el.innerHTML = `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M12 21s-7.5-4.8-10-8.2C-0.6 7.9 4.2 3 7.8 5.4 9.6 6.7 10.5 8.6 12 10.2c1.5-1.6 2.4-3.5 4.2-4.8C19.8 3 24.6 7.9 22 12.8 19.5 16.2 12 21 12 21z" fill="${color}"></path></svg>`;
      confettiRoot.appendChild(el);
      const duration = 2600 + Math.random() * 1200;
      const leftEnd = (parseFloat(el.style.left) + (Math.random()*30 - 15)) + 'vw';
      el.animate([
        { transform: `translateY(0) rotate(${Math.random()*360}deg)`, opacity:1, left: el.style.left },
        { transform: `translateY(110vh) rotate(${Math.random()*720}deg)`, opacity:0, left: leftEnd }
      ], { duration: duration, easing: 'cubic-bezier(.2,.9,.2,1)' });
      setTimeout(() => el.remove(), duration + 50);
    }
  }

  // Typed text for overlay
  function typeMessage(el, message, speed = 40) {
    el.textContent = '';
    let i = 0;
    const id = setInterval(() => {
      el.textContent += message[i++];
      if (i >= message.length) clearInterval(id);
    }, speed);
  }

  // Small chime via WebAudio
  function playChime() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(520, t);
      o.frequency.exponentialRampToValueAtTime(880, t + 0.18);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.12, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(t);
      o.stop(t + 1.2);
    } catch (e) {
      // ignore if audio is blocked
      console.warn('chime failed', e);
    }
  }

  // Show overlay and celebration
  function showYesOverlay() {
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
    // typed message
    const message = "You just made me the happiest person. Thank you for saying YES — let's make memories together! 💕";
    typeMessage(typedEl, message, 30);
    // confetti waves
    spawnConfetti(24);
    setTimeout(() => spawnConfetti(18), 350);
    setTimeout(() => spawnConfetti(12), 800);
    // chime
    playChime();
  }

  function hideOverlay() {
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');
  }

  // Wire Yes/Close/Share
  yesBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showYesOverlay();
  });

  // Close overlay button (delegated)
  document.addEventListener('click', (e) => {
    if (e.target.closest('#closeOverlay')) hideOverlay();
    if (e.target.closest('#shareBtn')) {
      // small share interaction (copy short message)
      const shareText = "She said YES! 💘 — https://your-site.example";
      navigator.clipboard?.writeText(shareText).then(() => {
        const t = e.target;
        const prev = t.textContent;
        t.textContent = 'Copied!';
        setTimeout(() => t.textContent = prev, 1400);
      }).catch(() => {
        alert('Copy this message to share: ' + shareText);
      });
    }
  });

  // Reposition on resize
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => setInitialPositions(), 90);
  });

  // Kick things off
  setTimeout(setInitialPositions, 50);
  // ensure overlay close is wired if element exists
  // (overlay buttons are static in DOM; we handle clicks via delegation above)
});
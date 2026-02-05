// sticker-enabled Valentine page with dodging "No" button and nice animations
(function(){
  // DOM refs
  const noBtn = document.getElementById('noBtn');
  const yesBtn = document.getElementById('yesBtn');
  const buttonsArea = document.getElementById('buttons');
  const popup = document.getElementById('popup');
  const closePopup = document.getElementById('closePopup');
  const shareBtn = document.getElementById('shareBtn');
  const stickerLayer = document.getElementById('sticker-layer');
  const stickerList = document.getElementById('stickerList');
  const card = document.getElementById('card');
  const templates = document.getElementById('sticker-templates');

  // smooth transitions for No button
  noBtn.style.transition = 'left .28s cubic-bezier(.2,.9,.3,1), top .28s cubic-bezier(.2,.9,.3,1), transform .18s ease';

  // Basic chime (same as before)
  function playChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      function tone(freq, t, dur) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.value = 0;
        o.connect(g);
        g.connect(ctx.destination);
        g.gain.setValueAtTime(0, now + t);
        g.gain.linearRampToValueAtTime(0.12, now + t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, now + t + dur);
        o.start(now + t);
        o.stop(now + t + dur + 0.05);
      }
      tone(660, 0, 0.28);
      tone(880, 0.06, 0.34);
      tone(990, 0.12, 0.28);
    } catch(e) { console.warn('Audio not played', e); }
  }

  // Dodging logic for "No" button (keeps earlier behavior)
  function moveNoButtonRandomly(avoidRect) {
    const areaRect = buttonsArea.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();
    const yesRect = yesBtn.getBoundingClientRect();
    const maxX = Math.max(8, areaRect.width - btnRect.width - 8);
    const maxY = Math.max(8, areaRect.height - btnRect.height - 8);

    let attempt = 0;
    let left, top;
    do {
      left = Math.random() * maxX;
      top  = Math.random() * maxY;
      attempt++;
      const candidateRect = {
        left: areaRect.left + left,
        right: areaRect.left + left + btnRect.width,
        top: areaRect.top + top,
        bottom: areaRect.top + top + btnRect.height
      };
      const overlap = rectOverlap(candidateRect, yesRect);
      if (overlap < 50 && (!avoidRect || rectDistance(candidateRect, avoidRect) > 70)) break;
    } while(attempt < 12);

    noBtn.style.left = `${Math.max(6, left)}px`;
    noBtn.style.top  = `${Math.max(6, top)}px`;
    noBtn.style.transform = `rotate(${(Math.random()-0.5)*10}deg)`;
  }
  function rectOverlap(a, b) { const xOverlap = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)); const yOverlap = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)); return xOverlap * yOverlap; }
  function rectDistance(a, b) { const ax = (a.left + a.right)/2, ay = (a.top + a.bottom)/2; const bx = (b.left + b.right)/2, by = (b.top + b.bottom)/2; return Math.hypot(ax-bx, ay-by); }

  function dodge(event) {
    if (event) { try { event.preventDefault(); } catch(e){} }
    let avoidRect = null;
    if (event && (event.clientX || (event.touches && event.touches[0]))) {
      const x = event.clientX || event.touches[0].clientX || 0;
      const y = event.clientY || event.touches[0].clientY || 0;
      avoidRect = { left: x-40, right: x+40, top: y-40, bottom: y+40 };
    }
    noBtn.style.transform = 'scale(1.06) rotate(4deg)';
    setTimeout(()=> moveNoButtonRandomly(avoidRect), 70);
  }

  noBtn.addEventListener('mouseenter', dodge);
  noBtn.addEventListener('mouseover', dodge);
  noBtn.addEventListener('touchstart', function(e){ dodge(e); }, {passive:false});
  noBtn.addEventListener('focus', dodge);
  noBtn.addEventListener('click', dodge);
  noBtn.addEventListener('keydown', function(e){
    if (['Enter',' ','Spacebar','Tab'].includes(e.key)) {
      e.preventDefault();
      dodge(e);
      yesBtn.focus();
    }
  });

  // Popup / yes button
  yesBtn.addEventListener('click', function(){
    popup.setAttribute('aria-hidden','false');
    closePopup.focus();
    playChime();
    spawnHearts(20);
    spawnConfetti(24);
  });
  closePopup.addEventListener('click', function(){ popup.setAttribute('aria-hidden','true'); yesBtn.focus(); });
  popup.addEventListener('click', function(e){ if (e.target === popup) { popup.setAttribute('aria-hidden','true'); yesBtn.focus(); }});
  if (shareBtn) {
    shareBtn.addEventListener('click', async function(){
      const message = "She said YES! 💖 Will you be my Valentine? — sent with a kiss 😘";
      try { await navigator.clipboard.writeText(message); shareBtn.textContent = "Copied! 😘"; setTimeout(()=> shareBtn.textContent = "Send a kiss 😘", 1600); } catch(e){ shareBtn.textContent = "Copy failed"; }
    });
  }

  window.addEventListener('resize', function(){
    const areaRect = buttonsArea.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();
    if (btnRect.right - areaRect.left > areaRect.width || btnRect.bottom - areaRect.top > areaRect.height) {
      noBtn.style.left = `${Math.max(6, Math.min(40, areaRect.width*0.18))}px`;
      noBtn.style.top = `${Math.max(6, Math.min(areaRect.height*0.75, 120))}px`;
      noBtn.style.transform = 'rotate(0deg)';
    }
  });

  // Sticker system
  // Map data-type to template id
  const stickerMap = {
    heart: 'tpl-heart',
    cupid: 'tpl-cupid',
    rose: 'tpl-rose',
    balloon: 'tpl-balloon',
    star: 'tpl-star'
  };

  // Helper: create sticker element from template name
  function createStickerElement(type) {
    const tplId = stickerMap[type];
    if (!tplId) return null;
    const tpl = templates.querySelector('#' + tplId);
    if (!tpl) return null;
    const svg = tpl.cloneNode(true);
    const wrapper = document.createElement('div');
    wrapper.className = 'sticker';
    wrapper.dataset.type = type;
    wrapper.appendChild(svg);
    // random subtle rotation and scale
    wrapper.style.transform = `translate(-50%,-50%) rotate(${(Math.random()-0.5)*18}deg)`;
    // attach interactivity
    makeStickerDraggable(wrapper);
    // double-click to remove
    wrapper.addEventListener('dblclick', (e) => { wrapper.remove(); });
    // on touch devices, double-tap detection fallback
    attachDoubleTapRemove(wrapper);
    return wrapper;
  }

  // Add sticker at card-relative coordinates
  function addSticker(type, clientX, clientY) {
    const el = createStickerElement(type);
    if (!el) return;
    stickerLayer.appendChild(el);
    // position: if coordinates provided, convert to sticker-layer coords; otherwise place near center
    const layerRect = stickerLayer.getBoundingClientRect();
    let x = layerRect.left + layerRect.width/2;
    let y = layerRect.top + layerRect.height/2;
    if (typeof clientX === 'number' && typeof clientY === 'number') {
      x = clientX;
      y = clientY;
    } else {
      // jitter so multiple stickers don't stack perfectly
      x += (Math.random()-0.5)*60;
      y += (Math.random()-0.5)*40;
    }
    // set left/top as px relative to container
    el.style.left = `${x - layerRect.left}px`;
    el.style.top  = `${y - layerRect.top}px`;
    // small pop animation
    requestAnimationFrame(()=> {
      el.style.transition = 'transform .18s cubic-bezier(.2,.9,.2,1)';
      el.style.transform += ' scale(1.06)';
      setTimeout(()=> { el.style.transform = el.style.transform.replace(' scale(1.06)',''); }, 160);
    });
    return el;
  }

  // make a sticker draggable (pointer events)
  function makeStickerDraggable(el) {
    let dragging = false;
    let startX = 0, startY = 0;
    let origLeft = 0, origTop = 0;
    const layerRect = () => stickerLayer.getBoundingClientRect();

    function onPointerDown(e) {
      e.preventDefault();
      dragging = true;
      el.setPointerCapture(e.pointerId);
      startX = e.clientX; startY = e.clientY;
      const rect = el.getBoundingClientRect();
      const layer = layerRect();
      origLeft = rect.left - layer.left;
      origTop  = rect.top  - layer.top;
      el.style.transition = 'none';
      el.style.cursor = 'grabbing';
    }
    function onPointerMove(e) {
      if (!dragging) return;
      const dx = e.clientX - startX, dy = e.clientY - startY;
      const layer = layerRect();
      let nx = origLeft + dx, ny = origTop + dy;
      // constrain inside layer
      nx = Math.max(8, Math.min(layer.width - el.offsetWidth - 8, nx));
      ny = Math.max(8, Math.min(layer.height - el.offsetHeight - 8, ny));
      el.style.left = `${nx}px`;
      el.style.top  = `${ny}px`;
    }
    function onPointerUp(e) {
      dragging = false;
      try { el.releasePointerCapture(e.pointerId); } catch(e){}
      el.style.transition = '';
      el.style.cursor = 'grab';
    }
    el.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    // Accessibility: allow keyboard nudging
    el.tabIndex = 0;
    el.addEventListener('keydown', (ev) => {
      const step = ev.shiftKey ? 10 : 6;
      const rect = el.getBoundingClientRect();
      const layer = stickerLayer.getBoundingClientRect();
      let left = rect.left - layer.left, top = rect.top - layer.top;
      if (ev.key === 'ArrowLeft') { left = Math.max(0, left - step); ev.preventDefault(); }
      if (ev.key === 'ArrowRight') { left = Math.min(layer.width - el.offsetWidth, left + step); ev.preventDefault(); }
      if (ev.key === 'ArrowUp') { top = Math.max(0, top - step); ev.preventDefault(); }
      if (ev.key === 'ArrowDown') { top = Math.min(layer.height - el.offsetHeight, top + step); ev.preventDefault(); }
      el.style.left = `${left}px`; el.style.top = `${top}px`;
      if (ev.key === 'Delete' || ev.key === 'Backspace') { el.remove(); }
    });
  }

  // small double-tap detection for touch remove
  function attachDoubleTapRemove(el) {
    let lastTap = 0;
    el.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTap < 350) {
        e.preventDefault();
        el.remove();
      }
      lastTap = now;
    }, {passive:false});
  }

  // Sticker picker click/drag logic
  // clicking a sticker in tray adds at center
  stickerList.addEventListener('click', (e) => {
    const btn = e.target.closest('.sticker-btn');
    if (!btn) return;
    const type = btn.dataset.type;
    addSticker(type);
  });

  // dragging from tray: pointerdown on button creates a moving sticker that follows pointer (drag & drop)
  stickerList.addEventListener('pointerdown', (e) => {
    const btn = e.target.closest('.sticker-btn');
    if (!btn) return;
    // prevent the dodge on accidental interaction
    e.preventDefault();
    const type = btn.dataset.type;
    const temp = createStickerElement(type);
    if (!temp) return;
    document.body.appendChild(temp);
    temp.style.position = 'fixed';
    temp.style.left = `${e.clientX}px`;
    temp.style.top = `${e.clientY}px`;
    temp.style.transform = 'translate(-50%,-50%) scale(1.06)';
    temp.style.pointerEvents = 'none';

    function onMove(ev) {
      temp.style.left = `${ev.clientX}px`;
      temp.style.top = `${ev.clientY}px`;
    }
    function onUp(ev) {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      // if released over stickerLayer, add real sticker at that location
      const layerRect = stickerLayer.getBoundingClientRect();
      if (ev.clientX >= layerRect.left && ev.clientX <= layerRect.right && ev.clientY >= layerRect.top && ev.clientY <= layerRect.bottom) {
        temp.remove();
        addSticker(type, ev.clientX, ev.clientY);
      } else {
        // animate fade and remove
        temp.animate([{opacity:1, transform:'translate(-50%,-50%) scale(1.06)'},{opacity:0, transform:'translate(-50%,-50%) scale(0.6)'}], {duration:220, easing:'ease'});
        setTimeout(()=> temp.remove(), 260);
      }
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  });

  // small helper to populate initial demo stickers (optional)
  // addSticker('heart'); addSticker('rose'); // uncomment to show stickers on load

  // Reuse heart/confetti generators from earlier
  function spawnHearts(count) {
    for (let i=0;i<count;i++){
      const heart = document.createElement('div');
      heart.className = 'floating-heart';
      document.body.appendChild(heart);
      const baseX = window.innerWidth/2 + (Math.random()-0.5)*220;
      const baseY = window.innerHeight/2 + (Math.random()-0.5)*60;
      heart.style.left = `${baseX}px`;
      heart.style.top  = `${baseY}px`;
      const translateX = (Math.random()-0.5)*120;
      const translateY = -120 - Math.random()*160;
      const rot = (Math.random()-0.5)*120;
      heart.animate([
        { transform: `translateY(0) translateX(0) rotate(0deg) scale(.6)`, opacity:1 },
        { transform: `translateY(${translateY}px) translateX(${translateX}px) rotate(${rot}deg) scale(1)`, opacity:0 }
      ], { duration: 1100 + Math.random()*900, easing: 'cubic-bezier(.2,.8,.2,1)' });
      setTimeout(()=> heart.remove(), 2000 + Math.random()*600);
    }
  }
  function spawnConfetti(n) {
    for (let i=0;i<n;i++){
      const d = document.createElement('div');
      d.className = 'floating-heart';
      d.style.width = d.style.height = `${6 + Math.random()*12}px`;
      d.style.borderRadius = '50%';
      d.style.background = randomColor();
      document.body.appendChild(d);
      const x = window.innerWidth/2 + (Math.random()-0.5)*200;
      const y = window.innerHeight/2;
      d.style.left = `${x}px`;
      d.style.top = `${y}px`;
      const tx = (Math.random()-0.5)*400;
      const ty = -200 - Math.random()*240;
      d.animate([
        { transform: `translateY(0) translateX(0)`, opacity:1, offset:0 },
        { transform: `translateY(${ty}px) translateX(${tx}px) rotate(${Math.random()*360}deg)`, opacity:0.02, offset:1 }
      ], { duration: 900 + Math.random()*900, easing: 'cubic-bezier(.2,.8,.2,1)' });
      setTimeout(()=> d.remove(), 1900 + Math.random()*700);
    }
  }
  function randomColor(){ const palette = ['#ff4d94','#ffd1e3','#ff9acb','#ff6aa6','#ffb3d9','#ff7fb5']; return palette[Math.floor(Math.random()*palette.length)]; }

  // initial placement fix for No button
  function init() {
    const areaRect = buttonsArea.getBoundingClientRect();
    noBtn.style.left = `${Math.min(30, Math.max(6, areaRect.width*0.18))}px`;
    noBtn.style.top  = `${Math.min(areaRect.height*0.75, 120)}px`;
    noBtn.style.transform = 'rotate(0deg)';
  }
  setTimeout(init, 80);

})();

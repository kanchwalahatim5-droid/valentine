// Enhanced animation + cute audio + smarter dodging (no changes needed for images)
(function(){
  const noBtn = document.getElementById('noBtn');
  const yesBtn = document.getElementById('yesBtn');
  const buttonsArea = document.getElementById('buttons');
  const popup = document.getElementById('popup');
  const closePopup = document.getElementById('closePopup');
  const shareBtn = document.getElementById('shareBtn');

  // set transition so movements look smooth
  noBtn.style.transition = 'left .28s cubic-bezier(.2,.9,.3,1), top .28s cubic-bezier(.2,.9,.3,1), transform .18s ease';

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
    } catch (e) { console.warn('Audio not played', e); }
  }

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

  function rectOverlap(a, b) {
    const xOverlap = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    const yOverlap = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    return xOverlap * yOverlap;
  }
  function rectDistance(a, b) {
    const ax = (a.left + a.right)/2, ay = (a.top + a.bottom)/2;
    const bx = (b.left + b.right)/2, by = (b.top + b.bottom)/2;
    return Math.hypot(ax-bx, ay-by);
  }

  function dodge(event) {
    if (event) {
      try { event.preventDefault(); } catch(e){}
    }
    let avoidRect = null;
    if (event && (event.clientX || event.touches)) {
      const x = event.clientX || (event.touches && event.touches[0] && event.touches[0].clientX) || 0;
      const y = event.clientY || (event.touches && event.touches[0] && event.touches[0].clientY) || 0;
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

  yesBtn.addEventListener('click', function(){
    popup.setAttribute('aria-hidden','false');
    closePopup.focus();
    playChime();
    spawnHearts(20);
    spawnConfetti(24);
  });

  closePopup.addEventListener('click', function(){
    popup.setAttribute('aria-hidden','true');
    yesBtn.focus();
  });

  const share = document.getElementById('shareBtn');
  if (share) {
    share.addEventListener('click', async function(){
      const message = "She said YES! 💖 Will you be my Valentine? — sent with a kiss 😘";
      try {
        await navigator.clipboard.writeText(message);
        share.textContent = "Copied! 😘";
        setTimeout(()=> share.textContent = "Send a kiss 😘", 1600);
      } catch(e) {
        share.textContent = "Copy failed";
      }
    });
  }

  popup.addEventListener('click', function(e){
    if (e.target === popup) {
      popup.setAttribute('aria-hidden','true');
      yesBtn.focus();
    }
  });

  window.addEventListener('resize', function(){
    const areaRect = buttonsArea.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();
    if (btnRect.right - areaRect.left > areaRect.width || btnRect.bottom - areaRect.top > areaRect.height) {
      noBtn.style.left = `${Math.max(6, Math.min(40, areaRect.width*0.18))}px`;
      noBtn.style.top = `${Math.max(6, Math.min(areaRect.height*0.75, 120))}px`;
      noBtn.style.transform = 'rotate(0deg)';
    }
  });

  function spawnHearts(count) {
    for (let i=0;i<count;i++){
      const heart = document.createElement('div');
      heart.className = 'floating-heart';
      document.body.appendChild(heart);

      const baseX = window.innerWidth/2 + (Math.random()-0.5)*220;
      const baseY = window.innerHeight/2 + (Math.random()-0.5)*60;
      heart.style.left = `${baseX}px`;
      heart.style.top  = `${baseY}px`;
      heart.style.opacity = 1;

      const translateX = (Math.random()-0.5)*120;
      const translateY = -120 - Math.random()*160;
      const rot = (Math.random()-0.5)*120;
      heart.animate([
        { transform: `translateY(0) translateX(0) rotate(0deg) scale(.6)`, opacity:1 },
        { transform: `translateY(${translateY}px) translateX(${translateX}px) rotate(${rot}deg) scale(1)`, opacity:0 }
      ], {
        duration: 1100 + Math.random()*900,
        easing: 'cubic-bezier(.2,.8,.2,1)'
      });
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
      ], {
        duration: 900 + Math.random()*900,
        easing: 'cubic-bezier(.2,.8,.2,1)'
      });
      setTimeout(()=> d.remove(), 1900 + Math.random()*700);
    }
  }

  function randomColor(){
    const palette = ['#ff4d94','#ffd1e3','#ff9acb','#ff6aa6','#ffb3d9','#ff7fb5'];
    return palette[Math.floor(Math.random()*palette.length)];
  }

  function init() {
    const areaRect = buttonsArea.getBoundingClientRect();
    noBtn.style.left = `${Math.min(30, Math.max(6, areaRect.width*0.18))}px`;
    noBtn.style.top  = `${Math.min(areaRect.height*0.75, 120)}px`;
    noBtn.style.transform = 'rotate(0deg)';
  }

  setTimeout(init, 80);
})();

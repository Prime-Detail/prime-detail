// Script pour interactions: slider avant/après basique, lazy loading, validation formulaire

document.addEventListener('DOMContentLoaded', function(){
  // Avant/Après: interaction du curseur
  document.querySelectorAll('.before-after-slider').forEach(function(slider){
    const after = slider.querySelector('.after-image');
    const handle = document.createElement('div');
    handle.className = 'before-after-handle';
    handle.textContent = '◀ ▶';
    slider.appendChild(handle);

    let isDragging = false;
    const start = (e) => { isDragging = true; move(e); };
    const stop = () => { isDragging = false; };
    const move = (e) => {
      if(!isDragging && e.type.indexOf('touch')===-1) return;
      const rect = slider.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      let pct = (clientX - rect.left) / rect.width;
      pct = Math.max(0, Math.min(1, pct));
      after.style.clipPath = `inset(0% ${100 - pct*100}% 0% 0%)`;
      handle.style.left = `${pct*100}%`;
    };

    handle.addEventListener('mousedown', start);
    window.addEventListener('mouseup', stop);
    window.addEventListener('mousemove', move);
    // Touch events
    handle.addEventListener('touchstart', start, {passive:true});
    window.addEventListener('touchend', stop);
    window.addEventListener('touchmove', move, {passive:true});

    // Click to toggle mid
    slider.addEventListener('click', function(e){
      const rect = slider.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      after.style.clipPath = `inset(0% ${100 - pct*100}% 0% 0%)`;
      handle.style.left = `${pct*100}%`;
    });
  });

  // Lazy loading des images natives
  if('loading' in HTMLImageElement.prototype){
    document.querySelectorAll('img').forEach(img=>{ img.setAttribute('loading','lazy'); });
  } else {
    // fallback simple
    let lazyImgs = [].slice.call(document.querySelectorAll('img'));
    const onScroll = function(){
      if(lazyImgs.length===0){ document.removeEventListener('scroll', onScroll); return; }
      lazyImgs = lazyImgs.filter(function(img){
        if(img.getBoundingClientRect().top < window.innerHeight + 200){
          // nothing specific, assume src already there
          return false;
        }
        return true;
      });
    };
    document.addEventListener('scroll', onScroll);
    onScroll();
  }

  // Simple validation du formulaire
  const form = document.getElementById('reservationForm');
  if(form){
    form.addEventListener('submit', function(e){
      const nom = form.querySelector('#nom');
      const email = form.querySelector('#email');
      const tel = form.querySelector('#telephone');
      if(!nom.value.trim() || !email.value.trim() || !tel.value.trim()){
        e.preventDefault();
        alert('Veuillez remplir les champs obligatoires : nom, email et téléphone.');
        return false;
      }
      // ici on pourrait envoyer via fetch à une API
      alert('Demande envoyée — vous recevrez une confirmation bientôt.');
    });
  }
});

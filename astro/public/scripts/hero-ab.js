(function () {
  var titleEl = document.getElementById('hero-title');
  var ctaEl = document.getElementById('hero-primary-cta');

  if (!titleEl || !ctaEl) {
    return;
  }

  var storageKey = 'prime_detail_ab_variant';
  var variant = null;

  try {
    variant = localStorage.getItem(storageKey);
  } catch (error) {
    variant = null;
  }

  if (variant !== 'A' && variant !== 'B') {
    variant = Math.random() < 0.5 ? 'A' : 'B';
    try {
      localStorage.setItem(storageKey, variant);
    } catch (error) {
    }
  }

  if (variant === 'B') {
    titleEl.innerHTML = 'Nettoyage auto clinique premium<br /><span>à domicile, autour de Caen</span>';
    ctaEl.textContent = 'Réserver mon diagnostic gratuit';
  } else {
    titleEl.innerHTML = 'Detailing auto premium<br /><span>à domicile, autour de Caen</span>';
    ctaEl.textContent = 'Obtenir mon devis en 24h';
  }
})();

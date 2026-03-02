(function () {
  var contactForm = document.getElementById('contact-form');
  var statusEl = document.getElementById('contact-form-status');
  var actionsEl = document.getElementById('contact-actions');
  var whatsappLinkEl = document.getElementById('contact-whatsapp');

  if (!contactForm) {
    return;
  }

  function getFieldValue(id) {
    var el = document.getElementById(id);
    return el ? (el.value || '').trim() : '';
  }

  function getPrestationLabel(value) {
    var labels = {
      interieur: 'Nettoyage intérieur',
      carrosserie: 'Rénovation carrosserie / polissage',
      pack: 'Pack intérieur + extérieur',
      entretien: 'Forfait entretien'
    };

    return labels[value] || value || 'Non précisé';
  }

  contactForm.addEventListener('submit', function (event) {
    event.preventDefault();

    var nom = getFieldValue('nom');
    var ville = getFieldValue('ville');
    var vehicule = getFieldValue('vehicule');
    var prestationEl = document.getElementById('prestation');
    var prestationValue = prestationEl ? prestationEl.value : '';
    var prestationLabel = getPrestationLabel(prestationValue);
    var message = getFieldValue('message');

    if (!nom || !vehicule || !message) {
      if (actionsEl) {
        actionsEl.style.display = 'none';
      }
      if (statusEl) {
        statusEl.textContent = 'Merci de renseigner au minimum : nom, véhicule et détails de la demande.';
      }
      return;
    }

    var lines = [
      'Bonjour Prime Detail,',
      '',
      'Je souhaite un devis personnalisé :',
      '- Nom / Prénom : ' + nom,
      '- Ville : ' + (ville || 'Non précisée'),
      '- Véhicule : ' + vehicule,
      '- Prestation souhaitée : ' + prestationLabel,
      '',
      'Détails :',
      message,
      '',
      'Merci.'
    ];

    var whatsappUrl = 'https://wa.me/33656751197?text=' + encodeURIComponent(lines.join('\n'));

    if (whatsappLinkEl) {
      whatsappLinkEl.setAttribute('href', whatsappUrl);
    }

    if (actionsEl) {
      actionsEl.style.display = 'flex';
    }

    if (statusEl) {
      statusEl.textContent = 'Choisissez votre méthode: envoyer votre demande par message WhatsApp et/ou appeler directement.';
    }
  });
})();

(function () {
  document.addEventListener('error', function (event) {
    var target = event && event.target;

    if (!target || target.tagName !== 'IMG') {
      return;
    }

    if (target.dataset.retried === '1') {
      return;
    }

    target.dataset.retried = '1';

    var src = target.getAttribute('src') || '';
    if (!src) {
      return;
    }

    var separator = src.indexOf('?') === -1 ? '?' : '&';
    target.setAttribute('src', src + separator + 'retry=1');
  }, true);

  var mainVideo = document.getElementById('main-video');
  var mobileVideoSource = document.getElementById('video-mobile-src');
  var liteVideoSource = document.getElementById('video-lite-src');

  if (!mainVideo) {
    return;
  }

  function switchVideoToLite() {
    if (!mobileVideoSource || !liteVideoSource) {
      return false;
    }

    var liteSrc = liteVideoSource.getAttribute('src');
    var mobileSrc = mobileVideoSource.getAttribute('src');

    if (!liteSrc || !mobileSrc || mobileSrc === liteSrc) {
      return false;
    }

    mobileVideoSource.setAttribute('src', liteSrc);
    liteVideoSource.setAttribute('src', mobileSrc);
    mainVideo.dataset.liteActive = '1';
    mainVideo.load();
    return true;
  }

  var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  var shouldPreferLite = !!(connection && (connection.saveData || (typeof connection.downlink === 'number' && connection.downlink > 0 && connection.downlink < 1.5)));

  if (shouldPreferLite) {
    switchVideoToLite();
  }

  mainVideo.addEventListener('error', function () {
    if (mainVideo.dataset.liteActive !== '1' && switchVideoToLite()) {
      return;
    }

    if (mainVideo.dataset.retried === '1') {
      return;
    }

    mainVideo.dataset.retried = '1';
    mainVideo.load();
  });
})();

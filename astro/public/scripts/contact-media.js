(function () {
  function trackEvent(eventName, params) {
    var payload = params || {};

    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: eventName, event_params: payload });
    } catch (error) {
    }

    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, payload);
      }
    } catch (error) {
    }
  }

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

  function getQuizCtaVariantLabel() {
    var raw = null;
    var index = 0;
    var labels = ['A', 'B', 'C'];

    try {
      raw = sessionStorage.getItem('quiz_cta_variant');
    } catch (error) {
      raw = null;
    }

    if (raw === null) {
      return 'Non défini';
    }

    index = parseInt(raw, 10);
    if (isNaN(index) || index < 0 || index >= labels.length) {
      return 'Non défini';
    }

    return labels[index];
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
    var ctaVariantLabel = getQuizCtaVariantLabel();

    if (!nom || !vehicule) {
      trackEvent('contact_form_invalid_submit', {
        has_name: !!nom,
        has_vehicle: !!vehicule
      });

      if (actionsEl) {
        actionsEl.style.display = 'none';
      }
      if (statusEl) {
        statusEl.textContent = 'Merci de renseigner au minimum : nom et véhicule.';
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
      '- CTA Quiz : ' + ctaVariantLabel,
      '',
      'Détails :',
      (message || 'Non précisés'),
      '',
      'Merci.'
    ];

    trackEvent('contact_form_valid_submit', {
      prestation_type: prestationValue || 'unknown',
      cta_variant: ctaVariantLabel,
      has_message: !!message,
      city_filled: !!ville
    });

    var whatsappUrl = 'https://wa.me/33656751197?text=' + encodeURIComponent(lines.join('\n'));

    if (whatsappLinkEl) {
      whatsappLinkEl.setAttribute('href', whatsappUrl);
    }

    if (actionsEl) {
      actionsEl.style.display = 'flex';
    }

    if (whatsappLinkEl) {
      whatsappLinkEl.addEventListener('click', function () {
        trackEvent('contact_whatsapp_clicked', {
          cta_variant: ctaVariantLabel,
          prestation_type: prestationValue || 'unknown'
        });
      }, { once: true });
    }

    var contactCallEl = document.getElementById('contact-call');
    if (contactCallEl) {
      contactCallEl.addEventListener('click', function () {
        trackEvent('contact_call_clicked', {
          cta_variant: ctaVariantLabel,
          prestation_type: prestationValue || 'unknown'
        });
      }, { once: true });
    }

    trackEvent('contact_options_displayed', {
      cta_variant: ctaVariantLabel,
      prestation_type: prestationValue || 'unknown'
    });

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

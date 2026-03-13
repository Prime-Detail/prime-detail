(function () {
  function trackEvent(eventName, params) {
    var payload = params || {};
    var eventId = payload.event_id || (eventName + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10));
    var standardEventName = '';
    payload.event_id = eventId;

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

    try {
      if (typeof window.fbq === 'function' && (
        eventName === 'contact_call_clicked' ||
        eventName === 'contact_whatsapp_clicked' ||
        eventName === 'contact_form_valid_submit'
      )) {
        window.fbq('trackCustom', eventName, payload, { eventID: eventId });

        if (eventName === 'contact_form_valid_submit') {
          standardEventName = 'Lead';
          window.fbq('track', 'Lead', payload, { eventID: eventId });
        }

        if (eventName === 'contact_call_clicked' || eventName === 'contact_whatsapp_clicked') {
          standardEventName = 'Contact';
          window.fbq('track', 'Contact', payload, { eventID: eventId });
        }

        if (typeof window.__metaCapiSend === 'function') {
          window.__metaCapiSend({
            eventName: eventName,
            standardEventName: standardEventName,
            eventId: eventId,
            payload: payload
          });
        }
      }
    } catch (error) {
    }
  }

  var contactForm = document.getElementById('contact-form');
  var statusEl = document.getElementById('contact-form-status');
  var actionsEl = document.getElementById('contact-actions');
  var whatsappLinkEl = document.getElementById('contact-whatsapp');
  var quizSummaryLockEl = document.getElementById('quiz-summary-lock');
  var quizSummaryTextEl = document.getElementById('quiz-summary-text');
  var quizSummaryWarningEl = document.getElementById('quiz-summary-warning');
  var quizSummarySuccessEl = document.getElementById('quiz-summary-success');
  var quizSummaryEditEl = document.getElementById('quiz-summary-edit');
  var mismatchWarningTracked = false;
  var mismatchWarningVisible = false;

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
      polish_one_step: 'Polissage one-step (brillance rapide)',
      polish_two_step: 'Polissage 2 étapes (coupe + finition)',
      prepa_ceramique: 'Préparation céramique (correction + préparation)',
      renovation_optiques: 'Rénovation optiques + protection UV',
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

  function getQuizEstimateContext() {
    var raw = null;
    var parsed = null;

    try {
      raw = sessionStorage.getItem('quiz_estimate_context');
    } catch (error) {
      raw = null;
    }

    if (!raw) {
      return null;
    }

    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      parsed = null;
    }

    return parsed;
  }

  function renderQuizSummaryLock(quizContext) {
    if (!quizSummaryLockEl || !quizSummaryTextEl) {
      return;
    }

    if (!quizContext || !quizContext.finalized) {
      quizSummaryLockEl.hidden = true;
      quizSummaryTextEl.textContent = '';
      if (quizSummaryWarningEl) {
        quizSummaryWarningEl.hidden = true;
        quizSummaryWarningEl.textContent = '';
      }
      if (quizSummarySuccessEl) {
        quizSummarySuccessEl.hidden = true;
        quizSummarySuccessEl.textContent = '';
      }
      return;
    }

    quizSummaryLockEl.hidden = false;
    quizSummaryTextEl.textContent =
      quizContext.total + '€ | ' + quizContext.vehicle_name + ' | ' + quizContext.exterior_label;
  }

  function getQuizContextMismatchMessage(prestationValue, quizContext) {
    var exteriorServiceValues = ['pack', 'carrosserie', 'polish_one_step', 'polish_two_step', 'prepa_ceramique', 'renovation_optiques'];

    if (!quizContext || !quizContext.finalized) {
      return '';
    }

    if (prestationValue === 'interieur' && quizContext.exterior !== 'none') {
      return 'Votre quiz inclut un exterieur. Choisissez "Pack interieur + exterieur" ou modifiez votre quiz.';
    }

    if (prestationValue === 'pack' && quizContext.exterior === 'none') {
      return 'Votre quiz correspond a un interieur seul. Choisissez "Nettoyage interieur" ou modifiez votre quiz.';
    }

    if (exteriorServiceValues.indexOf(prestationValue) !== -1 && quizContext.exterior === 'none') {
      return 'Votre quiz correspond a un interieur seul. Choisissez "Nettoyage interieur" ou relancez le quiz avec un niveau exterieur.';
    }

    return '';
  }

  function updateQuizCoherenceWarning(prestationValue, quizContext, ctaVariantLabel) {
    if (!quizSummaryWarningEl || !quizSummaryLockEl || quizSummaryLockEl.hidden) {
      return;
    }

    var mismatchMessage = getQuizContextMismatchMessage(prestationValue, quizContext);

    if (!mismatchMessage) {
      quizSummaryWarningEl.hidden = true;
      quizSummaryWarningEl.textContent = '';

      if (quizSummarySuccessEl) {
        quizSummarySuccessEl.hidden = false;
        quizSummarySuccessEl.textContent = 'Cohérent avec votre prestation sélectionnée.';
      }

      if (mismatchWarningVisible) {
        trackEvent('lead_coherence_fixed', {
          prestation_type: prestationValue || 'unknown',
          quiz_exterior_pack: (quizContext && quizContext.exterior) || 'unknown',
          cta_variant: ctaVariantLabel || getQuizCtaVariantLabel()
        });
      }

      mismatchWarningVisible = false;
      mismatchWarningTracked = false;
      return;
    }

    quizSummaryWarningEl.hidden = false;
    quizSummaryWarningEl.textContent = mismatchMessage;
    mismatchWarningVisible = true;

    if (quizSummarySuccessEl) {
      quizSummarySuccessEl.hidden = true;
      quizSummarySuccessEl.textContent = '';
    }

    if (!mismatchWarningTracked) {
      mismatchWarningTracked = true;
      trackEvent('lead_coherence_issue_detected', {
        prestation_type: prestationValue || 'unknown',
        quiz_exterior_pack: quizContext.exterior || 'unknown',
        cta_variant: ctaVariantLabel || getQuizCtaVariantLabel()
      });
    }
  }

  function isQuizContextCoherent(prestationValue, quizContext) {
    return getQuizContextMismatchMessage(prestationValue, quizContext) === '';
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
    var quizContext = getQuizEstimateContext();
    var isCoherent = isQuizContextCoherent(prestationValue, quizContext);
    var quizSummary = '';

    updateQuizCoherenceWarning(prestationValue, quizContext, ctaVariantLabel);

    if (quizContext && quizContext.finalized) {
      quizSummary = 'Estimation quiz : ' + quizContext.total + '€ | Véhicule : ' + quizContext.vehicle_name +
        ' | Extérieur : ' + quizContext.exterior_label + '.';
    }

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

    var detailsText = message || 'Non précisés';

    if (quizSummary && isCoherent && detailsText.indexOf('Estimation quiz : ') !== 0) {
      detailsText = quizSummary + '\n' + detailsText;
    }

    if (!isCoherent && detailsText === quizSummary) {
      detailsText = 'Non précisés';
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
      detailsText,
      '',
      'Merci.'
    ];

    if (quizSummary && !isCoherent) {
      lines.splice(lines.length - 2, 0,
        '',
        'Contexte quiz non retenu (incohérent avec la prestation choisie).'
      );

      trackEvent('contact_quiz_context_mismatch', {
        prestation_type: prestationValue || 'unknown',
        quiz_exterior_pack: quizContext.exterior || 'unknown',
        cta_variant: ctaVariantLabel
      });
    }

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

  renderQuizSummaryLock(getQuizEstimateContext());

  var prestationSelectEl = document.getElementById('prestation');
  if (prestationSelectEl) {
    prestationSelectEl.addEventListener('change', function () {
      updateQuizCoherenceWarning(prestationSelectEl.value, getQuizEstimateContext(), getQuizCtaVariantLabel());
    });

    updateQuizCoherenceWarning(prestationSelectEl.value, getQuizEstimateContext(), getQuizCtaVariantLabel());
  }

  if (quizSummaryEditEl) {
    quizSummaryEditEl.addEventListener('click', function () {
      trackEvent('quiz_summary_edit_clicked', { location: 'contact_form' });
    });
  }
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

(function () {
  var memoryStore = { vehicle: null, ext: null };
  var analyticsState = {
    estimateKey: null,
    variantTracked: false,
    quickFormVariantTracked: false
  };

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

  var interiorPrices = {
    citadine: 120,
    berline: 135,
    suv: 150
  };

  var vehicleNames = {
    citadine: 'Citadine',
    berline: 'Berline',
    suv: 'SUV'
  };

  var exteriorPrices = {
    none: { citadine: 0, berline: 0, suv: 0 },
    base: { citadine: 49, berline: 54, suv: 59 },
    standard: { citadine: 89, berline: 99, suv: 109 },
    premium: { citadine: 199, berline: 224, suv: 249 }
  };

  var exteriorLabels = {
    none: 'Intérieur seul',
    base: 'BASE Brillance',
    standard: 'STANDARD Protection',
    premium: 'PREMIUM Céramique'
  };

  var processByExt = {
    none: [
      'Aspiration approfondie habitacle + coffre',
      'Nettoyage textiles, plastiques, vitres intérieures',
      'Finitions détaillées sur zones sensibles'
    ],
    base: [
      'Nettoyage intérieur complet',
      'HP + shampoing carrosserie',
      'Jantes + dressing pneus'
    ],
    standard: [
      'Pack BASE inclus',
      'Décontamination ferreuse',
      'Protection cire synthétique'
    ],
    premium: [
      'Pack STANDARD inclus',
      'Clay bar + polish de finition',
      'Protection Carnauba 6 mois'
    ]
  };

  var ctaVariants = [
    {
      button: '📱 RDV certifié maintenant',
      helper: 'Créneaux limités cette semaine. Réservez maintenant pour bloquer votre passage.',
      subnote: 'Réponse rapide par appel ou WhatsApp au <strong>06 56 75 11 97</strong>.'
    },
    {
      button: '📲 Obtenir mon devis express',
      helper: 'Recevez une estimation claire en 24h, adaptée à votre véhicule.',
      subnote: 'Appelez directement le <strong>06 56 75 11 97</strong> pour une réponse immédiate.'
    },
    {
      button: '✅ Bloquer mon créneau cette semaine',
      helper: 'Les disponibilités partent vite. Vérifions ensemble le meilleur timing.',
      subnote: 'Contact rapide par appel ou WhatsApp au <strong>06 56 75 11 97</strong>.'
    }
  ];

  var quickFormVariants = [
    {
      intro: 'Remplissez ces 3 champs, on pre-remplit ensuite votre demande complete.',
      submit: 'Continuer vers le formulaire complet',
      modalContact: 'Finaliser le formulaire complet'
    },
    {
      intro: '30 secondes pour pre-remplir votre demande et gagner du temps.',
      submit: 'Je complete ma demande',
      modalContact: 'Je complete ma demande'
    }
  ];

  function initQuiz() {
    var quiz = document.getElementById('tarif-quiz');
    var steps = quiz ? Array.prototype.slice.call(quiz.querySelectorAll('.step')) : [];
    var progressFill = document.getElementById('progress-fill');
    var cards = quiz ? Array.prototype.slice.call(quiz.querySelectorAll('.card[data-next]')) : [];
    var yesCard = quiz ? quiz.querySelector('.yes[data-next]') : null;
    var noCard = quiz ? quiz.querySelector('.no[data-alt="terrain"]') : null;
    var restartButtons = quiz ? Array.prototype.slice.call(quiz.querySelectorAll('[data-restart="quiz"]')) : [];
    var vehicleNameEl = document.getElementById('veh-name');
    var totalEl = document.getElementById('total');
    var packDesc = document.getElementById('pack-desc');
    var packNoneNote = document.getElementById('pack-none-note');
    var packBase = quiz ? quiz.querySelector('.pack-base') : null;
    var packStandard = quiz ? quiz.querySelector('.pack-standard') : null;
    var packPremium = quiz ? quiz.querySelector('.pack-premium') : null;
    var processStepsEl = document.getElementById('process-steps');
    var terrainOnlyPriceEl = document.getElementById('terrain-only-price');
    var ctaButtonEl = quiz ? quiz.querySelector('.btn-gold') : null;
    var ctaHelperEl = quiz ? quiz.querySelector('.cta-helper') : null;
    var ctaSubnoteEl = quiz ? quiz.querySelector('.cta-subnote') : null;
    var quickFormEl = document.getElementById('tarif-quick-form');
    var quickIntroEl = document.getElementById('tarif-quick-intro');
    var quickSubmitEl = document.getElementById('tarif-qf-submit');
    var quickNameEl = document.getElementById('tarif-qf-name');
    var quickVehicleEl = document.getElementById('tarif-qf-vehicle');
    var quickCityEl = document.getElementById('tarif-qf-city');
    var quickServiceEl = document.getElementById('tarif-qf-service');
    var quickMessageEl = document.getElementById('tarif-qf-message');
    var quickStatusEl = document.getElementById('tarif-qf-status');
    var quickModalEl = document.getElementById('tarif-qf-modal');
    var quickModalCloseEl = document.getElementById('tarif-qf-modal-close');
    var quickModalWhatsappEl = document.getElementById('tarif-qf-modal-whatsapp');
    var quickModalContactEl = document.getElementById('tarif-qf-modal-contact');
    var quickModalEstimateEl = document.getElementById('tarif-qf-modal-estimate');
    var prestationSelect = document.getElementById('prestation');
    var messageField = document.getElementById('message');
    var quizState = { isFinalized: false };

    if (!quiz || !steps.length || !cards.length || !vehicleNameEl || !totalEl || !processStepsEl) {
      return;
    }

    function showStep(stepKey) {
    steps.forEach(function (stepElement) {
      var isCurrent = stepElement.getAttribute('data-step') === String(stepKey);
      stepElement.classList.toggle('active', isCurrent);
    });
    }

    function updateProgress() {
    if (!progressFill) {
      return;
    }
    var currentStepEl = quiz.querySelector('.step.active');
    var step = currentStepEl ? currentStepEl.getAttribute('data-step') : '1';
    var map = {
      '1': 25,
      '2': 50,
      '3': 75,
      '4': 100,
      'terrain': 100
    };
    progressFill.style.width = (map[step] || 25) + '%';
    }

  function getVehicle() {
    try {
      return sessionStorage.getItem('vehicle') || memoryStore.vehicle || 'citadine';
    } catch (error) {
      return memoryStore.vehicle || 'citadine';
    }
  }

  function getExt() {
    try {
      return sessionStorage.getItem('ext') || memoryStore.ext || 'none';
    } catch (error) {
      return memoryStore.ext || 'none';
    }
  }

  function setStoredValue(key, value) {
    memoryStore[key] = value;
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
    }
  }

  function clearStoredValue(key) {
    memoryStore[key] = null;
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
    }
  }

  function getCtaVariantData() {
    var key = 'quiz_cta_variant';
    var raw = null;
    var index = 0;

    try {
      raw = sessionStorage.getItem(key);
    } catch (error) {
      raw = null;
    }

    if (raw !== null) {
      index = parseInt(raw, 10);
      if (!isNaN(index) && index >= 0 && index < ctaVariants.length) {
        return {
          index: index,
          label: String.fromCharCode(65 + index),
          variant: ctaVariants[index]
        };
      }
    }

    index = Math.floor(Math.random() * ctaVariants.length);
    try {
      sessionStorage.setItem(key, String(index));
    } catch (error) {
    }

    return {
      index: index,
      label: String.fromCharCode(65 + index),
      variant: ctaVariants[index] || ctaVariants[0]
    };
  }

  function openQuickModal() {
    if (!quickModalEl) {
      return;
    }
    quickModalEl.hidden = false;
    quickModalEl.setAttribute('aria-hidden', 'false');
    document.body.classList.add('tarif-modal-open');
  }

  function closeQuickModal() {
    if (!quickModalEl) {
      return;
    }
    quickModalEl.hidden = true;
    quickModalEl.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('tarif-modal-open');
  }

  function getQuickFormVariantData() {
    var key = 'tarif_quick_form_variant';
    var raw = null;
    var index = 0;

    try {
      raw = sessionStorage.getItem(key);
    } catch (error) {
      raw = null;
    }

    if (raw !== null) {
      index = parseInt(raw, 10);
      if (!isNaN(index) && index >= 0 && index < quickFormVariants.length) {
        return {
          index: index,
          label: String.fromCharCode(65 + index),
          variant: quickFormVariants[index]
        };
      }
    }

    index = Math.floor(Math.random() * quickFormVariants.length);
    try {
      sessionStorage.setItem(key, String(index));
    } catch (error) {
    }

    return {
      index: index,
      label: String.fromCharCode(65 + index),
      variant: quickFormVariants[index] || quickFormVariants[0]
    };
  }

  function applyQuickFormVariant() {
    var variantData = getQuickFormVariantData();
    var variant = variantData && variantData.variant;

    if (!variantData || !variant) {
      return;
    }

    if (quickIntroEl) {
      quickIntroEl.textContent = variant.intro;
    }

    if (quickSubmitEl) {
      quickSubmitEl.textContent = variant.submit;
    }

    if (quickModalContactEl) {
      quickModalContactEl.textContent = variant.modalContact;
    }

    if (!analyticsState.quickFormVariantTracked) {
      analyticsState.quickFormVariantTracked = true;
      trackEvent('tarif_quick_form_variant_assigned', {
        quick_form_variant: variantData.label,
        quick_form_variant_index: variantData.index,
        quick_form_submit_text: variant.submit,
        quick_form_modal_contact_text: variant.modalContact
      });
    }
  }

  function applyCtaVariant() {
    var variantData = getCtaVariantData();
    var variant = variantData && variantData.variant;

    if (!variantData || !variant) {
      return;
    }

    if (ctaButtonEl) {
      ctaButtonEl.textContent = variant.button;
    }

    if (ctaHelperEl) {
      ctaHelperEl.textContent = variant.helper;
    }

    if (ctaSubnoteEl) {
      ctaSubnoteEl.innerHTML = variant.subnote;
    }

    if (!analyticsState.variantTracked) {
      analyticsState.variantTracked = true;
      trackEvent('quiz_cta_variant_assigned', {
        cta_variant: variantData.label,
        cta_variant_index: variantData.index,
        cta_button_text: variant.button
      });
    }
  }

    function getParentStep(cardElement) {
    if (!cardElement) {
      return null;
    }

    if (typeof cardElement.closest === 'function') {
      return cardElement.closest('.step');
    }

    var node = cardElement.parentNode;
    while (node && node !== quiz) {
      if (node.classList && node.classList.contains('step')) {
        return node;
      }
      node = node.parentNode;
    }

    return null;
  }

    function persistQuizContext(veh, ext, total, isFinalized) {
      var context = {
        finalized: !!isFinalized,
        vehicle: veh,
        vehicle_name: vehicleNames[veh] || 'Citadine',
        exterior: ext,
        exterior_label: exteriorLabels[ext] || 'Intérieur seul',
        total: total
      };

      try {
        sessionStorage.setItem('quiz_estimate_context', JSON.stringify(context));
      } catch (error) {
      }
    }

    function clearQuizContext() {
      try {
        sessionStorage.removeItem('quiz_estimate_context');
      } catch (error) {
      }
    }

    function updateResult(isFinalized) {
    if (typeof isFinalized === 'boolean') {
      quizState.isFinalized = isFinalized;
    }

    var veh = getVehicle();
    var ext = getExt();
    var intPrix = interiorPrices[veh] || interiorPrices.citadine;
    var extPrix = (exteriorPrices[ext] && exteriorPrices[ext][veh]) || 0;
    var total = intPrix + extPrix;
    var variantData = getCtaVariantData();

    vehicleNameEl.textContent = vehicleNames[veh] || 'Citadine';
    totalEl.textContent = total + '€';

    if (packDesc) {
      if (packBase) {
        packBase.classList.toggle('active', ext === 'base');
      }
      if (packStandard) {
        packStandard.classList.toggle('active', ext === 'standard');
      }
      if (packPremium) {
        packPremium.classList.toggle('active', ext === 'premium');
      }
      if (packNoneNote) {
        packNoneNote.style.display = ext === 'none' ? 'block' : 'none';
      }
    }

    processStepsEl.innerHTML = '';
    (processByExt[ext] || processByExt.none).forEach(function (stepText) {
      processStepsEl.insertAdjacentHTML('beforeend', '<li>' + stepText + '</li>');
    });

    if (terrainOnlyPriceEl) {
      terrainOnlyPriceEl.textContent = intPrix + '€';
    }

    if (quickFormEl) {
      quickFormEl.hidden = !quizState.isFinalized;
      if (quickServiceEl) {
        quickServiceEl.value = ext === 'none' ? 'interieur' : 'pack';
      }
      if (quickMessageEl && (quickMessageEl.value === '' || quickMessageEl.value.indexOf('Estimation quiz : ') === 0)) {
        quickMessageEl.value = 'Estimation quiz : ' + total + '€ | Véhicule : ' + (vehicleNames[veh] || 'Citadine') +
          ' | Extérieur : ' + (exteriorLabels[ext] || 'Intérieur seul') + '.';
      }
      if (!quizState.isFinalized && quickStatusEl) {
        quickStatusEl.textContent = '';
      }
    }

    if (prestationSelect) {
      prestationSelect.value = ext === 'none' ? 'interieur' : 'pack';
    }

    if (messageField) {
      if (quizState.isFinalized) {
        messageField.value = 'Estimation quiz : ' + total + '€ | Véhicule : ' + (vehicleNames[veh] || 'Citadine') +
          ' | Extérieur : ' + (exteriorLabels[ext] || 'Intérieur seul') + '.';
      } else if (messageField.value.indexOf('Estimation quiz : ') === 0) {
        messageField.value = '';
      }
    }

    persistQuizContext(veh, ext, total, quizState.isFinalized);

    var estimateKey = [veh, ext, total].join('|');
    if (quizState.isFinalized && estimateKey !== analyticsState.estimateKey) {
      analyticsState.estimateKey = estimateKey;
      trackEvent('quiz_estimate_viewed', {
        vehicle_type: veh,
        exterior_pack: ext,
        estimate_total_eur: total,
        cta_variant: variantData.label
      });
    }
  }

    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        var parentStep = getParentStep(card);
        var currentStep = parentStep ? parentStep.getAttribute('data-step') : '1';
        var nextStep = card.getAttribute('data-next');

        if (card.hasAttribute('data-type')) {
          setStoredValue('vehicle', card.getAttribute('data-type'));
          trackEvent('quiz_vehicle_selected', {
            vehicle_type: card.getAttribute('data-type')
          });
        }

        if (card.hasAttribute('data-ext')) {
          setStoredValue('ext', card.getAttribute('data-ext'));
          trackEvent('quiz_exterior_selected', {
            exterior_pack: card.getAttribute('data-ext')
          });
          if (card.getAttribute('data-ext') === 'none') {
            nextStep = '4';
            updateResult(true);
          }
        }

        showStep(nextStep || currentStep);
        updateProgress();
      });
    });

  if (yesCard) {
    yesCard.addEventListener('click', function () {
      trackEvent('quiz_private_space_selected', { has_private_space: true });
      showStep('4');
      updateResult(true);
      updateProgress();
    });
  }

  if (noCard) {
    noCard.addEventListener('click', function () {
      trackEvent('quiz_private_space_selected', { has_private_space: false });
      updateResult(true);
      showStep('terrain');
      updateProgress();
    });
  }

  restartButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      trackEvent('quiz_restart_clicked', {});
      clearStoredValue('vehicle');
      clearStoredValue('ext');
      clearQuizContext();
      analyticsState.estimateKey = null;
      showStep('1');
      updateResult(false);
      updateProgress();
    });
  });

  var quizCta = quiz ? quiz.querySelector('.btn-gold') : null;
  if (quizCta) {
    quizCta.addEventListener('click', function () {
      var variantData = getCtaVariantData();
      trackEvent('quiz_primary_cta_clicked', {
        cta_variant: variantData.label,
        destination: 'phone_call'
      });
    });
  }

  var terrainCta = quiz ? quiz.querySelector('.book-btn') : null;
  if (terrainCta) {
    terrainCta.addEventListener('click', function () {
      trackEvent('quiz_terrain_cta_clicked', {
        destination: 'phone_call'
      });
    });
  }

  if (quickFormEl) {
    quickFormEl.addEventListener('submit', function (event) {
      event.preventDefault();

      var quickName = quickNameEl ? quickNameEl.value.trim() : '';
      var quickVehicle = quickVehicleEl ? quickVehicleEl.value.trim() : '';
      var quickCity = quickCityEl ? quickCityEl.value.trim() : '';
      var quickService = quickServiceEl ? quickServiceEl.value : 'interieur';
      var quickMessage = quickMessageEl ? quickMessageEl.value.trim() : '';
      var variantData = getCtaVariantData();
      var quickFormVariantData = getQuickFormVariantData();
      var quickEstimate = (document.getElementById('total') || {}).textContent || '';
      var contactName = document.getElementById('nom');
      var contactVehicle = document.getElementById('vehicule');
      var contactCity = document.getElementById('ville');
      var contactService = document.getElementById('prestation');
      var contactMessage = document.getElementById('message');
      var whatsappLines = [];
      var whatsappUrl = '';

      if (!quickName || !quickVehicle) {
        if (quickStatusEl) {
          quickStatusEl.textContent = 'Merci de renseigner au minimum votre nom et votre vehicule.';
        }

        trackEvent('tarif_quick_form_invalid_submit', {
          has_name: !!quickName,
          has_vehicle: !!quickVehicle
        });
        return;
      }

      if (contactName) {
        contactName.value = quickName;
      }
      if (contactVehicle) {
        contactVehicle.value = quickVehicle;
      }
      if (contactCity) {
        contactCity.value = quickCity;
      }
      if (contactService) {
        contactService.value = quickService;
      }
      if (contactMessage) {
        contactMessage.value = quickMessage || contactMessage.value;
      }

      if (quickStatusEl) {
        quickStatusEl.textContent = 'Infos transferees. Continuez votre demande juste en dessous.';
      }

      trackEvent('tarif_quick_form_continue_clicked', {
        prestation_type: quickService || 'unknown',
        has_city: !!quickCity,
        has_message: !!quickMessage,
        quick_form_variant: quickFormVariantData.label
      });

      whatsappLines = [
        'Bonjour Prime Detail,',
        '',
        'Je souhaite un devis rapide :',
        '- Nom / Prénom : ' + quickName,
        '- Ville : ' + (quickCity || 'Non précisée'),
        '- Véhicule : ' + quickVehicle,
        '- Prestation souhaitée : ' + quickService,
        '- CTA Quiz : ' + (variantData ? variantData.label : 'Non défini'),
        '',
        'Détails :',
        (quickMessage || 'Non précisés'),
        '',
        'Merci.'
      ];

      whatsappUrl = 'https://wa.me/33656751197?text=' + encodeURIComponent(whatsappLines.join('\n'));
      if (quickModalWhatsappEl) {
        quickModalWhatsappEl.setAttribute('href', whatsappUrl);
      }
      if (quickModalEstimateEl) {
        quickModalEstimateEl.textContent = quickEstimate ? ('Estimation actuelle: ' + quickEstimate) : '';
      }

      openQuickModal();

      trackEvent('tarif_quick_form_modal_opened', {
        prestation_type: quickService || 'unknown',
        cta_variant: variantData ? variantData.label : 'Non défini',
        quick_form_variant: quickFormVariantData.label
      });
    });
  }

  if (quickModalCloseEl) {
    quickModalCloseEl.addEventListener('click', function () {
      closeQuickModal();
    });
  }

  if (quickModalEl) {
    quickModalEl.addEventListener('click', function (event) {
      if (event.target === quickModalEl) {
        closeQuickModal();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !quickModalEl.hidden) {
        closeQuickModal();
      }
    });
  }

  if (quickModalWhatsappEl) {
    quickModalWhatsappEl.addEventListener('click', function () {
      trackEvent('tarif_quick_form_whatsapp_clicked', {
        source: 'tarif_modal',
        quick_form_variant: getQuickFormVariantData().label
      });
    });
  }

  if (quickModalContactEl) {
    quickModalContactEl.addEventListener('click', function () {
      var contactSection = document.getElementById('contact');
      closeQuickModal();
      if (contactSection && typeof contactSection.scrollIntoView === 'function') {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      trackEvent('tarif_quick_form_contact_clicked', {
        source: 'tarif_modal',
        quick_form_variant: getQuickFormVariantData().label
      });
    });
  }

    showStep('1');
    applyCtaVariant();
    applyQuickFormVariant();
    updateResult(false);
    updateProgress();
  }

  function startLazyQuiz() {
    var started = false;

    function boot() {
      if (started) {
        return;
      }
      started = true;
      initQuiz();
    }

    var target = document.getElementById('tarif-quiz') || document.getElementById('tarifs');
    if (!target || typeof IntersectionObserver === 'undefined') {
      boot();
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      if (entries.some(function (entry) { return entry.isIntersecting; })) {
        observer.disconnect();
        boot();
      }
    }, { rootMargin: '200px 0px' });

    observer.observe(target);

    setTimeout(function () {
      observer.disconnect();
      boot();
    }, 8000);
  }

  startLazyQuiz();
})();

(function () {
  var memoryStore = { vehicle: null, ext: null };
  var analyticsState = {
    estimateKey: null,
    variantTracked: false,
    quickFormVariantTracked: false
  };

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
        eventName === 'tarif_quick_form_whatsapp_clicked' ||
        eventName === 'tarif_quick_form_contact_clicked' ||
        eventName === 'quiz_primary_cta_clicked'
      )) {
        window.fbq('trackCustom', eventName, payload, { eventID: eventId });

        if (eventName === 'tarif_quick_form_contact_clicked') {
          standardEventName = 'Lead';
          window.fbq('track', 'Lead', payload, { eventID: eventId });
        }

        if (eventName === 'tarif_quick_form_whatsapp_clicked' || eventName === 'quiz_primary_cta_clicked') {
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
    ex_base: { citadine: 79, berline: 89, suv: 99 },
    ex_standard: { citadine: 119, berline: 129, suv: 139 },
    ex_premium: { citadine: 229, berline: 249, suv: 269 },
    polish_one_step: { citadine: 189, berline: 209, suv: 229 },
    polish_two_step: { citadine: 299, berline: 329, suv: 359 },
    polish_ceramic_prep: { citadine: 399, berline: 439, suv: 489 },
    base: { citadine: 49, berline: 54, suv: 59 },
    standard: { citadine: 89, berline: 99, suv: 109 },
    premium: { citadine: 199, berline: 224, suv: 249 }
  };

  var exteriorLabels = {
    none: 'Intérieur seul',
    ex_base: 'Extérieur seul BASE',
    ex_standard: 'Extérieur seul STANDARD',
    ex_premium: 'Extérieur seul PREMIUM',
    polish_one_step: 'Polissage one-step',
    polish_two_step: 'Polissage 2 étapes',
    polish_ceramic_prep: 'Préparation céramique',
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
    ex_base: [
      'Pré-lavage haute pression + mousse active',
      'Lavage extérieur complet carrosserie/jantes',
      'Finitions vitres extérieures + dressing pneus'
    ],
    ex_standard: [
      'Pack BASE extérieur inclus',
      'Décontamination ferreuse carrosserie/jantes',
      'Protection extérieure renforcée'
    ],
    ex_premium: [
      'Pack STANDARD extérieur inclus',
      'Clay bar + polish extérieur de finition',
      'Protection extérieure longue durée'
    ],
    polish_one_step: [
      'Diagnostic visuel et préparation vernis',
      'Correction légère des micro-rayures',
      'Gain de brillance immédiat'
    ],
    polish_two_step: [
      'Étape coupe contrôlée',
      'Étape finition haute clarté',
      'Rendu visuel premium validé'
    ],
    polish_ceramic_prep: [
      'Décontamination approfondie',
      'Correction peinture multi-zones',
      'Préparation technique avant protection'
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
    var packExteriorNote = document.getElementById('pack-exterior-note');
    var packBase = quiz ? quiz.querySelector('.pack-base') : null;
    var packStandard = quiz ? quiz.querySelector('.pack-standard') : null;
    var packPremium = quiz ? quiz.querySelector('.pack-premium') : null;
    var packBaseTitleEl = document.getElementById('pack-base-title');
    var packStandardTitleEl = document.getElementById('pack-standard-title');
    var packPremiumTitleEl = document.getElementById('pack-premium-title');
    var packExBase = quiz ? quiz.querySelector('.pack-ex-base') : null;
    var packExStandard = quiz ? quiz.querySelector('.pack-ex-standard') : null;
    var packExPremium = quiz ? quiz.querySelector('.pack-ex-premium') : null;
    var packPolishOne = quiz ? quiz.querySelector('.pack-polish-one') : null;
    var packPolishTwo = quiz ? quiz.querySelector('.pack-polish-two') : null;
    var packPolishCeramic = quiz ? quiz.querySelector('.pack-polish-ceramic') : null;
    var packExBaseTitleEl = document.getElementById('pack-ex-base-title');
    var packExStandardTitleEl = document.getElementById('pack-ex-standard-title');
    var packExPremiumTitleEl = document.getElementById('pack-ex-premium-title');
    var packPolishOneTitleEl = document.getElementById('pack-polish-one-title');
    var packPolishTwoTitleEl = document.getElementById('pack-polish-two-title');
    var packPolishCeramicTitleEl = document.getElementById('pack-polish-ceramic-title');
    var interieurProEl = quiz ? quiz.querySelector('.interieur-pro') : null;
    var interiorProtocolEl = document.getElementById('interior-protocol');
    var processStepsEl = document.getElementById('process-steps');
    var terrainOnlyPriceEl = document.getElementById('terrain-only-price');
    var terrainTitleEl = document.getElementById('terrain-title');
    var terrainNoteEl = document.getElementById('terrain-note');
    var terrainPriceLabelEl = document.getElementById('terrain-price-label');
    var exteriorOnlyHintEl = document.getElementById('exterior-only-hint');
    var interiorOnlyHintEl = document.getElementById('interior-only-hint');
    var ctaButtonEl = quiz ? quiz.querySelector('.btn-gold') : null;
    var ctaHelperEl = quiz ? quiz.querySelector('.cta-helper') : null;
    var ctaSubnoteEl = quiz ? quiz.querySelector('.cta-subnote') : null;
    var polishDiagnosticNoteEl = document.getElementById('polish-diagnostic-note');
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
      'exterior-level': 62,
      'polish-level': 62,
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
    var isExteriorOnlyMode = ext.indexOf('ex_') === 0;
    var isPolishMode = ext.indexOf('polish_') === 0;
    var normalizedExt = isExteriorOnlyMode ? ext.replace('ex_', '') : ext;
    var intPrix = (isExteriorOnlyMode || isPolishMode) ? 0 : (interiorPrices[veh] || interiorPrices.citadine);
    var extPrix = (exteriorPrices[ext] && exteriorPrices[ext][veh]) || 0;
    var total = intPrix + extPrix;
    var variantData = getCtaVariantData();
    var basePrice = (exteriorPrices.base && exteriorPrices.base[veh]) || 0;
    var standardPrice = (exteriorPrices.standard && exteriorPrices.standard[veh]) || 0;
    var premiumPrice = (exteriorPrices.premium && exteriorPrices.premium[veh]) || 0;
    var exBasePrice = (exteriorPrices.ex_base && exteriorPrices.ex_base[veh]) || 0;
    var exStandardPrice = (exteriorPrices.ex_standard && exteriorPrices.ex_standard[veh]) || 0;
    var exPremiumPrice = (exteriorPrices.ex_premium && exteriorPrices.ex_premium[veh]) || 0;
    var polishOnePrice = (exteriorPrices.polish_one_step && exteriorPrices.polish_one_step[veh]) || 0;
    var polishTwoPrice = (exteriorPrices.polish_two_step && exteriorPrices.polish_two_step[veh]) || 0;
    var polishCeramicPrice = (exteriorPrices.polish_ceramic_prep && exteriorPrices.polish_ceramic_prep[veh]) || 0;

    vehicleNameEl.textContent = vehicleNames[veh] || 'Citadine';
    totalEl.textContent = total + '€';

    if (packBaseTitleEl) {
      packBaseTitleEl.textContent = '✨ BASE Brillance (Ext +' + basePrice + '€)';
    }
    if (packStandardTitleEl) {
      packStandardTitleEl.textContent = '🛡️ STANDARD Protection (Ext +' + standardPrice + '€)';
    }
    if (packPremiumTitleEl) {
      packPremiumTitleEl.textContent = '💎 PREMIUM Céramique (Ext +' + premiumPrice + '€)';
    }
    if (packExBaseTitleEl) {
      packExBaseTitleEl.textContent = '🌤️ BASE Extérieur seul (' + exBasePrice + '€)';
    }
    if (packExStandardTitleEl) {
      packExStandardTitleEl.textContent = '🌤️ STANDARD Extérieur seul (' + exStandardPrice + '€)';
    }
    if (packExPremiumTitleEl) {
      packExPremiumTitleEl.textContent = '🌤️ PREMIUM Extérieur seul (' + exPremiumPrice + '€)';
    }
    if (packPolishOneTitleEl) {
      packPolishOneTitleEl.textContent = '🌀 Polissage one-step certifié (' + polishOnePrice + '€)';
    }
    if (packPolishTwoTitleEl) {
      packPolishTwoTitleEl.textContent = '🌀 Polissage 2 étapes certifié (' + polishTwoPrice + '€)';
    }
    if (packPolishCeramicTitleEl) {
      packPolishCeramicTitleEl.textContent = '🌀 Préparation céramique certifiée (' + polishCeramicPrice + '€)';
    }

    if (exteriorOnlyHintEl) {
      exteriorOnlyHintEl.hidden = !(isExteriorOnlyMode || isPolishMode);
    }

    if (interiorOnlyHintEl) {
      interiorOnlyHintEl.hidden = ext !== 'none';
    }

    if (polishDiagnosticNoteEl) {
      polishDiagnosticNoteEl.hidden = !isPolishMode;
    }

    if (packDesc) {
      if (packBase) {
        packBase.classList.toggle('active', !isExteriorOnlyMode && normalizedExt === 'base');
      }
      if (packStandard) {
        packStandard.classList.toggle('active', !isExteriorOnlyMode && normalizedExt === 'standard');
      }
      if (packPremium) {
        packPremium.classList.toggle('active', !isExteriorOnlyMode && normalizedExt === 'premium');
      }
      if (packExBase) {
        packExBase.classList.toggle('active', isExteriorOnlyMode && normalizedExt === 'base');
      }
      if (packExStandard) {
        packExStandard.classList.toggle('active', isExteriorOnlyMode && normalizedExt === 'standard');
      }
      if (packExPremium) {
        packExPremium.classList.toggle('active', isExteriorOnlyMode && normalizedExt === 'premium');
      }
      if (packPolishOne) {
        packPolishOne.classList.toggle('active', isPolishMode && ext === 'polish_one_step');
      }
      if (packPolishTwo) {
        packPolishTwo.classList.toggle('active', isPolishMode && ext === 'polish_two_step');
      }
      if (packPolishCeramic) {
        packPolishCeramic.classList.toggle('active', isPolishMode && ext === 'polish_ceramic_prep');
      }
      if (packNoneNote) {
        packNoneNote.style.display = ext === 'none' ? 'block' : 'none';
      }
      if (packExteriorNote) {
        packExteriorNote.hidden = !(isExteriorOnlyMode || isPolishMode);
      }
    }

    if (interieurProEl) {
      interieurProEl.style.display = (isExteriorOnlyMode || isPolishMode) ? 'none' : 'block';
    }

    if (interiorProtocolEl) {
      interiorProtocolEl.style.display = (isExteriorOnlyMode || isPolishMode) ? 'none' : 'block';
    }

    processStepsEl.innerHTML = '';
    (processByExt[ext] || processByExt.none).forEach(function (stepText) {
      processStepsEl.insertAdjacentHTML('beforeend', '<li>' + stepText + '</li>');
    });

    if (terrainOnlyPriceEl) {
      if (isPolishMode) {
        terrainOnlyPriceEl.textContent = 'Sur étude';
      } else if (isExteriorOnlyMode) {
        terrainOnlyPriceEl.textContent = 'Impossible en rue';
      } else {
        terrainOnlyPriceEl.textContent = intPrix + '€';
      }
    }

    if (terrainTitleEl) {
      if (isPolishMode) {
        terrainTitleEl.textContent = '⚠️ Polissage impossible sans terrain privé';
      } else if (isExteriorOnlyMode) {
        terrainTitleEl.textContent = '⚠️ Extérieur impossible sans terrain privé';
      } else {
        terrainTitleEl.textContent = '⚠️ Extérieur impossible';
      }
    }

    if (terrainNoteEl) {
      if (isPolishMode) {
        terrainNoteEl.textContent = 'Le polissage nécessite un emplacement privé sécurisé. En rue, on peut faire un diagnostic photo.';
      } else if (isExteriorOnlyMode) {
        terrainNoteEl.textContent = 'Intervention extérieure impossible sur voie publique. Terrain privé obligatoire.';
      } else {
        terrainNoteEl.textContent = 'Terrain privé obligatoire (rue interdite).';
      }
    }

    if (terrainPriceLabelEl) {
      if (isPolishMode) {
        terrainPriceLabelEl.textContent = 'Diagnostic à distance';
      } else if (isExteriorOnlyMode) {
        terrainPriceLabelEl.textContent = 'Intervention extérieure';
      } else {
        terrainPriceLabelEl.textContent = 'Intérieur possible';
      }
    }

    if (quickFormEl) {
      quickFormEl.hidden = !quizState.isFinalized;
      if (quickServiceEl) {
        quickServiceEl.value = ext === 'none' ? 'interieur' : (isPolishMode ? (ext === 'polish_ceramic_prep' ? 'prepa_ceramique' : ext) : (isExteriorOnlyMode ? 'carrosserie' : 'pack'));
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
      prestationSelect.value = ext === 'none' ? 'interieur' : (isPolishMode ? (ext === 'polish_ceramic_prep' ? 'prepa_ceramique' : ext) : (isExteriorOnlyMode ? 'carrosserie' : 'pack'));
    }

    if (ctaButtonEl && ctaHelperEl && ctaSubnoteEl) {
      if (isPolishMode) {
        ctaButtonEl.textContent = '🧪 Demander mon diagnostic vernis';
        ctaHelperEl.textContent = 'Analyse rapide pour confirmer le bon niveau de correction avant intervention.';
        ctaSubnoteEl.innerHTML = 'Envoyez 2-3 photos sur WhatsApp au <strong>06 56 75 11 97</strong> pour un cadrage rapide.';
      } else if (variantData && variantData.variant) {
        ctaButtonEl.textContent = variantData.variant.button;
        ctaHelperEl.textContent = variantData.variant.helper;
        ctaSubnoteEl.innerHTML = variantData.variant.subnote;
      }
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
      var currentExt = getExt();
      var isPolishMode = currentExt.indexOf('polish_') === 0;
      var destination = isPolishMode ? 'diagnostic_polish' : 'phone_call';

      if (isPolishMode) {
        trackEvent('polish_diagnostic_cta_clicked', {
          polish_level: currentExt,
          vehicle_type: getVehicle(),
          cta_variant: variantData.label
        });
      }

      trackEvent('quiz_primary_cta_clicked', {
        cta_variant: variantData.label,
        destination: destination
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

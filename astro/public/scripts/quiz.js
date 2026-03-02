(function () {
  var memoryStore = { vehicle: null, ext: null };

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
    var prestationSelect = document.getElementById('prestation');
    var messageField = document.getElementById('message');

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

    function updateResult() {
    var veh = getVehicle();
    var ext = getExt();
    var intPrix = interiorPrices[veh] || interiorPrices.citadine;
    var extPrix = (exteriorPrices[ext] && exteriorPrices[ext][veh]) || 0;
    var total = intPrix + extPrix;

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
      processStepsEl.insertAdjacentHTML('beforeend', '<li>• ' + stepText + '</li>');
    });

    if (terrainOnlyPriceEl) {
      terrainOnlyPriceEl.textContent = intPrix + '€';
    }

    if (prestationSelect) {
      prestationSelect.value = ext === 'none' ? 'interieur' : 'pack';
    }

    if (messageField) {
      messageField.value = 'Estimation quiz : ' + total + '€ | Véhicule : ' + (vehicleNames[veh] || 'Citadine') +
        ' | Extérieur : ' + (exteriorLabels[ext] || 'Intérieur seul') + '.';
    }
  }

    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        var parentStep = getParentStep(card);
        var currentStep = parentStep ? parentStep.getAttribute('data-step') : '1';
        var nextStep = card.getAttribute('data-next');

        if (card.hasAttribute('data-type')) {
          setStoredValue('vehicle', card.getAttribute('data-type'));
        }

        if (card.hasAttribute('data-ext')) {
          setStoredValue('ext', card.getAttribute('data-ext'));
          if (card.getAttribute('data-ext') === 'none') {
            nextStep = '4';
            updateResult();
          }
        }

        showStep(nextStep || currentStep);
        updateProgress();
      });
    });

  if (yesCard) {
    yesCard.addEventListener('click', function () {
      showStep('4');
      updateResult();
      updateProgress();
    });
  }

  if (noCard) {
    noCard.addEventListener('click', function () {
      updateResult();
      showStep('terrain');
      updateProgress();
    });
  }

  restartButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      clearStoredValue('vehicle');
      clearStoredValue('ext');
      showStep('1');
      updateResult();
      updateProgress();
    });
  });

    showStep('1');
    updateResult();
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

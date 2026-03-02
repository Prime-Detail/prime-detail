(function () {
  var quizContainer = document.getElementById('quiz-container');
  var resultBox = document.getElementById('result');
  var resultTitle = document.getElementById('result-title');
  var resultText = document.getElementById('result-text');

  if (!quizContainer || !resultBox || !resultTitle || !resultText) {
    return;
  }

  function track(eventName, params) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params || {});
    }
  }

  var answers = {
    vehicule: null,
    prestation: null
  };

  var steps = [
    {
      key: 'vehicule',
      title: 'Quel type de véhicule ?',
      options: [
        { label: 'Citadine', value: 'citadine' },
        { label: 'Berline', value: 'berline' },
        { label: 'SUV / Monospace', value: 'suv' }
      ]
    },
    {
      key: 'prestation',
      title: 'Quelle prestation souhaitez-vous ?',
      options: [
        { label: 'Intérieur', value: 'interieur' },
        { label: 'Extérieur', value: 'exterieur' },
        { label: 'Complète', value: 'complete' }
      ]
    }
  ];

  var prix = {
    interieur: {
      citadine: 120,
      berline: 140,
      suv: 160
    },
    exterieur: {
      citadine: 80,
      berline: 95,
      suv: 110
    },
    complete: {
      citadine: 180,
      berline: 210,
      suv: 250
    }
  };

  function labelVehicule(value) {
    var map = {
      citadine: 'Citadine',
      berline: 'Berline',
      suv: 'SUV / Monospace'
    };
    return map[value] || value;
  }

  function labelPrestation(value) {
    var map = {
      interieur: 'Intérieur',
      exterieur: 'Extérieur',
      complete: 'Complète'
    };
    return map[value] || value;
  }

  function showResult() {
    var vehicule = answers.vehicule;
    var prestation = answers.prestation;

    if (!vehicule || !prestation) {
      return;
    }

    var montant = prix[prestation][vehicule];
    resultTitle.textContent = 'Tarif estimatif : ' + montant + '€';
    resultText.textContent = 'Pour ' + labelVehicule(vehicule) + ' • prestation ' + labelPrestation(prestation) + '. Appelez-nous pour confirmer le tarif exact selon l’état du véhicule.';

    resultBox.hidden = false;
    track('quiz_completed', {
      vehicule: vehicule,
      prestation: prestation,
      tarif_estime: montant
    });
  }

  function renderStep(stepIndex) {
    resultBox.hidden = true;

    if (stepIndex >= steps.length) {
      showResult();
      return;
    }

    var step = steps[stepIndex];
    var html = '<div class="quiz-question"><h4>' + step.title + '</h4>';

    for (var index = 0; index < step.options.length; index += 1) {
      var option = step.options[index];
      html += '<button type="button" data-key="' + step.key + '" data-value="' + option.value + '">' + option.label + '</button>';
    }

    if (stepIndex > 0) {
      html += '<button type="button" data-action="back">← Retour</button>';
    }

    html += '</div>';
    quizContainer.innerHTML = html;

    track('quiz_step_view', {
      step: step.key,
      step_index: stepIndex + 1
    });
  }

  quizContainer.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || target.tagName !== 'BUTTON') {
      return;
    }

    var action = target.getAttribute('data-action');
    if (action === 'back') {
      if (answers.prestation) {
        answers.prestation = null;
        renderStep(1);
        return;
      }

      if (answers.vehicule) {
        answers.vehicule = null;
      }
      renderStep(0);
      return;
    }

    var key = target.getAttribute('data-key');
    var value = target.getAttribute('data-value');

    if (!key || !value) {
      return;
    }

    answers[key] = value;

    track('quiz_answer', {
      question: key,
      answer: value
    });

    if (key === 'vehicule') {
      renderStep(1);
      return;
    }

    renderStep(2);
  });

  renderStep(0);
})();

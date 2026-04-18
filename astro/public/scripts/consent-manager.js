(function () {
  var storageKey = 'prime_detail_cookie_consent_v1';
  var consentVersion = '2026-04';
  var config = window.__PD_TRACKING_CONFIG__ || {};
  var gaMeasurementId = config.gaMeasurementId || '';
  var metaPixelId = config.metaPixelId || '';
  var hasInitializedTags = false;

  function safeParse(value) {
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch (error) {
      return null;
    }
  }

  function loadStoredConsent() {
    var raw = null;

    try {
      raw = localStorage.getItem(storageKey);
    } catch (error) {
      raw = null;
    }

    return safeParse(raw);
  }

  function saveConsent(status) {
    var payload = {
      status: status,
      version: consentVersion,
      updatedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch (error) {
    }

    return payload;
  }

  function isGranted(consentState) {
    return !!(consentState && consentState.status === 'granted' && consentState.version === consentVersion);
  }

  function ensureGtagLoaded() {
    if (!gaMeasurementId || document.getElementById('pd-ga-script')) {
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };

    var script = document.createElement('script');
    script.id = 'pd-ga-script';
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaMeasurementId);

    script.onload = function () {
      var search = window.location && window.location.search ? window.location.search : '';
      var gaDebug = search.indexOf('ga_debug=1') !== -1;
      var gaTest = search.indexOf('ga_test=1') !== -1;

      window.gtag('js', new Date());
      window.gtag('config', gaMeasurementId, {
        debug_mode: gaDebug
      });

      if (gaTest) {
        window.gtag('event', 'ga_test_ping', {
          debug_mode: true,
          non_interaction: true,
          page_location: window.location.href
        });
      }
    };

    document.head.appendChild(script);
  }

  function ensureMetaPixelLoaded() {
    if (!metaPixelId || document.getElementById('pd-meta-pixel-script') || typeof window.fbq === 'function') {
      return;
    }

    var script = document.createElement('script');
    script.id = 'pd-meta-pixel-script';
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';

    window.fbq = function () {
      if (!window.fbq.callMethod) {
        window.fbq.queue = window.fbq.queue || [];
        window.fbq.queue.push(arguments);
        return;
      }
      window.fbq.callMethod.apply(window.fbq, arguments);
    };

    if (!window._fbq) {
      window._fbq = window.fbq;
    }

    window.fbq.push = window.fbq;
    window.fbq.loaded = true;
    window.fbq.version = '2.0';
    window.fbq.queue = window.fbq.queue || [];

    script.onload = function () {
      if (typeof window.fbq === 'function') {
        window.fbq('init', metaPixelId);
        window.fbq('track', 'PageView');
      }
    };

    document.head.appendChild(script);
  }

  function initializeTrackingIfNeeded() {
    if (hasInitializedTags) {
      return;
    }

    ensureGtagLoaded();
    ensureMetaPixelLoaded();
    hasInitializedTags = true;
  }

  function createButton(label, variant) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'pd-consent-btn pd-consent-btn-' + variant;
    button.textContent = label;
    return button;
  }

  function createBanner() {
    var wrapper = document.createElement('div');
    wrapper.className = 'pd-consent-banner';
    wrapper.setAttribute('role', 'dialog');
    wrapper.setAttribute('aria-live', 'polite');
    wrapper.setAttribute('aria-label', 'Gestion du consentement cookies');

    var text = document.createElement('p');
    text.className = 'pd-consent-text';
    text.textContent = 'Prime Detail utilise des traceurs de mesure d audience (GA4) et de conversion (Meta) uniquement avec votre accord.';

    var links = document.createElement('p');
    links.className = 'pd-consent-links';

    var legalLink = document.createElement('a');
    legalLink.href = (window.__BASE_URL__ || '/') + 'mentions-legales';
    legalLink.textContent = 'Voir les mentions legales';

    links.appendChild(legalLink);

    var actions = document.createElement('div');
    actions.className = 'pd-consent-actions';

    var refuseBtn = createButton('Refuser', 'secondary');
    var acceptBtn = createButton('Accepter', 'primary');

    actions.appendChild(refuseBtn);
    actions.appendChild(acceptBtn);

    wrapper.appendChild(text);
    wrapper.appendChild(links);
    wrapper.appendChild(actions);

    refuseBtn.addEventListener('click', function () {
      saveConsent('denied');
      wrapper.remove();
      refreshManageButtonLabel('Cookies refuses');
    });

    acceptBtn.addEventListener('click', function () {
      saveConsent('granted');
      initializeTrackingIfNeeded();
      wrapper.remove();
      refreshManageButtonLabel('Cookies acceptes');
    });

    return wrapper;
  }

  function refreshManageButtonLabel(label) {
    var button = document.getElementById('pd-consent-manage');
    if (button) {
      button.setAttribute('aria-label', label + ' - gerer les cookies');
    }
  }

  function ensureManageButton() {
    if (document.getElementById('pd-consent-manage')) {
      return;
    }

    var button = document.createElement('button');
    button.id = 'pd-consent-manage';
    button.type = 'button';
    button.className = 'pd-consent-manage';
    button.textContent = 'Cookies';
    button.setAttribute('aria-label', 'Gerer les cookies');

    button.addEventListener('click', function () {
      var existing = document.querySelector('.pd-consent-banner');
      if (existing) {
        existing.remove();
      }
      document.body.appendChild(createBanner());
    });

    document.body.appendChild(button);
  }

  function bootstrap() {
    ensureManageButton();

    var consentState = loadStoredConsent();

    if (isGranted(consentState)) {
      initializeTrackingIfNeeded();
      refreshManageButtonLabel('Cookies acceptes');
      return;
    }

    if (consentState && consentState.status === 'denied' && consentState.version === consentVersion) {
      refreshManageButtonLabel('Cookies refuses');
      return;
    }

    document.body.appendChild(createBanner());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();

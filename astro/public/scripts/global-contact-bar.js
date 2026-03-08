(function () {
  var barEl = document.querySelector('.global-mobile-contact-bar');
  var isNearContact = false;
  var isModalOpen = false;
  var refreshTimer = null;

  function setBarVisibility(isVisible) {
    if (!barEl) {
      return;
    }

    barEl.classList.toggle('is-hidden', !isVisible);
  }

  function refreshBarVisibility() {
    setBarVisibility(!isNearContact && !isModalOpen);
  }

  function scheduleRefreshBarVisibility() {
    if (refreshTimer !== null) {
      clearTimeout(refreshTimer);
    }

    refreshTimer = setTimeout(function () {
      refreshTimer = null;
      refreshBarVisibility();
    }, 300);
  }

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

  function bindContactTracking(id, eventName, channel) {
    var el = document.getElementById(id);

    if (!el) {
      return;
    }

    el.addEventListener('click', function () {
      trackEvent(eventName, {
        source: 'sticky_bar_global',
        channel: channel,
        page_path: window.location.pathname || '/',
        page_location: window.location.href
      });
    });
  }

  function initAutoHideNearContact() {
    var contactSection = document.getElementById('contact');

    if (!barEl || !contactSection || typeof window.IntersectionObserver === 'undefined') {
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      isNearContact = entries.some(function (entry) {
        return entry.isIntersecting;
      });

      scheduleRefreshBarVisibility();
    }, {
      root: null,
      threshold: 0.15
    });

    observer.observe(contactSection);
  }

  function computeModalOpenState() {
    var quickModalEl = document.getElementById('tarif-qf-modal');
    var bodyHasModalClass = !!(document.body && document.body.classList.contains('tarif-modal-open'));
    var modalVisible = !!(quickModalEl && !quickModalEl.hidden && quickModalEl.getAttribute('aria-hidden') !== 'true');
    return bodyHasModalClass || modalVisible;
  }

  function initAutoHideOnModal() {
    var quickModalEl = document.getElementById('tarif-qf-modal');

    isModalOpen = computeModalOpenState();
    scheduleRefreshBarVisibility();

    if (typeof window.MutationObserver === 'undefined') {
      return;
    }

    var refreshFromMutation = function () {
      isModalOpen = computeModalOpenState();
      scheduleRefreshBarVisibility();
    };

    if (document.body) {
      new MutationObserver(refreshFromMutation).observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
      });
    }

    if (quickModalEl) {
      new MutationObserver(refreshFromMutation).observe(quickModalEl, {
        attributes: true,
        attributeFilter: ['hidden', 'aria-hidden']
      });
    }
  }

  refreshBarVisibility();

  bindContactTracking('global-mobile-call', 'contact_call_clicked', 'phone_call');
  bindContactTracking('global-mobile-whatsapp', 'contact_whatsapp_clicked', 'whatsapp_message');
  initAutoHideNearContact();
  initAutoHideOnModal();
})();

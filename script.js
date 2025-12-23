// ============================================
// PAGE LOADER
// ============================================
window.addEventListener('load', () => {
  const loader = document.getElementById('pageLoader');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('hidden');
    }, 300);
  }

  // Animation discrète sur le bouton Réserver sticky (mobile)
  const reserveSticky = document.querySelector('.reserve-sticky');
  if (reserveSticky) {
    setTimeout(() => {
      reserveSticky.classList.add('attention');
      setTimeout(() => reserveSticky.classList.remove('attention'), 5200);
    }, 3000);
  }

  // Pulse discret sur le CTA de nav après 6s
  const navCta = document.querySelector('.nav .nav-cta');
  if (navCta) {
    setTimeout(() => navCta.classList.add('pulse-once'), 6000);
  }
});

// Sécurité : retirer le loader après 3 secondes max
setTimeout(() => {
  const loader = document.getElementById('pageLoader');
  if (loader && !loader.classList.contains('hidden')) {
    loader.classList.add('hidden');
  }
}, 3000);

// ============================================
// TRACKING GLOBAL (accessible partout)
// ============================================
function pdTrack(action, label) {
  try {
    if (typeof gtag === 'function') {
      gtag('event', action, { event_category: 'CTA', event_label: label });
    }
  } catch (e) {}
}

// ============================================
// BARRE DE PROGRESSION DU SCROLL
// ============================================
window.addEventListener('scroll', () => {
  const scrollProgress = document.getElementById('scrollProgress');
  if (scrollProgress) {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercentage = (scrollTop / scrollHeight) * 100;
    scrollProgress.style.width = scrollPercentage + '%';
  }
});

// (Supprimé) Gestion du mode sombre/clair : fond noir forcé côté CSS, aucun toggle.

// ============================================
// MENU BURGER MOBILE
// ============================================
const menuBurger = document.getElementById('menuBurger');
const mainNav = document.getElementById('mainNav');

if (menuBurger && mainNav) {
  menuBurger.addEventListener('click', () => {
    menuBurger.classList.toggle('active');
    mainNav.classList.toggle('active');
  });

  // Fermer le menu en cliquant sur un lien
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuBurger.classList.remove('active');
      mainNav.classList.remove('active');
    });
  });
}

// ============================================
// ANIMATIONS AU SCROLL
// ============================================
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

// Appliquer l'animation aux sections
document.addEventListener('DOMContentLoaded', () => {
    // Wrapper local (utilise le tracker global)
    const trackEvent = (action, label) => pdTrack(action, label);

    // Hero CTAs
    const heroReserve = document.querySelector('.hero .btn.btn-primary[href^="https://www.sumupbookings.com"]');
    if (heroReserve) heroReserve.addEventListener('click', () => trackEvent('reserve_click', 'hero'));
    const heroCall = document.querySelector('.hero .btn.btn-secondary[href^="tel:"]');
    if (heroCall) heroCall.addEventListener('click', () => trackEvent('call_click', 'hero'));
    const heroWhats = document.querySelector('.hero .btn.btn-whatsapp[href*="wa.me"]');
    if (heroWhats) heroWhats.addEventListener('click', () => trackEvent('whatsapp_click', 'hero'));

    // Nav Réservation
    const navReserve = document.querySelector('.nav .nav-cta[href^="https://www.sumupbookings.com"]');
    if (navReserve) navReserve.addEventListener('click', () => trackEvent('reserve_click', 'nav'));

    // Sticky Réserver (mobile)
    const stickyReserve = document.querySelector('.reserve-sticky[href^="https://www.sumupbookings.com"]');
    if (stickyReserve) stickyReserve.addEventListener('click', () => trackEvent('reserve_click', 'sticky'));

    // Bouton WhatsApp flottant
    const whatsappFloat = document.querySelector('.whatsapp-float[href*="wa.me"]');
    if (whatsappFloat) whatsappFloat.addEventListener('click', () => trackEvent('whatsapp_click', 'float'));

    // CTA À propos
    const aboutReserve = document.querySelector('.apropos .btn.btn-primary[href^="#reservation"]');
    if (aboutReserve) aboutReserve.addEventListener('click', () => trackEvent('reserve_click', 'apropos'));

    // Boutons "Nos avis Google" (section témoignages et footer)
    const googleReviewButtons = document.querySelectorAll('a.btn.btn-google[href*="share.google"], .footer a[href*="share.google"]');
    googleReviewButtons.forEach(btn => btn.addEventListener('click', () => trackEvent('google_reviews_click', 'reviews')));

    // Choisir cette formule (cartes tarifs)
    document.querySelectorAll('.choose-plan[data-plan]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const plan = btn.getAttribute('data-plan') || 'plan';
        trackEvent('reserve_click', 'pricing:' + plan);
      });
    });

    // CTA en haut de la section Tarifs
    const topTarifCta = document.querySelector('.tarifs .tarifs-cta');
    if (topTarifCta) topTarifCta.addEventListener('click', () => trackEvent('reserve_click', 'tarifs_top'));

    // Navigation (ancres) - suivi du menu
    document.querySelectorAll('.nav a[href^="#"]').forEach(a => {
      a.addEventListener('click', () => trackEvent('nav_click', a.getAttribute('href')));
    });

    // Section view (50% visible)
    const sectionViewObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id || 'no-id';
          trackEvent('section_view', id);
          sectionViewObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('section[id]').forEach(sec => sectionViewObserver.observe(sec));

    // Scroll depth (25/50/75/100)
    const thresholds = [25, 50, 75, 100];
    const fired = new Set();
    window.addEventListener('scroll', () => {
      const st = document.documentElement.scrollTop || document.body.scrollTop;
      const sh = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const percent = Math.round((st / Math.max(sh, 1)) * 100);
      thresholds.forEach(t => {
        if (percent >= t && !fired.has(t)) {
          fired.add(t);
          trackEvent('scroll_depth', String(t));
        }
      });
    }, { passive: true });

    // Outbound links + email/tel (générique sans doublons majeurs)
    document.addEventListener('click', (e) => {
      const a = e.target && (e.target.closest ? e.target.closest('a') : null);
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (!href) return;
      // Email
      if (href.startsWith('mailto:')) {
        trackEvent('email_click', href.replace('mailto:', ''));
        return;
      }
      // Téléphone (éviter doublon bouton hero)
      if (href.startsWith('tel:')) {
        if (!a.matches('.hero .btn.btn-secondary')) {
          trackEvent('call_click', 'global');
        }
        return;
      }
      // WhatsApp générique (éviter doublon hero/float)
      if (href.includes('wa.me')) {
        if (!a.matches('.hero .btn.btn-whatsapp, .whatsapp-float')) {
          trackEvent('whatsapp_click', 'global');
        }
        return;
      }
      // Sortant
      if (/^https?:/i.test(href)) {
        const dest = new URL(href, location.href);
        if (dest.host !== location.host) {
          // éviter doublons avec SumUp et Google reviews déjà suivis
          if (!dest.hostname.includes('sumupbookings.com') && !dest.hostname.includes('share.google')) {
            trackEvent('outbound_click', dest.hostname);
          }
        }
      }
    }, true);

    // Map view (zone d'intervention)
    const mapContainer = document.querySelector('.zone-intervention .map-container');
    if (mapContainer) {
      const mapObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            trackEvent('map_view', 'zone-intervention');
            mapObs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      mapObs.observe(mapContainer);
    }
  const sections = document.querySelectorAll('section');
  sections.forEach(section => {
    section.classList.add('fade-in');
    observer.observe(section);
  });
});

// ============================================
// COMPTEURS ANIMÉS (STATS)
// ============================================
function animateCounter(element, target, suffix = '') {
  let current = 0;
  const increment = target / 100;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target + suffix;
      clearInterval(timer);
    } else {
      element.textContent = Math.ceil(current) + suffix;
    }
  }, 20);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.animated) {
      const statNumber = entry.target.querySelector('.stat-number');
      const text = statNumber.textContent;
      
      if (text.includes('+')) {
        animateCounter(statNumber, 100, '+');
      } else if (text.includes('★')) {
        animateCounter(statNumber, 5, '★');
      } else if (text.includes('h')) {
        animateCounter(statNumber, 48, 'h');
      }
      
      entry.target.dataset.animated = 'true';
    }
  });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.stat-item').forEach(stat => {
    statsObserver.observe(stat);
  });
});

// ============================================
// NAVIGATION SMOOTH SCROLL (existant)
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});


// Form validation and submission
const reservationForm = document.getElementById('reservationForm');

if (reservationForm) {
  reservationForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Récupération des données du formulaire
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());
    
    // Validation basique
    if (!validateForm(data)) {
      return;
    }
    
    // Simulation d'envoi (à remplacer par un vrai appel API)
    console.log('Données de réservation:', data);
    pdTrack('reservation_submit', data.service || 'non_renseigne');
    
    // Afficher un message de confirmation
    showConfirmation();
    
    // Réinitialiser le formulaire
    this.reset();
  });

  // Form start (premier focus)
  let formStarted = false;
  reservationForm.addEventListener('focusin', () => {
    if (!formStarted) {
      formStarted = true;
      pdTrack('form_start', 'reservation');
    }
  });

  // Suivi des changements clés
  ['service', 'vehicule', 'date'].forEach(id => {
    const el = reservationForm.querySelector('#' + id);
    if (el) el.addEventListener('change', () => pdTrack('form_change', id));
  });

  // Afficher la boîte "Autre" si le type de véhicule sélectionné est "autre"
  const vehiculeSelect = reservationForm.querySelector('#vehicule');
  const vehiculeAutreBox = reservationForm.querySelector('#vehicule-autre');
  if (vehiculeSelect && vehiculeAutreBox) {
    vehiculeSelect.addEventListener('change', function () {
      vehiculeAutreBox.style.display = this.value === 'autre' ? 'block' : 'none';
    });
  }
}

// Fonction de validation
function validateForm(data) {
  const errors = [];
  
  // Validation email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    errors.push('Email invalide');
  }
  
  // Validation téléphone (format français basique)
  const telRegex = /^(\+33|0)[1-9](\d{2}){4}$/;
  const cleanTel = data.telephone.replace(/\s/g, '');
  if (!telRegex.test(cleanTel)) {
    errors.push('Numéro de téléphone invalide');
  }
  
  // Validation date (ne peut pas être dans le passé)
  if (data.date) {
    const selectedDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      errors.push('La date ne peut pas être dans le passé');
    }
  }
  
  // Afficher les erreurs
  if (errors.length > 0) {
    alert('Erreurs de validation:\n' + errors.join('\n'));
    return false;
  }
  
  return true;
}

// Fonction pour afficher la confirmation
function showConfirmation() {
  const confirmationDiv = document.createElement('div');
  confirmationDiv.className = 'confirmation-message';
  confirmationDiv.innerHTML = `
    <div class="confirmation-content">
      <div class="confirmation-icon">✓</div>
      <h3>Demande envoyée avec succès !</h3>
      <p>Merci de votre confiance. Nous vous contacterons dans les plus brefs délais pour confirmer votre rendez-vous.</p>
      <button onclick="this.parentElement.parentElement.remove()">Fermer</button>
    </div>
  `;
  
  // Ajouter les styles inline pour la modal
  confirmationDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    animation: fadeIn 0.3s ease;
  `;
  
  const content = confirmationDiv.querySelector('.confirmation-content');
  content.style.cssText = `
    background: white;
    padding: 3rem;
    border-radius: 15px;
    text-align: center;
    max-width: 500px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  `;

  const icon = confirmationDiv.querySelector('.confirmation-icon');
  icon.style.cssText = `
    font-size: 4rem;
    color: #25D366;
    margin-bottom: 1rem;
    display: block;
  `;
  
  const button = confirmationDiv.querySelector('button');
  button.style.cssText = `
    margin-top: 1.5rem;
    padding: 0.85rem 2rem;
    background-color: #0057ff;
    color: white;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: all 0.3s ease;
  `;

  button.addEventListener('mouseover', () => {
    button.style.backgroundColor = '#0046cc';
    button.style.transform = 'translateY(-2px)';
  });

  button.addEventListener('mouseout', () => {
    button.style.backgroundColor = '#0057ff';
    button.style.transform = 'translateY(0)';
  });
  
  document.body.appendChild(confirmationDiv);

  // Ajouter les animations CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
  
  // Fermer automatiquement après 6 secondes
  setTimeout(() => {
    if (confirmationDiv.parentElement) {
      confirmationDiv.remove();
    }
  }, 6000);
}

// Set minimum date to today for date input
document.addEventListener('DOMContentLoaded', function() {
  const dateInput = document.getElementById('date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }
});

// Animation au scroll des cartes
const cardsObserverOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const cardsObserver = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, cardsObserverOptions);

// Observer les cartes de services et de tarifs
document.addEventListener('DOMContentLoaded', function() {
  const cards = document.querySelectorAll('.service-card, .pricing-card, .contact-card, .stat-item');
  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    cardsObserver.observe(card);
  });
});

// Log pour debug (à retirer en production)
console.log('Prime Detail - Site chargé avec succès');

// Bouton Retour en Haut
document.addEventListener('DOMContentLoaded', function() {
  const backToTopBtn = document.getElementById('backToTop');
  
  if (backToTopBtn) {
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    });
    
    backToTopBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      pdTrack('back_to_top', 'button');
    });
  }
});

// Gestion du Bandeau Promo
document.addEventListener('DOMContentLoaded', function() {
  const promoBanner = document.getElementById('promoBanner');
  const closeBtn = document.getElementById('closeBanner');
  
  // Vérifier si la bannière a déjà été fermée
  const isBannerClosed = localStorage.getItem('promoBannerClosed');
  
  if (!isBannerClosed && promoBanner) {
    // Ajouter padding au body pour compenser la bannière
    setTimeout(() => {
      document.body.classList.add('has-promo');
    }, 1000);
    
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        promoBanner.classList.add('hidden');
        document.body.classList.remove('has-promo');
        
        // Sauvegarder dans le localStorage
        localStorage.setItem('promoBannerClosed', 'true');
        
        // Supprimer après animation
        setTimeout(() => {
          promoBanner.remove();
        }, 300);

          pdTrack('promo_close', 'banner');
      });
    }
  } else if (promoBanner) {
    promoBanner.remove();
  }
});

// FAQ Accordéon - Version ultra simplifiée
window.addEventListener('load', function() {
  setTimeout(function() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(function(item) {
      const question = item.querySelector('.faq-question');
      
      if (question) {
        question.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          // Fermer tous les autres
          faqItems.forEach(function(otherItem) {
            if (otherItem !== item) {
              otherItem.classList.remove('active');
            }
          });
          
          // Toggle actuel
          item.classList.toggle('active');
          
          return false;
        };
      }
    });
  }, 500);
});

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
});

// Sécurité : retirer le loader après 3 secondes max
setTimeout(() => {
  const loader = document.getElementById('pageLoader');
  if (loader && !loader.classList.contains('hidden')) {
    loader.classList.add('hidden');
  }
}, 3000);

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

// ============================================
// MODE SOMBRE / CLAIR
// ============================================
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'dark') {
  document.body.classList.add('dark-mode');
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
}

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

// ============================================
// AVANT/APRÈS SLIDER - VERSION ULTRA SIMPLE
// ============================================
(function() {
  'use strict';
  
  function initSliders() {
    const sliders = document.querySelectorAll('.before-after-slider');
    
    sliders.forEach(function(slider) {
      const beforeImg = slider.querySelector('.before-image');
      const handle = slider.querySelector('.before-after-handle');
      
      if (!beforeImg || !handle) return;
      
      let active = false;

      function slide(pageX) {
        const rect = slider.getBoundingClientRect();
        let x = pageX - rect.left;
        if (x < 0) x = 0;
        if (x > rect.width) x = rect.width;
        const percent = (x / rect.width) * 100;
        beforeImg.style.clipPath = 'inset(0 ' + (100 - percent) + '% 0 0)';
        handle.style.left = percent + '%';
      }

      // Mouse
      handle.addEventListener('mousedown', function(e) {
        active = true;
        slide(e.pageX);
        e.preventDefault();
      });

      document.addEventListener('mousemove', function(e) {
        if (active) slide(e.pageX);
      });

      document.addEventListener('mouseup', function() {
        active = false;
      });

      // Touch
      handle.addEventListener('touchstart', function(e) {
        active = true;
        slide(e.touches[0].pageX);
        e.preventDefault();
      });

      document.addEventListener('touchmove', function(e) {
        if (active) slide(e.touches[0].pageX);
      });

      document.addEventListener('touchend', function() {
        active = false;
      });
    });
  }

  // Attendre que tout soit chargé
  if (document.readyState === 'complete') {
    initSliders();
  } else {
    window.addEventListener('load', initSliders);
  }
})();

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
    
    // Afficher un message de confirmation
    showConfirmation();
    
    // Réinitialiser le formulaire
    this.reset();
  });
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

// Animation au scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observer les cartes de services et de tarifs
document.addEventListener('DOMContentLoaded', function() {
  const cards = document.querySelectorAll('.service-card, .pricing-card, .contact-card, .stat-item');
  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });
});

// Counter animation pour les stats
function animateCounter(element, target, duration = 2000) {
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;
  
  const counter = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target + '+';
      clearInterval(counter);
    } else {
      element.textContent = Math.floor(current) + '+';
    }
  }, 16);
}

// Animer les stats quand elles entrent en vue
const statsObserver = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
      const numberElement = entry.target.querySelector('.stat-number');
      if (numberElement && numberElement.textContent.includes('+')) {
        const number = parseInt(numberElement.textContent);
        animateCounter(numberElement, number);
      }
      entry.target.classList.add('animated');
    }
  });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.stat-item').forEach(item => {
    statsObserver.observe(item);
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
      });
    }
  } else if (promoBanner) {
    promoBanner.remove();
  }
});

// FAQ Accordéon
document.addEventListener('DOMContentLoaded', function() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
      // Fermer tous les autres items
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
        }
      });
      
      // Toggle l'item actuel
      item.classList.toggle('active');
    });
  });
});

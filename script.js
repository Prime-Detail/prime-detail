// Navigation smooth scroll
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

// Avant/Après Slider
function initBeforeAfterSliders() {
  const sliders = document.querySelectorAll('.before-after-slider');
  
  sliders.forEach(slider => {
    const afterImage = slider.querySelector('.after-image');
    const handle = document.createElement('div');
    handle.className = 'before-after-handle';
    handle.textContent = '◀ ▶';
    slider.appendChild(handle);
    
    let isActive = false;

    function updateSlider(e) {
      if (!isActive && !e.type.includes('click')) return;
      
      const rect = slider.getBoundingClientRect();
      let x = e.clientX ? e.clientX - rect.left : e.touches?.[0]?.clientX - rect.left;
      
      if (x < 0) x = 0;
      if (x > rect.width) x = rect.width;
      
      const percentage = (x / rect.width) * 100;
      
      afterImage.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
      handle.style.left = percentage + '%';
    }

    handle.addEventListener('mousedown', () => {
      isActive = true;
    });

    handle.addEventListener('touchstart', () => {
      isActive = true;
    });

    document.addEventListener('mousemove', updateSlider);
    document.addEventListener('touchmove', updateSlider, { passive: true });

    document.addEventListener('mouseup', () => {
      isActive = false;
    });

    document.addEventListener('touchend', () => {
      isActive = false;
    });

    // Click to slide
    slider.addEventListener('click', updateSlider);
  });
}

document.addEventListener('DOMContentLoaded', initBeforeAfterSliders);

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

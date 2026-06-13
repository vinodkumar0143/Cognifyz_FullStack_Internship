document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('.navbar-custom');
  
  // 1. Sticky Navbar visual transition on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // 2. Intersection Observer for Scroll Animations
  const animateElements = document.querySelectorAll('.scroll-animate');
  
  const observerOptions = {
    root: null, // use viewport
    rootMargin: '0px',
    threshold: 0.15 // trigger when 15% of element is visible
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show-anim');
        obs.unobserve(entry.target); // run animation only once
      }
    });
  }, observerOptions);

  animateElements.forEach(element => {
    observer.observe(element);
  });
});

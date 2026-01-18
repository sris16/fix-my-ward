// assets/js/main.js

document.addEventListener('DOMContentLoaded', () => {
  // We are NOT auto-redirecting anymore.
  // We always show Welcome + Admin / Citizen first.

  const roleChoiceCard = document.getElementById('role-choice-card');
  const citizenRegisterCard = document.getElementById('citizen-register-card');

  const btnCitizen = document.getElementById('btn-citizen');
  const btnAdmin = document.getElementById('btn-admin');
  const registerForm = document.getElementById('citizen-register-form');

  // Admin click → go to admin dashboard (we'll build later)
  if (btnAdmin) {
    btnAdmin.addEventListener('click', () => {
      window.location.href = 'admin/dashboard.html';
    });
  }

  // Citizen click → check if already registered or not
  if (btnCitizen) {
    btnCitizen.addEventListener('click', () => {
      const existingProfile = localStorage.getItem('fmw_citizen_profile');

      if (existingProfile) {
        // Already registered → go directly to report screen
        window.location.href = 'citizen/report.html';
      } else {
        // New user → show registration form
        if (roleChoiceCard) roleChoiceCard.classList.add('hidden');
        if (citizenRegisterCard) citizenRegisterCard.classList.remove('hidden');
      }
    });
  }

  // Handle citizen registration form submit
  if (registerForm) {
    registerForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const nameInput = document.getElementById('citizen-name');
      const mobileInput = document.getElementById('citizen-mobile');
      const emailInput = document.getElementById('citizen-email');

      const name = nameInput.value.trim();
      const mobile = mobileInput.value.trim();
      const email = emailInput.value.trim();

      if (!name || !mobile || !email) {
        alert('Please fill in all the fields.');
        return;
      }

      const profile = {
        name,
        mobile,
        email,
        createdAt: new Date().toISOString(),
      };

      // Save in localStorage → from now on, user is treated as "existing"
      localStorage.setItem('fmw_citizen_profile', JSON.stringify(profile));

      // Go to report page
      window.location.href = 'citizen/report.html';
    });
  }
});

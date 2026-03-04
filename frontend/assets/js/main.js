document.addEventListener('DOMContentLoaded', () => {

  const roleChoiceCard = document.getElementById('role-choice-card');
  const citizenRegisterCard = document.getElementById('citizen-register-card');

  const btnCitizen = document.getElementById('btn-citizen');
  const btnAdmin = document.getElementById('btn-admin');
  const registerForm = document.getElementById('citizen-register-form');

  if (btnAdmin) {
    btnAdmin.addEventListener('click', () => {
      window.location.href = 'admin/dashboard.html';
    });
  }

  if (btnCitizen) {
    btnCitizen.addEventListener('click', () => {
      const existingProfile = localStorage.getItem('fmw_citizen_profile');

      if (existingProfile) {
        window.location.href = 'citizen/home.html';
      } else {
        roleChoiceCard.classList.add('hidden');
        citizenRegisterCard.classList.remove('hidden');
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const name = document.getElementById('citizen-name').value.trim();
      const mobile = document.getElementById('citizen-mobile').value.trim();
      const email = document.getElementById('citizen-email').value.trim();

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

      localStorage.setItem('fmw_citizen_profile', JSON.stringify(profile));

      window.location.href = 'citizen/home.html';
    });
  }

});

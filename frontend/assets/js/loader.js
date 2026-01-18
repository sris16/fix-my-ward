// assets/js/loader.js

window.addEventListener('load', () => {
  const loader = document.getElementById('app-loader');

  if (!loader) return;

  setTimeout(() => {
    loader.style.opacity = '0';
    loader.style.pointerEvents = 'none';

    setTimeout(() => {
      loader.style.display = 'none';
    }, 300);
  }, 1500); // 1.5 seconds
});

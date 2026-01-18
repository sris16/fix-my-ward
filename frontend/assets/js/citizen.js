// assets/js/citizen.js

document.addEventListener('DOMContentLoaded', () => {
  // ======================================
  // 1. Check citizen profile
  // ======================================
  const storedProfile = localStorage.getItem('fmw_citizen_profile');

  if (!storedProfile) {
    alert('Please register as a citizen first.');
    window.location.href = '../index.html';
    return;
  }

  const profile = JSON.parse(storedProfile);

  // ======================================
  // 2. Update header & greeting
  // ======================================
  const badge = document.getElementById('citizen-badge');
  const nameDisplay = document.getElementById('citizen-name-display');
  const emailDisplay = document.getElementById('citizen-email-display');
  const greetingText = document.getElementById('greeting-text');

  if (badge && nameDisplay && emailDisplay) {
    badge.classList.remove('hidden');
    nameDisplay.textContent = profile.name;
    emailDisplay.textContent = profile.email;
  }

  if (greetingText) {
    greetingText.textContent = `Hello ${profile.name}, report an issue in your area`;
  }

  // ======================================
  // 3. Photo upload (max 4 + preview)
  // ======================================
  const photoInput = document.getElementById('issue-photo');
  const photoFileName = document.getElementById('photo-file-name');
  const photoPreview = document.getElementById('photo-preview');

  if (photoInput && photoFileName && photoPreview) {
    photoInput.addEventListener('change', () => {
      const files = Array.from(photoInput.files || []);

      if (files.length > 4) {
        alert('You can upload a maximum of 4 images.');
        photoInput.value = '';
        photoPreview.innerHTML = '';
        photoFileName.textContent = '';
        return;
      }

      photoFileName.textContent = `${files.length} image(s) selected`;
      photoPreview.innerHTML = '';

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement('img');
          img.src = e.target.result;
          img.className =
            'w-full h-16 object-cover rounded-lg border border-slate-700';
          photoPreview.appendChild(img);
        };
        reader.readAsDataURL(file);
      });
    });
  }

  // ======================================
  // 4. Map & geolocation
  // ======================================
  const btnUseLocation = document.getElementById('btn-use-location');
  const latInput = document.getElementById('issue-lat');
  const lngInput = document.getElementById('issue-lng');
  const locationTextInput = document.getElementById('issue-location-text');
  const mapContainer = document.getElementById('issue-map');

  let map, marker;

  const DEFAULT_LAT = 11.0183;
  const DEFAULT_LNG = 76.9725;

  function initMap(lat = DEFAULT_LAT, lng = DEFAULT_LNG) {
    if (!mapContainer) return;

    if (!map) {
      map = L.map('issue-map').setView([lat, lng], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      marker = L.marker([lat, lng], { draggable: true }).addTo(map);

      marker.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        updateLocation(pos.lat, pos.lng);
      });

      map.on('click', (e) => {
        updateLocation(e.latlng.lat, e.latlng.lng);
        marker.setLatLng(e.latlng);
      });
    } else {
      map.setView([lat, lng], 17);
      marker.setLatLng([lat, lng]);
    }

    updateLocation(lat, lng);
  }

  function updateLocation(lat, lng) {
    if (latInput) latInput.value = lat.toFixed(6);
    if (lngInput) lngInput.value = lng.toFixed(6);
    if (locationTextInput && !locationTextInput.value) {
      locationTextInput.value = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
    }
  }

  if (mapContainer) {
    initMap();
  }

  if (btnUseLocation) {
    btnUseLocation.addEventListener('click', () => {
      if (!navigator.geolocation) {
        alert('Geolocation not supported.');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          initMap(position.coords.latitude, position.coords.longitude);
        },
        () => {
          alert('Unable to fetch location. Adjust manually on map.');
        },
        { enableHighAccuracy: true }
      );
    });
  }

  // ======================================
  // 5. Submit issue (STORE IMAGES)
  // ======================================
  const issueForm = document.getElementById('issue-form');

  if (issueForm) {
    issueForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = document.getElementById('issue-title').value.trim();
      const category = document.getElementById('issue-category').value;
      const description = document.getElementById('issue-description').value.trim();
      const locationText = locationTextInput.value.trim();

      if (!title || !category || !description) {
        alert('Please fill all required fields.');
        return;
      }

      const files = Array.from(photoInput?.files || []);

      // Convert images to Base64
      const photoBase64List = [];
      for (const file of files) {
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
        photoBase64List.push(base64);
      }

      const issueData = {
        id: Date.now(),
        citizen: profile,
        title,
        category,
        description,
        locationText,
        lat: latInput.value,
        lng: lngInput.value,
        photos: photoBase64List, // 👈 images stored here
        status: 'Not Completed',
        createdAt: new Date().toISOString(),
      };

      const existing = JSON.parse(localStorage.getItem('fmw_issues')) || [];
      existing.push(issueData);
      localStorage.setItem('fmw_issues', JSON.stringify(existing));

      // Redirect to track page
      window.location.href = 'track.html';
    });
  }
});

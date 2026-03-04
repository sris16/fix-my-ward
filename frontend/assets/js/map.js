// assets/js/map.js

document.addEventListener("DOMContentLoaded", () => {

    const mapContainer = document.getElementById("issue-map");
    if (!mapContainer) return;

    // Global shared state
    window.fmwMapState = {
        selectedLat: null,
        selectedLng: null
    };

    const latInput = document.getElementById("issue-lat");
    const lngInput = document.getElementById("issue-lng");

    const map = L.map("issue-map").setView([11.0168, 76.9558], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    let marker = null;

    function updateLocation(lat, lng) {
        window.fmwMapState.selectedLat = lat;
        window.fmwMapState.selectedLng = lng;

        if (latInput) latInput.value = lat.toFixed(6);
        if (lngInput) lngInput.value = lng.toFixed(6);
    }

    map.on("click", (e) => {
        const { lat, lng } = e.latlng;

        if (marker) {
            marker.setLatLng([lat, lng]);
        } else {
            marker = L.marker([lat, lng], { draggable: true }).addTo(map);
            marker.on("dragend", (event) => {
                const pos = event.target.getLatLng();
                updateLocation(pos.lat, pos.lng);
            });
        }

        updateLocation(lat, lng);
    });

    /* ===============================
       Use Current Location
    =============================== */

    const useLocationBtn = document.getElementById("btn-use-location");

    if (useLocationBtn) {
        useLocationBtn.addEventListener("click", () => {

            if (!navigator.geolocation) {
                alert("Geolocation not supported.");
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    map.setView([lat, lng], 16);

                    if (marker) {
                        marker.setLatLng([lat, lng]);
                    } else {
                        marker = L.marker([lat, lng], { draggable: true }).addTo(map);
                    }

                    updateLocation(lat, lng);
                },
                () => {
                    alert("Unable to fetch your location.");
                }
            );
        });
    }

    /* ===============================
       Fullscreen Map
    =============================== */

    const fullscreenBtn = document.getElementById("btn-fullscreen-map");
    const closeBtn = document.getElementById("btn-close-fullscreen");
    const overlay = document.getElementById("map-fullscreen-overlay");

    let fullscreenMap = null;

    if (fullscreenBtn && overlay) {
        fullscreenBtn.addEventListener("click", () => {
            overlay.classList.remove("hidden");

            setTimeout(() => {
                fullscreenMap = L.map("issue-map-fullscreen").setView(
                    map.getCenter(),
                    map.getZoom()
                );

                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    attribution: "&copy; OpenStreetMap contributors"
                }).addTo(fullscreenMap);

                fullscreenMap.invalidateSize();
            }, 100);
        });
    }

    if (closeBtn && overlay) {
        closeBtn.addEventListener("click", () => {
            overlay.classList.add("hidden");

            if (fullscreenMap) {
                fullscreenMap.remove();
                fullscreenMap = null;
            }
        });
    }

    // Fix map size after loader
    setTimeout(() => {
        map.invalidateSize();
    }, 500);

});

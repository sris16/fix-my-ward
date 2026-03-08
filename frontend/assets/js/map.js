// assets/js/map.js

document.addEventListener("DOMContentLoaded", () => {

    /* ======================================================
       REPORT PAGE MAP (report.html)
    ====================================================== */

    const reportMapContainer = document.getElementById("issue-map");

    if (reportMapContainer) {

        window.fmwMapState = {
            selectedLat: null,
            selectedLng: null
        };

        const latInput = document.getElementById("issue-lat");
        const lngInput = document.getElementById("issue-lng");

        const map = L.map("issue-map").setView([11.0168, 76.9558], 13);

        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            { attribution: "&copy; OpenStreetMap contributors" }
        ).addTo(map);

        // FIX FOR FLEX / TAILWIND LAYOUT
        setTimeout(() => {
            map.invalidateSize();
        }, 300);

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
           USE CURRENT LOCATION
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
           FULLSCREEN MAP
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

                    L.tileLayer(
                        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                        { attribution: "&copy; OpenStreetMap contributors" }
                    ).addTo(fullscreenMap);

                    fullscreenMap.invalidateSize();

                }, 200);

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

    }



    /* ======================================================
       PUBLIC ISSUE MAP (map.html)
    ====================================================== */

    const publicMapContainer = document.getElementById("public-issues-map");

    if (publicMapContainer) {

        const profile = JSON.parse(localStorage.getItem("fmw_citizen_profile"));

        if (!profile) return;

        const userMobile = profile.mobile;

        navigator.geolocation.getCurrentPosition(

            (position) => {

                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                const map = L.map("public-issues-map").setView([userLat, userLng], 14);

                L.tileLayer(
                    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                    { attribution: "&copy; OpenStreetMap contributors" }
                ).addTo(map);

                L.marker([userLat, userLng])
                    .addTo(map)
                    .bindPopup("📍 You are here")
                    .openPopup();

                let issues = JSON.parse(localStorage.getItem("fmw_issues")) || [];

                const markerLayer = L.layerGroup().addTo(map);

                issues.forEach(issue => {

                    const marker = L.marker([issue.lat, issue.lng]).addTo(markerLayer);

                    marker.bindPopup(`
                        <b>${issue.title}</b><br>
                        ${issue.description}<br>
                        👍 ${issue.upvotes?.length || 0}
                    `);

                });

            }

        );

    }

});
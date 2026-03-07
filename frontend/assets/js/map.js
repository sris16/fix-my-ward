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

        const useLocationBtn = document.getElementById("btn-use-location");

        if (useLocationBtn) {

            useLocationBtn.addEventListener("click", () => {

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

                    }

                );

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
                const now = Date.now();

                issues = issues.filter(issue => {

                    if (!issue.upvotes) issue.upvotes = [];

                    if (issue.status === "Resolved") {

                        const updated = new Date(issue.updatedAt).getTime();
                        const diffHours = (now - updated) / (1000 * 60 * 60);

                        if (diffHours > 48) return false;
                    }

                    const distance = getDistance(
                        userLat,
                        userLng,
                        issue.lat,
                        issue.lng
                    );

                    issue.distance = distance;

                    return distance <= 5;

                });



                const markerLayer = L.layerGroup().addTo(map);
                const heatPoints = [];

                issues.forEach(issue => {

                    const icon = getCategoryIcon(issue.category);

                    const marker = L.marker(
                        [issue.lat, issue.lng],
                        { icon }
                    ).addTo(markerLayer);


                    const photoPreview =
                        issue.photos && issue.photos.length
                            ? `<img src="${issue.photos[0]}" style="width:100%;border-radius:6px;margin-top:6px;">`
                            : "";

                    const voted = issue.upvotes.includes(userMobile);


                    marker.bindPopup(`
                        <div style="width:220px">

                        <strong>${issue.title}</strong>

                        <div style="font-size:11px;color:gray;margin-top:2px;">
                        ${issue.category} • ${issue.distance.toFixed(2)} km away
                        </div>

                        <p style="font-size:12px;margin-top:6px;">
                        ${issue.description}
                        </p>

                        ${photoPreview}

                        <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;">

                        <span style="font-size:12px;">
                        👍 ${issue.upvotes.length}
                        </span>

                        <button
                        onclick="toggleMapVote('${issue.id}')"
                        style="
                        background:${voted ? '#ef4444' : '#10b981'};
                        color:white;
                        border:none;
                        padding:4px 8px;
                        font-size:11px;
                        border-radius:4px;
                        cursor:pointer;
                        ">
                        ${voted ? "Remove Vote" : "Upvote"}
                        </button>

                        </div>

                        </div>
                    `);

                    const weight = issue.upvotes.length || 1;

                    heatPoints.push([
                        issue.lat,
                        issue.lng,
                        weight
                    ]);

                });

                const heatLayer = L.heatLayer(heatPoints, {
                    radius: 25,
                    blur: 20,
                    maxZoom: 17
                });

                const btnMarkers = document.getElementById("btn-show-markers");
                const btnHeatmap = document.getElementById("btn-show-heatmap");

                if (btnMarkers && btnHeatmap) {

                    btnMarkers.onclick = () => {

                        if (map.hasLayer(heatLayer))
                            map.removeLayer(heatLayer);

                        map.addLayer(markerLayer);

                    };

                    btnHeatmap.onclick = () => {

                        if (map.hasLayer(markerLayer))
                            map.removeLayer(markerLayer);

                        map.addLayer(heatLayer);

                    };

                }

            }

        );

    }

});



function getDistance(lat1, lon1, lat2, lon2) {

    const R = 6371;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}



function getCategoryIcon(category) {

    let color = "green";

    if (category === "Road") color = "red";
    if (category === "Water") color = "blue";
    if (category === "Surroundings") color = "orange";

    return L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
        shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41]
    });
}



function toggleMapVote(issueId) {

    const profile = JSON.parse(localStorage.getItem("fmw_citizen_profile"));
    const userMobile = profile.mobile;

    let issues = JSON.parse(localStorage.getItem("fmw_issues")) || [];

    const issue = issues.find(i => i.id === issueId);

    if (!issue.upvotes) issue.upvotes = [];

    const index = issue.upvotes.indexOf(userMobile);

    if (index === -1) {
        issue.upvotes.push(userMobile);
    } else {
        issue.upvotes.splice(index, 1);
    }

    localStorage.setItem("fmw_issues", JSON.stringify(issues));

    location.reload();
}
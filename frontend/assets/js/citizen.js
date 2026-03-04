// assets/js/citizen.js

document.addEventListener("DOMContentLoaded", () => {

    /* ===============================
       1. PROFILE VALIDATION
    =============================== */

    const storedProfile = localStorage.getItem("fmw_citizen_profile");

    if (!storedProfile) {
        window.location.href = "../index.html";
        return;
    }

    const profile = JSON.parse(storedProfile);

    const nameDisplay = document.getElementById("citizen-name-display");
    const emailDisplay = document.getElementById("citizen-email-display");
    const greetingText = document.getElementById("greeting-text");

    if (nameDisplay) nameDisplay.textContent = profile.name;
    if (emailDisplay) emailDisplay.textContent = profile.email;
    if (greetingText) greetingText.textContent = `Hello ${profile.name}!`;

    /* ===============================
       2. CATEGORY FROM URL (V2)
    =============================== */

    const urlParams = new URLSearchParams(window.location.search);
    const selectedCategory = urlParams.get("category") || "General";

    const categoryDisplay = document.getElementById("selected-category-display");
    if (categoryDisplay) {
        categoryDisplay.textContent = selectedCategory;
    }

    /* ===============================
       3. DYNAMIC PLACEHOLDERS
    =============================== */

    const titleInput = document.getElementById("issue-title");
    const descriptionInput = document.getElementById("issue-description");

    const placeholderConfig = {
        Road: {
            title: "e.g. Large pothole near bus stop",
            description:
                "Describe the road issue. Mention traffic impact or safety risks."
        },
        Water: {
            title: "e.g. Water leakage near main pipeline",
            description:
                "Describe the water-related issue. Mention overflow, blockage or supply problem."
        },
        Surroundings: {
            title: "e.g. Streetlight not working near park",
            description:
                "Describe the surrounding issue. Mention garbage, lighting, or public safety concern."
        }
    };

    if (titleInput && descriptionInput) {
        const config =
            placeholderConfig[selectedCategory] || {
                title: "Describe the issue briefly",
                description: "Provide detailed information about the issue."
            };

        titleInput.placeholder = config.title;
        descriptionInput.placeholder = config.description;
    }

    /* ===============================
       4. PHOTO UPLOAD (MAX 4)
    =============================== */

    const photoInput = document.getElementById("issue-photo");
    const previewContainer = document.getElementById("photo-preview");

    let photoBase64Array = [];

    if (photoInput) {
        photoInput.addEventListener("change", function () {

            const files = Array.from(photoInput.files);

            if (files.length > 4) {
                alert("You can upload maximum 4 photos.");
                photoInput.value = "";
                return;
            }

            previewContainer.innerHTML = "";
            photoBase64Array = [];

            files.forEach(file => {

                const reader = new FileReader();

                reader.onload = function (e) {

                    photoBase64Array.push(e.target.result);

                    const img = document.createElement("img");
                    img.src = e.target.result;
                    img.className =
                        "w-20 h-20 object-cover rounded-lg border border-slate-700";

                    previewContainer.appendChild(img);
                };

                reader.readAsDataURL(file);
            });
        });
    }

    /* ===============================
       5. ISSUE SUBMISSION
    =============================== */

    const issueForm = document.getElementById("issue-form");

    if (issueForm) {
        issueForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const title = titleInput.value.trim();
            const description = descriptionInput.value.trim();

            let locationText = document
                .getElementById("issue-location-text")
                .value.trim();

            if (!title || !description) {
                alert("Please fill all required fields.");
                return;
            }

            const lat = window.fmwMapState?.selectedLat;
            const lng = window.fmwMapState?.selectedLng;

            if (!lat || !lng) {
                alert("Please select a location on the map.");
                return;
            }

            // Auto-fill location if empty
            if (!locationText) {
                locationText = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
            }

            const issues =
                JSON.parse(localStorage.getItem("fmw_issues")) || [];

            const newIssue = {
                id: "ISSUE-" + Date.now(),

                citizen: {
                    name: profile.name,
                    email: profile.email
                },

                title,
                category: selectedCategory,
                description,
                locationText,
                lat,
                lng,
                photos: photoBase64Array,

                status: "Pending",
                priority: "Normal",
                department: null,
                verified: false,

                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            issues.push(newIssue);
            localStorage.setItem("fmw_issues", JSON.stringify(issues));

            window.location.href = "track.html";
        });
    }

});

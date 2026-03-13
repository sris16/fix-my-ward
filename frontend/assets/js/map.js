const API = "http://localhost:5000/api";

/* =====================================================
   ISSUE MAP PAGE (Markers + Heatmap)
===================================================== */

const issueMapContainer = document.getElementById("map");

if (issueMapContainer) {

const map = L.map("map").setView([11.0168, 76.9558], 12);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
maxZoom: 19
}).addTo(map);

const markerLayer = L.layerGroup().addTo(map);

let heatPoints = [];
let heatLayer;

/* LOAD ISSUES */

async function loadIssues(){

try{

const response = await fetch(`${API}/issues`);
const issues = await response.json();

console.log("Loaded issues:", issues);

markerLayer.clearLayers();
heatPoints = [];

let bounds = [];

issues.forEach(issue => {

if(!issue.lat || !issue.lng) return;

/* CREATE MARKER */

const marker = L.marker([issue.lat, issue.lng]);

marker.bindPopup(`
<b>${issue.title}</b><br>
${issue.category}<br>
Status: ${issue.status}
`);

markerLayer.addLayer(marker);

/* ADD HEAT DATA */

heatPoints.push([issue.lat, issue.lng, 0.7]);

/* SAVE LOCATION FOR AUTO ZOOM */

bounds.push([issue.lat, issue.lng]);

});

/* CREATE HEATMAP */

createHeatmap();

/* AUTO ZOOM TO ISSUES */

if(bounds.length > 0){
map.fitBounds(bounds,{padding:[40,40]});
}

}catch(error){

console.error("Failed to load issues", error);

}

}

/* CREATE HEATMAP */

function createHeatmap(){

if(heatLayer){
map.removeLayer(heatLayer);
}

heatLayer = L.heatLayer(heatPoints,{
radius:25,
blur:20,
maxZoom:17
}).addTo(map);

}

/* TOGGLE MARKERS */

document.getElementById("toggle-markers")
?.addEventListener("click",()=>{

if(map.hasLayer(markerLayer)){
map.removeLayer(markerLayer);
}else{
map.addLayer(markerLayer);
}

});

/* TOGGLE HEATMAP */

document.getElementById("toggle-heatmap")
?.addEventListener("click",()=>{

if(map.hasLayer(heatLayer)){
map.removeLayer(heatLayer);
}else{
map.addLayer(heatLayer);
}

});

loadIssues();

}


/* =====================================================
   REPORT ISSUE PAGE (Location Picker)
===================================================== */

const reportMapContainer = document.getElementById("issue-map");

if (reportMapContainer) {

const map = L.map("issue-map").setView([11.0168, 76.9558], 13);

L.tileLayer(
"https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
{
attribution:
'© OpenStreetMap contributors © CARTO',
subdomains: "abcd",
maxZoom: 19
}
).addTo(map);

let marker;

/* MAP CLICK */

map.on("click", async function(e){

const { lat, lng } = e.latlng;

/* SET LAT LNG */

document.getElementById("issue-lat").value = lat.toFixed(6);
document.getElementById("issue-lng").value = lng.toFixed(6);

/* MARKER */

if(marker){
map.removeLayer(marker);
}

marker = L.marker([lat,lng]).addTo(map);

/* =========================
   REVERSE GEOCODING
========================= */

try{

const response = await fetch(
`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
);

const data = await response.json();

if(data.display_name){

document.getElementById("issue-location-text").value =
data.display_name;

}

}catch(error){

console.warn("Address lookup failed");

}

});

/* GPS LOCATION */

document.getElementById("btn-use-location")
?.addEventListener("click",()=>{

if(!navigator.geolocation){
alert("Geolocation not supported");
return;
}

navigator.geolocation.getCurrentPosition(
pos => {

const lat = pos.coords.latitude;
const lng = pos.coords.longitude;

document.getElementById("issue-lat").value = lat.toFixed(6);
document.getElementById("issue-lng").value = lng.toFixed(6);

map.setView([lat,lng],15);

if(marker){
map.removeLayer(marker);
}

marker = L.marker([lat,lng]).addTo(map);

},
error => {
alert("Unable to detect your location.");
},
{
enableHighAccuracy: true,
timeout: 10000,
maximumAge: 0
}
);

});

}
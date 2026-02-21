/* ================= INITIALIZE MAP ================= */
var map = L.map("map").setView([20.5937, 78.9629], 5);

/* ================= BASE MAP TYPES ================= */
var osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
osm.addTo(map);

/* ================= LAYERS ================= */
var cityLayer = L.layerGroup();
var stateLayer = L.layerGroup();
var railLayer = L.layerGroup();
var highwayLayer = L.layerGroup();
var plantLayer = L.layerGroup();
var airportLayer = L.layerGroup();
var populationLayerGroup = L.layerGroup();

/* ================= METRO CITIES ================= */
var citiesData = [];

fetch("/api/cities") //API endpoint to fetch city data
    .then(res => res.json())
    .then(data => {
        citiesData = data;
        data.forEach(c => {
            L.circle([c.lat, c.lon], {
                radius: 50000,
                color: "red",
                fillColor: "blue",
                fillOpacity: 0.4
            }).addTo(cityLayer);

            L.marker([c.lat, c.lon])
                .bindPopup(`
            <h3>${c.name}</h3>
            ${c.tagline}<br>
            <img src="${c.image}" width="250">
        `)
                .addTo(cityLayer);
        });
    });

/* ================= GEOJSON LOADER ================= */
function loadGeoJSON(url, style, targetLayer) {
    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error("Failed to load " + url);
            return res.json();
        })
        .then(data => {
            L.geoJSON(data, { style: style }).addTo(targetLayer);
        })
        .catch(err => console.error(err));
}

/* ================= INDIAN STATES, RAILWAYS, HIGHWAYS ================= */
loadGeoJSON(
    "/static/geojson/states_india.geojson",
    { color: "black", weight: 1, fillOpacity: 0.1 },
    stateLayer
);
loadGeoJSON(
    "/static/geojson/india_line.geojson",
    { color: "blue", weight: 1 },
    railLayer
);
loadGeoJSON(
    "/static/geojson/INDIA_NATIONAL_HIGHWAY.geojson",
    { color: "yellow", weight: 1 },
    highwayLayer
);

/* ================= POWER PLANTS ================= */
fetch("/api/power-plants") //API endpoint to fetch power plant data
    .then(res => res.json())
    .then(data => {
        data.forEach(p => {
            L.circle([p.lati, p.lng], {
                radius: p.capacity * 50,
                color: "red",
                fillOpacity: 0.25
            })
                .bindPopup(`Area: ${p.area}<br>Fuel: ${p.fuel}`)
                .addTo(plantLayer);
        });
    });

/* ================= AIRPORTS ================= */
fetch("/api/airports") //API endpoint to fetch airport data
    .then(res => res.json())
    .then(data => {
        data.forEach(a => {
            L.marker([a.latitude, a.longitude])
                .bindPopup(`<b>${a.airport_name}</b><br>${a.city}`)
                .addTo(airportLayer);
        });
    });

/* ================= LAYER CONTROLS ================= */
L.control.layers(
    {
        "OpenStreetMap": osm,
    },
    {
        "Metro Cities": cityLayer,
        "Indian States": stateLayer,
        "Railways": railLayer,
        "Highways": highwayLayer,
        "Power Plants": plantLayer,
        "Airports": airportLayer,
        "Population": populationLayerGroup
    }
).addTo(map);

function toggle(layer, button) {
    if (map.hasLayer(layer)) {
        map.removeLayer(layer);
        button.classList.remove("active");
    } else {
        map.addLayer(layer);
        button.classList.add("active");
    }
}

/* ================= DISTANCE MEASUREMENT VARIABLES ================= */
var distanceMode = false;
var distancePoints = [];
var distanceLine = null;
var distanceMarkers = [];

function toggleDistanceMode(btn) {
// Reset if already in distance mode
    if (distanceMode) {
        distanceMode = false;
        distancePoints = [];

        if (distanceLine) {
            map.removeLayer(distanceLine);
            distanceLine = null;
        }

        distanceMarkers.forEach(m => map.removeLayer(m));
        distanceMarkers = [];

        btn.innerHTML = "📏";
        btn.classList.remove("active");
        return;
    }

    // Activate distance mode
    distanceMode = true;
    distancePoints = [];
    btn.innerHTML = "❌";
    btn.classList.add("active");

    alert("Click two points on the map");
}

/* Haversine formula */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

map.on("click", function (e) {
    if (!distanceMode && !customMarkerMode) return; // handle only if in distance or custom marker mode

    const lat = e.latlng.lat;
    const lon = e.latlng.lng;

    // Handle distance mode
    if (distanceMode) {
        distancePoints.push([lat, lon]);
        const marker = L.marker([lat, lon]).addTo(map);
        distanceMarkers.push(marker);

        if (distancePoints.length === 2) {
            distanceMode = false;

            const p1 = distancePoints[0];
            const p2 = distancePoints[1];

            const dist = calculateDistance(
                p1[0], p1[1],
                p2[0], p2[1]
            ).toFixed(2);

            distanceLine = L.polyline([p1, p2], {
                color: "red",
                weight: 3,
                dashArray: "5,5"
            }).addTo(map);

            distanceLine.bindPopup(`📏 Distance: <b>${dist} km</b>`).openPopup();
        }
        return;
    }

    // Handle custom marker mode
    if (customMarkerMode) {
        const marker = L.marker([lat, lon])
            .bindPopup(`
                <b>Custom Marker</b><br>
                Lat: ${lat.toFixed(4)}<br>
                Lon: ${lon.toFixed(4)}
            `)
            .addTo(map)
            .openPopup();

        customMarkers.push(marker); // Track this marker
        return;
    }
});

/* ================= LAT-LNG ON CLICK ================= */
map.on("click", function (e) {
    if (!distanceMode && !customMarkerMode) {
        const lat = e.latlng.lat.toFixed(6);
        const lng = e.latlng.lng.toFixed(6);

        L.popup()
            .setLatLng(e.latlng)
            .setContent(`
                <b>Coordinates</b><br>
                Latitude: ${lat}<br>
                Longitude: ${lng}
            `)
            .openOn(map);
    }
});

/* ================= POPULATION DENSITY TOGGLE ================= */
function togglePopulationDensity(btn) {
    if (!populationLoaded) {
        alert("Population data is still loading. Please wait a moment and try again.");
        return;
    }

    if (map.hasLayer(populationLayerGroup)) {
        map.removeLayer(populationLayerGroup);
        btn.classList.remove("active");
    } else {
        map.addLayer(populationLayerGroup);
        btn.classList.add("active");
    }
}

/* ================= POPULATION CHOROPLETH WITH NAME MAPPING ================= */
// Color scale
function getColor(pop) {
    return  pop > 200000000 ? '#800026' :
            pop > 150000000 ? '#BD0026' :
            pop > 100000000 ? '#E31A1C' :
            pop > 50000000 ? '#FC4E2A' :
            pop > 20000000 ? '#FD8D3C' :
            pop > 10000000 ? '#FEB24C' :
            pop > 5000000 ? '#FFEDA0' :
                            '#FED976';
}
var populationLoaded = false;

// Manual name mapping for mismatched state names between population and boundary datasets
const stateNameMapping = {
    "andaman & nicobar": "andaman and nicobar islands",
    "andaman and nicobar": "andaman and nicobar islands",
    "dadra & nagar haveli": "dadra and nagar haveli and daman and diu",
    "dadra and nagar haveli": "dadra and nagar haveli and daman and diu",
    "daman & diu": "dadra and nagar haveli and daman and diu",
    "daman and diu": "dadra and nagar haveli and daman and diu",
    "nct of delhi": "delhi",
    "national capital territory of delhi": "delhi",
};

// Normalize state names
function normalizeStateName(name) {
    if (!name) return '';
    let normalized = name.trim()
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/\s+/g, ' ');

    // Check if there's a manual mapping
    if (stateNameMapping[normalized]) {
        normalized = stateNameMapping[normalized];
    }

    return normalized;
}

// Store population data
const populationData = {};

fetch("/static/geojson/india_states_ut_population_leaflet.geojson") // API endpoint to fetch population data in GeoJSON format
    .then(res => res.json())
    .then(popData => {

        popData.features.forEach(f => {
            const stateName = f.properties.name;
            const normalizedName = normalizeStateName(stateName);
            populationData[normalizedName] = {
                population: f.properties.population_2024,
                originalName: stateName
            };
        });

        fetch("/static/geojson/states_india.geojson") // API endpoint to fetch state boundaries in GeoJSON format
            .then(res => res.json())
            .then(stateData => {

                // Log state names from boundary data for debugging
                stateData.features.forEach(f => {
                    const props = f.properties;
                    const stateName = props.state || props.name || props.NAME || props.st_nm || props.State;
                });

                const populationLayer = L.geoJSON(stateData, {
                    style: function (feature) {
    
                        const props = feature.properties;
                        const stateName = props.state || props.name || props.NAME || props.st_nm || props.State;
                        const normalizedName = normalizeStateName(stateName);
                        const popInfo = populationData[normalizedName];
                        const pop = popInfo ? popInfo.population : 0;


                        return {
                            fillColor: getColor(pop),
                            weight: 2,
                            color: "white",
                            fillOpacity: 0.7
                        };
                    },

                    onEachFeature: function (feature, layer) {

                        const props = feature.properties;
                        const stateName = props.state || props.name || props.NAME || props.st_nm || props.State;
                        const normalizedName = normalizeStateName(stateName);
            
                        const popInfo = populationData[normalizedName];
                        const pop = popInfo ? popInfo.population : 0;
                        const displayName = popInfo ? popInfo.originalName : (stateName || 'Unknown');

                        layer.bindPopup(`
                        <b>${displayName}</b><br>
                        Population (2024): <b>${pop > 0 ? pop.toLocaleString() : 'Data not available'}</b>
                    `);

                        layer.on({
                            mouseover: function (e) {
                                e.target.setStyle({
                                    weight: 3,
                                    color: "#000",
                                    fillOpacity: 0.9
                                });
                            },
                            mouseout: function (e) {
                                populationLayer.resetStyle(e.target);
                            }
                        });
                    }
                });
                populationLayerGroup.addLayer(populationLayer);
                populationLoaded = true;

            })
    })


/* ================= CITY SEARCH FEATURE ================= */
var searchMarker = null;

function searchCity() {
    const searchInput = document.getElementById('citySearchInput');
    const searchTerm = searchInput.value.trim().toLowerCase();

    if (!searchTerm) {
        alert("Please enter a city name to search");
        return;
    }
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm + ', India')}&limit=1`;

    fetch(geocodeUrl)
        .then(res => res.json())
        .then(data => {
            if (data && data.length > 0) {
                const result = data[0];
                const lat = parseFloat(result.lat);
                const lon = parseFloat(result.lon);

                // Remove previous search marker if exists
                if (searchMarker) {
                    map.removeLayer(searchMarker);
                }

                // Zoom to location
                map.setView([lat, lon], 12);

                // Add marker
                searchMarker = L.marker([lat, lon], {
                    icon: L.icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    })
                }).addTo(map);

                searchMarker.bindPopup(`
                    <b>${result.display_name}</b><br>
                    Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}
                `).openPopup();


            } else {
                alert(`City "${searchTerm}" not found. Please try another name.`);
            }
        })
        .catch(err => {
            console.error("Geocoding error:", err);
            alert("Error searching for city. Please try again.");
        });
}
function clearSearch() {
    const searchInput = document.getElementById('citySearchInput');
    searchInput.value = '';

    if (searchMarker) {
        map.removeLayer(searchMarker);
        searchMarker = null;
    }
}

/* ================= CENTER MAP ================= */
function centreMap() {
    map.setView([20.5937, 78.9629], 5);
}

/* ================= CUSTOM MARKER MODE ================= */
var customMarkerMode = false;
var customMarkers = []; // Track all custom markers

function tooglecustomMarker() {
    customMarkerMode = !customMarkerMode;

    const btn = event.target;

    if (customMarkerMode) {
        btn.classList.add("active");
        alert("Custom Marker Mode ON - Click anywhere on the map to add a marker");
    } else {
        btn.classList.remove("active");
        alert("Custom Marker Mode OFF");
    }
}

function clearCustomMarkers() {
    customMarkers.forEach(marker => map.removeLayer(marker));
    customMarkers = [];

}

// ================= CITY INFO FETCH ================= */

function getCityInfo() {
    const city = document.getElementById("City-info").value.trim();

    if (!city) {
        alert("Please enter a city name.");
        return;
    }

    fetch("/api/gem", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ city_name: city })
    })                                                   //API endpoint to fetch city info
    .then(response => response.json())
    .then(data => {

        if (data.error) {
            alert(data.error);
            return;
        }

        displayCityInfo(city, data);

    })
    .catch(error => {
        console.error("Error:", error);
        alert("Failed to fetch city info.");
    });
}

function displayCityInfo(city, data) {

    const content = `
        <h3>${city}</h3>
        <b>Tourist Attractions:</b><br>
        ${data.tourist_attractions}<br><br>

        <b>Local Cuisine:</b><br>
        ${data.local_cuisine}<br><br>

        <b>Cultural Significance:</b><br>
        ${data.cultural_significance}<br><br>

        <b>Best Time to Visit:</b><br>
        ${data.best_time_to_visit}
    `;

    document.getElementById("cityInfoBox").innerHTML = content;
}

function clearCityInfo() {
    document.getElementById("City-info").value = "";
    document.getElementById("cityInfoBox").innerHTML = "";
}


// Standardkoordinater för Stockholm
let LAT = 59.3293;
let LON = 18.0686;
let currentCity = "Stockholm";

// Initiera kartan
let map;
function initMap() {
    map = L.map('map').setView([LAT, LON], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    updateMapMarker();
}

// Uppdatera kartmarkör
function updateMapMarker() {
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });
    
    L.marker([LAT, LON]).addTo(map)
        .bindPopup(currentCity)
        .openPopup();
    
    map.setView([LAT, LON], 12);
}

// Funktion för att visa felmeddelande
function showError(message) {
    document.getElementById('weather-desc').textContent = message;
    document.getElementById('mood-text').textContent = 'Kunde inte hämta väderdata';
    document.getElementById('activity-text').textContent = 'Kunde inte hämta väderdata';
}

// Funktion för att hämta koordinater för en stad
async function getCityCoordinates(city) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&countrycodes=se&limit=1`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon),
                name: data[0].display_name.split(',')[0]
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching coordinates:', error);
        return null;
    }
}

// Funktion för att hämta väderdata från SMHI
async function getWeather() {
    try {
        // Visa laddningsmeddelande
        document.getElementById('weather-desc').textContent = 'Hämtar väderdata...';
        document.getElementById('mood-text').textContent = 'Hämtar rekommendationer...';
        document.getElementById('activity-text').textContent = 'Hämtar aktivitetsförslag...';

        // Hämta prognosdata från SMHI
        const response = await fetch(`https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${LON}/lat/${LAT}/data.json`);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data || !data.timeSeries || data.timeSeries.length === 0) {
            throw new Error('Ingen väderdata tillgänglig');
        }
        
        // Hitta den senaste temperaturen
        const latestTimeSeries = data.timeSeries[0];
        const temperatureParameter = latestTimeSeries.parameters.find(p => p.name === 't');
        const weatherParameter = latestTimeSeries.parameters.find(p => p.name === 'Wsymb2');
        
        if (!temperatureParameter || !weatherParameter) {
            throw new Error('Saknar temperatur- eller väderdata');
        }
        
        const temperature = temperatureParameter.values[0];
        const weatherCode = weatherParameter.values[0];
        
        // Konvertera väderkod till beskrivning
        const weatherDescription = getWeatherDescription(weatherCode);
        
        // Uppdatera UI med väderdata
        document.getElementById('city-name').textContent = currentCity;
        document.getElementById('temp').textContent = `${Math.round(temperature)}°C`;
        document.getElementById('weather-desc').textContent = weatherDescription;
        
        // Generera rekommendationer baserat på vädret
        generateRecommendations(temperature, weatherCode);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showError(`Ett fel uppstod vid hämtning av väderdata: ${error.message}`);
    }
}

// Funktion för att konvertera SMHI:s väderkoder till beskrivningar
function getWeatherDescription(code) {
    const weatherDescriptions = {
        1: 'Klart',
        2: 'Lätt molnighet',
        3: 'Halvklart',
        4: 'Molnigt',
        5: 'Mycket molnigt',
        6: 'Mulet',
        7: 'Dimma',
        8: 'Lätt regnskur',
        9: 'Regnskur',
        10: 'Kraftig regnskur',
        11: 'Åskskur',
        12: 'Lätt by av regn och snö',
        13: 'By av regn och snö',
        14: 'Kraftig by av regn och snö',
        15: 'Lätt snöby',
        16: 'Snöby',
        17: 'Kraftig snöby',
        18: 'Lätt regn',
        19: 'Regn',
        20: 'Kraftigt regn',
        21: 'Åska',
        22: 'Lätt snöblandat regn',
        23: 'Snöblandat regn',
        24: 'Kraftigt snöblandat regn',
        25: 'Lätt snöfall',
        26: 'Snöfall',
        27: 'Kraftigt snöfall'
    };
    return weatherDescriptions[code] || 'Okänt väder';
}

// Funktion för att generera rekommendationer baserat på vädret
function generateRecommendations(temperature, weatherCode) {
    let moodText = '';
    let activityText = '';
    
    // Temperatur-baserade rekommendationer
    if (temperature < 0) {
        moodText = 'Det är kallt ute, vilket kan göra en lite trött och nedstämd.';
        activityText = 'Ta en varm choklad och mysa under en filt. Kanske läsa en bra bok eller titta på en film?';
    } else if (temperature < 10) {
        moodText = 'Det är svalt men inte för kallt. Perfekt väder för att vara produktiv!';
        activityText = 'Gå ut på en promenad i naturen eller besök ett museum.';
    } else if (temperature < 20) {
        moodText = 'Det är behagligt väder som kan ge dig energi och motivation.';
        activityText = 'Utnyttja vädret genom att cykla, jogga eller ha en picknick i parken.';
    } else {
        moodText = 'Det är varmt och soligt, vilket kan ge dig en extra energiboost!';
        activityText = 'Besök en badplats, ta en glass eller ha en utomhusmiddag med vänner.';
    }
    
    // Väder-baserade rekommendationer
    if (weatherCode >= 500 && weatherCode < 600) {
        moodText += ' Regnet kan göra en lite melankolisk, men det är okej att känna så ibland.';
        activityText = 'Lyssna på lugn musik, meditera eller prova en ny hobby inomhus.';
    } else if (weatherCode >= 800 && weatherCode < 900) {
        if (weatherCode === 800) {
            moodText += ' Soligt väder kan ge dig extra energi och positivitet!';
            activityText = 'Utnyttja solen genom att träna utomhus eller umgås med vänner.';
        } else {
            moodText += ' Molnigt väder kan göra en lite mer avslappnad och reflekterande.';
            activityText = 'Perfekt väder för att skriva i en dagbok eller planera kommande projekt.';
        }
    }
    
    // Uppdatera UI med rekommendationer
    document.getElementById('mood-text').textContent = moodText;
    document.getElementById('activity-text').textContent = activityText;
}

// Hantera sökning av stad
document.getElementById('search-button').addEventListener('click', async () => {
    const cityInput = document.getElementById('city-search');
    const city = cityInput.value.trim();
    
    if (city) {
        try {
            const coordinates = await getCityCoordinates(city);
            if (coordinates) {
                LAT = coordinates.lat;
                LON = coordinates.lon;
                currentCity = coordinates.name;
                updateMapMarker();
                await getWeather(); // Vänta på att väderdata hämtas
            } else {
                showError('Kunde inte hitta staden. Försök igen.');
            }
        } catch (error) {
            console.error('Error searching for city:', error);
            showError('Ett fel uppstod vid sökning av staden. Försök igen.');
        }
    }
});

// Initiera kartan och hämta väderdata när sidan laddas
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    getWeather();
});

// Uppdatera väderdata var 30:e minut
setInterval(getWeather, 1800000); 
// Koordinater för Stockholm (ungefärlig)
const LAT = 59.3293;
const LON = 18.0686;

// Funktion för att visa felmeddelande
function showError(message) {
    document.getElementById('weather-desc').textContent = message;
    document.getElementById('mood-text').textContent = 'Kunde inte hämta väderdata';
    document.getElementById('activity-text').textContent = 'Kunde inte hämta väderdata';
}

// Funktion för att hämta väderdata från SMHI
async function getWeather() {
    try {
        // Visa laddningsmeddelande
        document.getElementById('weather-desc').textContent = 'Hämtar väderdata...';

        // Hämta prognosdata från SMHI
        const response = await fetch(`https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${LON}/lat/${LAT}/data.json`);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Hitta den senaste temperaturen
        const latestTimeSeries = data.timeSeries[0];
        const temperatureParameter = latestTimeSeries.parameters.find(p => p.name === 't');
        const temperature = temperatureParameter.values[0];
        
        // Hitta väderbeskrivningen
        const weatherParameter = latestTimeSeries.parameters.find(p => p.name === 'Wsymb2');
        const weatherCode = weatherParameter.values[0];
        
        // Konvertera väderkod till beskrivning
        const weatherDescription = getWeatherDescription(weatherCode);
        
        // Uppdatera UI med väderdata
        document.getElementById('temp').textContent = `${Math.round(temperature)}°C`;
        document.getElementById('weather-desc').textContent = weatherDescription;
        
        // Generera rekommendationer baserat på vädret
        generateRecommendations(temperature, weatherCode);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showError('Ett fel uppstod vid hämtning av väderdata. Försök igen senare.');
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
    if (weatherCode >= 8 && weatherCode <= 10) {
        moodText += ' Regnet kan göra en lite melankolisk, men det är okej att känna så ibland.';
        activityText = 'Lyssna på lugn musik, meditera eller prova en ny hobby inomhus.';
    } else if (weatherCode >= 4 && weatherCode <= 6) {
        moodText += ' Molnigt väder kan göra en lite mer avslappnad och reflekterande.';
        activityText = 'Perfekt väder för att skriva i en dagbok eller planera kommande projekt.';
    } else if (weatherCode >= 1 && weatherCode <= 3) {
        moodText += ' Soligt väder kan ge dig extra energi och positivitet!';
        activityText = 'Utnyttja solen genom att träna utomhus eller umgås med vänner.';
    }
    
    // Uppdatera UI med rekommendationer
    document.getElementById('mood-text').textContent = moodText;
    document.getElementById('activity-text').textContent = activityText;
}

// Hämta väderdata när sidan laddas
getWeather();

// Uppdatera väderdata var 30:e minut
setInterval(getWeather, 1800000); 
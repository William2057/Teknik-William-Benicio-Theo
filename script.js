// API nyckel för OpenWeatherMap (du behöver ersätta detta med din egen API nyckel)
const API_KEY = 'YOUR_API_KEY';
const CITY = 'Stockholm';

// Funktion för att hämta väderdata
async function getWeather() {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${CITY}&units=metric&appid=${API_KEY}&lang=sv`);
        const data = await response.json();
        
        // Uppdatera UI med väderdata
        document.getElementById('temp').textContent = `${Math.round(data.main.temp)}°C`;
        document.getElementById('weather-desc').textContent = data.weather[0].description;
        
        // Generera rekommendationer baserat på vädret
        generateRecommendations(data);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        document.getElementById('weather-desc').textContent = 'Kunde inte hämta väderdata';
    }
}

// Funktion för att generera rekommendationer baserat på vädret
function generateRecommendations(weatherData) {
    const temp = weatherData.main.temp;
    const weatherMain = weatherData.weather[0].main;
    const weatherDesc = weatherData.weather[0].description;
    
    let moodText = '';
    let activityText = '';
    
    // Temperatur-baserade rekommendationer
    if (temp < 0) {
        moodText = 'Det är kallt ute, vilket kan göra en lite trött och nedstämd.';
        activityText = 'Ta en varm choklad och mysa under en filt. Kanske läsa en bra bok eller titta på en film?';
    } else if (temp < 10) {
        moodText = 'Det är svalt men inte för kallt. Perfekt väder för att vara produktiv!';
        activityText = 'Gå ut på en promenad i naturen eller besök ett museum.';
    } else if (temp < 20) {
        moodText = 'Det är behagligt väder som kan ge dig energi och motivation.';
        activityText = 'Utnyttja vädret genom att cykla, jogga eller ha en picknick i parken.';
    } else {
        moodText = 'Det är varmt och soligt, vilket kan ge dig en extra energiboost!';
        activityText = 'Besök en badplats, ta en glass eller ha en utomhusmiddag med vänner.';
    }
    
    // Väder-baserade rekommendationer
    if (weatherMain === 'Rain') {
        moodText += ' Regnet kan göra en lite melankolisk, men det är okej att känna så ibland.';
        activityText = 'Lyssna på lugn musik, meditera eller prova en ny hobby inomhus.';
    } else if (weatherMain === 'Clouds') {
        moodText += ' Molnigt väder kan göra en lite mer avslappnad och reflekterande.';
        activityText = 'Perfekt väder för att skriva i en dagbok eller planera kommande projekt.';
    } else if (weatherMain === 'Clear') {
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
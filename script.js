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
    
    // Arrayer med olika rekommendationer för olika temperaturer
    const coldSuggestions = {
        moods: [
            'Det är kallt ute, vilket kan göra en lite trött och nedstämd.',
            'Kylan kan göra en lite mer introvert och reflekterande.',
            'Det kalla vädret kan göra en lite mer kreativ och fokuserad på inomhusaktiviteter.',
            'Kylan kan ge en lugn och avslappnad känsla, perfekt för att ta det lugnt.'
        ],
        activities: [
            'Ta en varm choklad och mysa under en filt. Kanske läsa en bra bok eller titta på en film?',
            'Prova att baka något gott eller laga en varm soppa.',
            'Spela ett brädspel eller pussel med familjen eller vännerna.',
            'Ta en varm bastu eller ett skönt bad.',
            'Lyssna på en podd eller ljudbok under en filt.'
        ]
    };

    const coolSuggestions = {
        moods: [
            'Det är svalt men inte för kallt. Perfekt väder för att vara produktiv!',
            'Det friska vädret kan ge dig extra energi och fokus.',
            'Svalt väder är perfekt för att vara aktiv och utforskande.',
            'Det här vädret kan göra dig mer motiverad och målmedveten.'
        ],
        activities: [
            'Gå ut på en promenad i naturen eller besök ett museum.',
            'Cykla runt i stan och upptäck nya platser.',
            'Besök en konstutställning eller ett bibliotek.',
            'Ta en fika på ett mysigt café.',
            'Gör en fotoutflykt och fånga stadsbilder.'
        ]
    };

    const mildSuggestions = {
        moods: [
            'Det är behagligt väder som kan ge dig energi och motivation.',
            'Det perfekta vädret för att vara social och aktiv.',
            'Det här vädret kan göra dig mer optimistisk och glad.',
            'Behagligt väder som ger dig balans mellan energi och avslappning.'
        ],
        activities: [
            'Utnyttja vädret genom att cykla, jogga eller ha en picknick i parken.',
            'Organisera en grillfest eller utomhusmiddag med vänner.',
            'Besök en park och läs en bok i solen.',
            'Gör en båttur eller kajakutfärd.',
            'Spela frisbee eller boule i parken.'
        ]
    };

    const warmSuggestions = {
        moods: [
            'Det är varmt och soligt, vilket kan ge dig en extra energiboost!',
            'Soligt väder kan göra dig mer social och utåtriktad.',
            'Värmen kan ge dig en känsla av frihet och glädje.',
            'Det här vädret kan göra dig mer spontan och äventyrlig.'
        ],
        activities: [
            'Besök en badplats, ta en glass eller ha en utomhusmiddag med vänner.',
            'Gör en utflykt till skärgården eller en närliggande sjö.',
            'Organisera en strandvolleybollmatch eller badminton.',
            'Ta en solbad på en gräsmatta i parken.',
            'Besök en utomhusbio eller konsert.'
        ]
    };

    // Välj slumpmässiga rekommendationer baserat på temperatur
    let suggestions;
    if (temperature < 0) {
        suggestions = coldSuggestions;
    } else if (temperature < 10) {
        suggestions = coolSuggestions;
    } else if (temperature < 20) {
        suggestions = mildSuggestions;
    } else {
        suggestions = warmSuggestions;
    }

    // Välj slumpmässiga rekommendationer
    moodText = suggestions.moods[Math.floor(Math.random() * suggestions.moods.length)];
    activityText = suggestions.activities[Math.floor(Math.random() * suggestions.activities.length)];
    
    // Väder-baserade rekommendationer
    if (weatherCode >= 8 && weatherCode <= 10) {
        const rainMoods = [
            ' Regnet kan göra en lite melankolisk, men det är okej att känna så ibland.',
            ' Regnet kan ge en lugn och reflekterande stämning.',
            ' Regnet kan göra en mer kreativ och inåtvänd.'
        ];
        const rainActivities = [
            'Lyssna på lugn musik, meditera eller prova en ny hobby inomhus.',
            'Skriv i en dagbok eller måla med akvarell.',
            'Laga en god middag och titta på en film.',
            'Spela ett instrument eller sjung i kören.'
        ];
        moodText += rainMoods[Math.floor(Math.random() * rainMoods.length)];
        activityText = rainActivities[Math.floor(Math.random() * rainActivities.length)];
    } else if (weatherCode >= 4 && weatherCode <= 6) {
        const cloudyMoods = [
            ' Molnigt väder kan göra en lite mer avslappnad och reflekterande.',
            ' Molnigt väder kan ge en balanserad och lugn känsla.',
            ' Molnigt väder är perfekt för att vara fokuserad och produktiv.'
        ];
        const cloudyActivities = [
            'Perfekt väder för att skriva i en dagbok eller planera kommande projekt.',
            'Gör en fotoutflykt och fånga stämningsfulla bilder.',
            'Besök ett museum eller konstgalleri.',
            'Läs en bok på ett mysigt café.'
        ];
        moodText += cloudyMoods[Math.floor(Math.random() * cloudyMoods.length)];
        activityText = cloudyActivities[Math.floor(Math.random() * cloudyActivities.length)];
    } else if (weatherCode >= 1 && weatherCode <= 3) {
        const sunnyMoods = [
            ' Soligt väder kan ge dig extra energi och positivitet!',
            ' Solen kan göra dig mer social och utåtriktad.',
            ' Soligt väder kan ge en känsla av frihet och möjligheter.'
        ];
        const sunnyActivities = [
            'Utnyttja solen genom att träna utomhus eller umgås med vänner.',
            'Organisera en picknick eller grillfest i parken.',
            'Gör en utflykt till skärgården eller en närliggande sjö.',
            'Spela utomhussporter eller ta en långpromenad.'
        ];
        moodText += sunnyMoods[Math.floor(Math.random() * sunnyMoods.length)];
        activityText = sunnyActivities[Math.floor(Math.random() * sunnyActivities.length)];
    }
    
    // Uppdatera UI med rekommendationer
    document.getElementById('mood-text').textContent = moodText;
    document.getElementById('activity-text').textContent = activityText;
}

// Hämta väderdata när sidan laddas
getWeather();

// Uppdatera väderdata var 30:e minut
setInterval(getWeather, 1800000); 
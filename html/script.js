let currentTemperature = 0;
let currentAirQuality = 0;
let currentTraffic = 0;
let currentHumidity = 0;
let currentPressure = 0;

// Συνάρτηση για την Ανάκτηση Δεδομένων από το API και ενημέρωση του Status
async function fetchDataFromAPI() {
    const apiStatusContainer = document.getElementById('apiStatusContainer');
    const apiStatusTooltip = document.getElementById('apiStatusTooltip');
    const lastUpdateElement = document.getElementById('lastUpdate');
    
    try {
        const startTime = performance.now();  // Καταγραφή χρόνου εκκίνησης
        const response = await fetch('https://drone-city.onrender.com/data');  // Βάλε το σωστό URL του API
        const endTime = performance.now();    // Καταγραφή χρόνου ολοκλήρωσης

        const responseTime = (endTime - startTime).toFixed(2); // Χρόνος απόκρισης σε ms

        // Έλεγχος για κωδικό κατάστασης (status code)
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        // Επιπλέον έλεγχος για την εγκυρότητα των δεδομένων
        if (!data.temperature || !data.airQuality || !data.traffic) {
            throw new Error('Το API δεν επιστρέφει έγκυρα δεδομένα.');
        }

        // Ενημέρωση των δεδομένων στην ιστοσελίδα
        document.getElementById('temperature').innerText = `Θερμοκρασία: ${data.temperature}°C`;
        document.getElementById('airQuality').innerText = `Ποιότητα Αέρα: Δείκτης ${data.airQuality}`;
        document.getElementById('traffic').innerText = `Κίνηση: ${data.traffic}`;
        document.getElementById('humidity').innerText = `Υγρασία: ${data.humidity}%`;
        document.getElementById('pressure').innerText = `Πίεση: ${data.pressure} hPa`;

        // Ενημέρωση του API Status και του χρόνου ανανέωσης
        apiStatusContainer.classList.remove('api-error');
        apiStatusTooltip.innerText = `API Status: Active\nΧρόνος Απόκρισης: ${responseTime} ms`;
        
        const now = new Date();
        lastUpdateElement.innerText = `Τελευταία ανανέωση: ${now.toLocaleString()}`;

        // Log μηνύματα για debugging
        console.log('Δεδομένα που ελήφθησαν:', data);

    } catch (error) {
        console.error('Σφάλμα στην ανάκτηση των δεδομένων:', error.message);
        
        // Ενημέρωση του API Status σε κόκκινο και εμφάνιση του μηνύματος σφάλματος
        apiStatusContainer.classList.add('api-error');
        apiStatusTooltip.innerText = `Σφάλμα: ${error.message}`;
        showModal(`Σφάλμα: ${error.message}`);
    }
}

// Επανάληψη της ανάκτησης δεδομένων κάθε 5 δευτερόλεπτα
setInterval(fetchDataFromAPI, 5000);

// Κάνε κλήση στο API αμέσως μόλις φορτώσει η σελίδα
fetchDataFromAPI();

// Συνάρτηση για εμφάνιση ειδοποιήσεων στο modal
function showModal(message) {
    const modal = document.getElementById('alertModal');
    document.getElementById('alertMessage').innerText = message;
    modal.style.display = 'block';
}

// Συνάρτηση για κλείσιμο του modal παραθύρου
function closeModal() {
    document.getElementById('alertModal').style.display = 'none';
}

// Αρχικοποίηση χάρτη
function initMap() {
    var xanthi = { lat: 41.1415, lng: 24.8830 };
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: xanthi
    });
    var marker = new google.maps.Marker({
        position: xanthi,
        map: map
    });
}

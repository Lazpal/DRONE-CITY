let currentTemperature = 0;
let currentAirQuality = 0;
let currentTraffic = 0;
let currentHumidity = 0;
let currentPressure = 0;

// Συνάρτηση για την Ανάκτηση Δεδομένων από το API
async function fetchDataFromAPI() {
    try {
        const response = await fetch('https://drone-city.onrender.com/data');  // Βάλε το σωστό URL του API
        if (!response.ok) {
            throw new Error('Σφάλμα στην επικοινωνία με το API');
        }
        
        const data = await response.json();

        // Ενημέρωση των δεδομένων στην ιστοσελίδα
        document.getElementById('temperature').innerText = `Θερμοκρασία: ${data.temperature}°C`;
        document.getElementById('airQuality').innerText = `Ποιότητα Αέρα: Δείκτης ${data.airQuality}`;
        document.getElementById('traffic').innerText = `Κίνηση: ${data.traffic}`;
        
        // Ενημέρωση περισσότερων δεδομένων (π.χ., υγρασία και πίεση)
        document.getElementById('humidity').innerText = `Υγρασία: ${data.humidity}%`;
        document.getElementById('pressure').innerText = `Πίεση: ${data.pressure} hPa`;

        // Έλεγχος για ειδοποιήσεις
        handleNotifications(data);

        // Log μηνύματα για debugging
        console.log('Δεδομένα που ελήφθησαν:', data);
        
    } catch (error) {
        console.error('Σφάλμα στην ανάκτηση των δεδομένων:', error);
        showModal('Σφάλμα στην ανάκτηση των δεδομένων. Παρακαλώ δοκιμάστε ξανά αργότερα.');
    }
}

// Έλεγχος και Αποστολή Ειδοποιήσεων στον χρήστη
function handleNotifications(data) {
    if (data.temperature > 35) sendNotification("Προειδοποίηση Θερμοκρασίας", `Η θερμοκρασία είναι ${data.temperature}°C!`);
    if (data.airQuality > 3) sendNotification("Προειδοποίηση Ποιότητας Αέρα", `Η ποιότητα αέρα είναι χαμηλή: Δείκτης ${data.airQuality}`);
    if (data.traffic > 80) sendNotification("Προειδοποίηση Κίνησης", `Υψηλή κίνηση: ${data.traffic}`);
}

// Επανάληψη της ανάκτησης δεδομένων κάθε 5 δευτερόλεπτα
setInterval(fetchDataFromAPI, 5000);

// Google Maps API για να δείξουμε τη θέση της Ξάνθης
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

// Ενεργοποίηση Dark Mode κατά την αρχική φόρτωση
function loadDarkModePreference() {
    const darkModeEnabled = localStorage.getItem('darkModeEnabled') === 'true';
    const darkModeSwitch = document.getElementById('darkModeSwitch');
    if (darkModeEnabled) {
        document.body.classList.add('dark-mode');
        darkModeSwitch.checked = true;
    } else {
        document.body.classList.remove('dark-mode');
        darkModeSwitch.checked = false;
    }
}

function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkModeEnabled', isDarkMode.toString());
}

document.getElementById('darkModeSwitch').addEventListener('change', toggleDarkMode);

// Αποστολή ειδοποιήσεων στον Browser
function sendNotification(title, body) {
    if (Notification.permission === "granted") {
        new Notification(title, { body });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification(title, { body });
            }
        });
    }
}

// Συνάρτηση για προβολή της σελίδας στατιστικών
function openStatsPage() {
    window.location.href = "stats.html"; // Προβολή της νέας σελίδας
}

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

// Αρχικοποίηση χάρτη και dark mode προτίμησης
initMap();
loadDarkModePreference();

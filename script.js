let currentTemperature = 0;
let currentAQI = 0;
let currentvoc = 0;
let currentCO2 = 0;
let currentTraffic = 0;
let currentHumidity = 0;
let currentPressure = 0;

let modalLock = false;  // Κλείδωμα για το modal που δεν θα επανεμφανιστεί για 3 λεπτά
let fireModalShown = false;  // Κλείδωμα για το modal φωτιάς
const alertSound = document.getElementById('alertSound');  // Προσθήκη του ηχητικού alert

// Ελέγχει αν η συσκευή είναι κινητή
        function redirectToMobile() {
            const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            if (isMobile) {
                const h1Element = document.querySelector("h2");
                // Αλλάζουμε το κείμενο του
                // Ανακατεύθυνση στη σελίδα mobile.html
                window.location.href = "/mobile.html";
              
            }
        }

        // Καλεί τη συνάρτηση μόλις φορτώσει η σελίδα
        window.onload = redirectToMobile;

// Συνάρτηση για την Ανάκτηση Δεδομένων από το API και ενημέρωση του Status
async function fetchDataFromAPI() {
    const apiStatusContainer = document.getElementById('apiStatusContainer');
    const apiStatusTooltip = document.getElementById('apiStatusTooltip');
    const lastUpdateElement = document.getElementById('lastUpdate');
    const fireWarningBox = document.getElementById('fireWarningBox');

    let startTime = performance.now();

    try {
        const response = await fetch('https://drone-city-api.glitch.me/data');  // Βάλε το σωστό URL του API
        const endTime = performance.now();
        const responseTime = (endTime - startTime).toFixed(2);

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        // Ενημέρωση των δεδομένων στην ιστοσελίδα
        updateData('temperature', data.temperature, 40);
        updateData('aqi', data.aqi, 100);
        updateData('voc', data.voc, 500);
        updateData('eco2', data.co2, 1000);
        updateData('traffic', data.traffic, 80);
        updateData('humidity', data.humidity, 70);
        updateData('pressure', data.pressure, 1015);

        // Προσθήκη του arduino_status στο tooltip
        const arduinoStatus = data.arduino_status || 'Unknown';
        apiStatusContainer.classList.remove('api-error');
        apiStatusTooltip.innerText = `API Status: Active\nΧρόνος Απόκρισης: ${responseTime} ms\nArduino Status: ${arduinoStatus}`;

        const now = new Date();
        lastUpdateElement.innerText = `Τελευταία ανανέωση: ${now.toLocaleString()}`;

        // Έλεγχος για ανίχνευση φωτιάς
        if (data.Detect_Fire === "true") {
            fireWarningBox.style.display = "block";  // Εμφάνιση του κουτιού προειδοποίησης
            if (!fireModalShown) {
                showFireModal();  // Εμφάνιση του κόκκινου modal φωτιάς
            }
        } else {
            fireWarningBox.style.display = "none";  // Απόκρυψη του κουτιού αν δεν ανιχνεύεται φωτιά
        }

    } catch (error) {
        const endTime = performance.now();
        const responseTime = (endTime - startTime).toFixed(2);

        console.error('Σφάλμα στην ανάκτηση των δεδομένων:', error.message);

        apiStatusContainer.classList.add('api-error');
        apiStatusTooltip.innerText = `Σφάλμα: ${error.message}\nΧρόνος Απόκρισης: ${responseTime} ms\nArduino Status: Unknown`;
        showModal(`Σφάλμα: ${error.message}`);
    }
}

// Συνάρτηση για την ενημέρωση των δεδομένων και τον έλεγχο για αναβόσβησμα
function updateData(elementId, value, threshold) {
    const element = document.getElementById(elementId);
    element.innerHTML = `<i class="${getIconClass(elementId)}"></i> ${capitalizeFirstLetter(elementId)}: ${value}`;

    if (value > threshold) {
        element.classList.add('blink');  // Προσθήκη animation αν ξεπεράσει το όριο
    } else {
        element.classList.remove('blink');
    }
}

// Συνάρτηση για να επιστρέψει το κατάλληλο εικονίδιο για κάθε στοιχείο
function getIconClass(elementId) {
    switch (elementId) {
        case 'temperature':
            return 'fas fa-thermometer-half';
        case 'aqi':
            return 'fas fa-cloud';
        case 'voc':
            return 'fas fa-wind';
        case 'eco2':
            return 'fas fa-smog';
        case 'traffic':
            return 'fas fa-car';
        case 'humidity':
            return 'fas fa-tint';
        case 'pressure':
            return 'fas fa-tachometer-alt';
        default:
            return '';
    }
}

// Συνάρτηση για να κεφαλαιοποιήσει το πρώτο γράμμα μιας λέξης
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Συνάρτηση για εμφάνιση ειδοποιήσεων στο modal
function showModal(message) {
    const modal = document.getElementById('alertModal');
    document.getElementById('alertMessage').innerText = message;
    modal.style.display = 'block';

    // Παίζουμε τον ήχο όταν εμφανίζεται το modal

}

// Συνάρτηση για κλείσιμο του modal παραθύρου
function closeModal() {
    document.getElementById('alertModal').style.display = 'none';
}

// Συνάρτηση για την εμφάνιση του κόκκινου modal φωτιάς
function showFireModal() {
    const fireModal = document.getElementById('fireAlertModal');
    const fireModalContent = fireModal.querySelector('.modal-content');
    fireModal.style.display = 'block';
    fireModalContent.style.transform = 'scale(0.7)';
    fireModalContent.style.opacity = '0';

    // Παίζουμε τον ήχο όταν εμφανιστεί το modal φωτιάς
  

    setTimeout(() => {
        fireModalContent.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
        fireModalContent.style.transform = 'scale(1)';
        fireModalContent.style.opacity = '1';
    }, 10);

    fireModalShown = true;  // Κλείδωμα για να μην εμφανιστεί ξανά το modal φωτιάς
}

// Συνάρτηση για κλείσιμο του κόκκινου modal φωτιάς
function closeFireModal() {
    const fireModal = document.getElementById('fireAlertModal');
    fireModal.style.display = 'none';
    fireModalShown = false;  // Επαναφορά όταν το modal κλείσει
}

// Επανάληψη της ανάκτησης δεδομένων κάθε 2 δευτερόλεπτα
setInterval(fetchDataFromAPI, 2000);

// Κάνε κλήση στο API αμέσως μόλις φορτώσει η σελίδα
fetchDataFromAPI();

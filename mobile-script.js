let currentTemperature = 0;
let currentAQI = 0;
let currentVOC = 0;
let currentco2 = 0;
let currentTraffic = 0;
let currentHumidity = 0;
let currentPressure = 0;

let cachedData = null; // Cache για τα δεδομένα του API
let lastFetchTime = 0; // Χρόνος της τελευταίας επιτυχημένης κλήσης
let modalShown = false; // Κλείδωμα για την αποτροπή της επανεμφάνισης του modal
let modalLock = false; // Κλείδωμα για το modal που δεν θα επανεμφανιστεί για 3 λεπτά
let fireModalShown = false; // Κλείδωμα για το modal φωτιάς ώστε να εμφανιστεί μόνο μία φορά

async function fetchDataFromAPI() {
  const now = Date.now();

  // Αν τα δεδομένα είναι σχετικά φρέσκα (π.χ. κάτω από 30 δευτερόλεπτα), χρησιμοποιούμε τα cache δεδομένα
  if (cachedData && now - lastFetchTime < 1000) {
    console.log("Χρήση cache δεδομένων");
    updateUIWithData(cachedData);
    return;
  }

  let alerts = [];
  let startTime = performance.now();
  const apiStatusContainer = document.getElementById("apiStatusContainer");
  const apiStatusTooltip = document.getElementById("apiStatusTooltip");
  const lastUpdateElement = document.getElementById("lastUpdate");
  const fireWarningBox = document.getElementById("fireWarningBox");

  try {
    const response = await fetch("https://drone-city-api.glitch.me/data");
    let endTime = performance.now();
    let responseTime = (endTime - startTime).toFixed(2);

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();

    // Ενημέρωση των δεδομένων και αποθήκευση τους στο cache
    cachedData = data;
    lastFetchTime = now;

    updateUIWithData(data);

    // Ενημέρωση του API Status tooltip
    const arduinoStatus = data.arduino_status || "Unknown";
    apiStatusContainer.classList.remove("api-error");
    apiStatusTooltip.innerText = `API Status: Active\nΧρόνος Απόκρισης: ${responseTime} ms\nArduino Status: ${arduinoStatus}`;

    // Ενημέρωση του χρόνου ανανέωσης
    lastUpdateElement.innerText = `Τελευταία ανανέωση: ${new Date().toLocaleString()}`;

    
    if (arduinoStatus == "OK") {
      const element = document.querySelector("#lastUpdate");
      // Αλλάζουμε το χρώμα του κειμένου
      element.style.color = "#aaaaaa"; // Αλλάζει το χρώμα σε μπλε
    }
    const elementtooltip = document.querySelector(".mobile-tooltip-container");
    // Αλλάζουμε το χρώμα του κειμένου
    elementtooltip.style.background = "#2ea44f"; // Αλλάζει το χρώμα σε μπλε}

    const h2Element = document.querySelector("h2");

    // Αλλάζουμε το κείμενο του
    h2Element.textContent = "Δεδομένα σε Πραγματικό Χρόνο!"; // Ενημερώνει μόνο το κείμενο
    // Αλλάζουμε το χρώμα και το μέγεθος του
    h2Element.style.color = "white";

    // Έλεγχος αν υπάρχουν προειδοποιήσεις και αν το modal δεν είναι κλειδωμένο
    if (alerts.length > 0 && !modalLock) {
      showModal(alerts.join("\n"));
    }

    // Έλεγχος για ανίχνευση φωτιάς
    if (data.Detect_Fire === "true") {
      fireWarningBox.style.display = "block"; // Εμφάνιση του κουτιού προειδοποίησης
      if (!fireModalShown) {
        showFireModal(); // Εμφάνιση του κόκκινου modal φωτιάς
      }
    } else {
      fireWarningBox.style.display = "none"; // Απόκρυψη του κουτιού αν δεν ανιχνεύεται φωτιά
    }
  } catch (error) {
    let endTime = performance.now();
    let responseTime = (endTime - startTime).toFixed(2);
    console.error("Σφάλμα στην ανάκτηση των δεδομένων:", error.message);

    apiStatusContainer.classList.add("api-error");
    apiStatusTooltip.innerText = `Σφάλμα: ${error.message}\nΧρόνος Απόκρισης: ${responseTime} ms\nArduino Status: Unknown`;
  }
}

function updateUIWithData(data) {
  let alerts = []; // Ανανέωση των δεδομένων και των προειδοποιήσεων
  updateData("temperature", data.temperature, 40, "Θερμοκρασία", alerts);
  updateData("aqi", data.aqi, 150, "Ποιότητα Αέρα", alerts);
  updateData("voc", data.voc, 1000, "VOC", alerts);
  updateData("co2", data.co2, 2000, "co2", alerts);
  updateData("traffic", data.traffic, 90, "Κίνηση", alerts);
  updateData("humidity", data.humidity, 80, "Υγρασία", alerts);
  updateData("pressure", data.pressure, 1025, "Πίεση", alerts);

  if (alerts.length > 0 && !modalLock) {
    showModal(alerts.join("\n"));
  }
}

function updateData(elementId, value, limit, label, alerts) {
  const element = document.getElementById(elementId);
  element.innerHTML = `<i class="${getIconClass(
    elementId
  )}"></i> ${label}: ${value}`;

  if (value > limit) {
    element.classList.add("blink");
    alerts.push(`${label} έχει υπερβεί το όριο! Δεν προτείνουμε την έξοδο.`);

    let warningMessage = `${label} έχει υπερβεί το όριο!\n`;
    let iconClass = "fas fa-exclamation-triangle";

    if (label === "Θερμοκρασία") {
      warningMessage +=
        "Προσοχή: Η υψηλή θερμοκρασία μπορεί να είναι επικίνδυνη για την υγεία.";
      iconClass = "fas fa-thermometer-three-quarters";
    } else if (label === "Ποιότητα Αέρα") {
      warningMessage +=
        "Προσοχή: Η κακή ποιότητα αέρα μπορεί να προκαλέσει αναπνευστικά προβλήματα.";
      iconClass = "fas fa-cloud";
    } else if (label === "co2") {
      warningMessage +=
        "Προσοχή: Τα υψηλά επίπεδα CO2 μπορεί να είναι επικίνδυνα.";
      iconClass = "fas fa-smog";
    } else {
      warningMessage += "Δεν προτείνουμε την έξοδο υπό αυτές τις συνθήκες.";
    }

    showModal(warningMessage, iconClass);
  } else {
    element.classList.remove("blink");
  }
}

// Συνάρτηση που επιστρέφει την κατάλληλη κλάση εικονιδίου ανάλογα με το στοιχείο
function getIconClass(elementId) {
  switch (elementId) {
    case "temperature":
      return "fas fa-thermometer-half";
    case "aqi":
      return "fas fa-cloud";
    case "voc":
      return "fas fa-wind";
    case "co2":
      return "fas fa-smog";
    case "traffic":
      return "fas fa-car";
    case "humidity":
      return "fas fa-tint";
    case "pressure":
      return "fas fa-tachometer-alt";
    default:
      return "";
  }
}

// Προσθήκη smooth animations για την εμφάνιση και απόκρυψη του modal
function showModal(message, iconClass) {
  if (modalLock) return; // Εξασφάλιση ότι το modal δεν θα ανοίξει αν είναι κλειδωμένο

  const modal = document.getElementById("alertModal");
  const modalContent = modal.querySelector(".modal-content");
  document.getElementById("alertMessage").innerText = message;
  document.getElementById(
    "alertIcon"
  ).innerHTML = `<i class="${iconClass}"></i>`;

  modal.style.display = "block";
  modalContent.style.transform = "scale(0.7)";
  modalContent.style.opacity = "0";

  setTimeout(() => {
    modalContent.style.transition =
      "transform 0.3s ease-out, opacity 0.3s ease-out";
    modalContent.style.transform = "scale(1)";
    modalContent.style.opacity = "1";
  }, 10);

  modalLock = true; // Κλείδωμα του modal για να μην εμφανιστεί ξανά
  modalShown = true;

  // Μετά από 3 λεπτά (180.000 ms), το modalLock γίνεται ξανά false
  setTimeout(() => {
    modalLock = false;
  }, 180000);
}

// Συνάρτηση για την εμφάνιση του κόκκινου modal φωτιάς
function showFireModal() {
  if (fireModalShown) return; // Εξασφάλιση ότι το modal φωτιάς δεν θα ξαναεμφανιστεί

  const fireModal = document.getElementById("fireAlertModal");
  const fireModalContent = fireModal.querySelector(".modal-content");
  fireModal.style.display = "block";
  fireModalContent.style.transform = "scale(0.7)";
  fireModalContent.style.opacity = "0";

  setTimeout(() => {
    fireModalContent.style.transition =
      "transform 0.3s ease-out, opacity 0.3s ease-out";
    fireModalContent.style.transform = "scale(1)";
    fireModalContent.style.opacity = "1";
  }, 10);

  fireModalShown = true; // Αποτροπή της επανεμφάνισης του modal
}

function closeModal() {
  const modal = document.getElementById("alertModal");
  const modalContent = modal.querySelector(".modal-content");

  modalContent.style.transition =
    "transform 0.3s ease-in, opacity 0.3s ease-in";
  modalContent.style.transform = "scale(0.7)";
  modalContent.style.opacity = "0";

  setTimeout(() => {
    modal.style.display = "none";
    modalShown = false; // Επαναφορά του modalShown όταν το modal κλείνει
  }, 300);
}

// Συνάρτηση για το κλείσιμο του κόκκινου modal φωτιάς
function closeFireModal() {
  const fireModal = document.getElementById("fireAlertModal");
  const fireModalContent = fireModal.querySelector(".modal-content");

  fireModalContent.style.transition =
    "transform 0.3s ease-in, opacity 0.3s ease-in";
  fireModalContent.style.transform = "scale(0.7)";
  fireModalContent.style.opacity = "0";

  setTimeout(() => {
    fireModal.style.display = "none";
    fireModalShown = false; // Επαναφορά του fireModalShown όταν το modal κλείνει
  }, 300);
}

// Κλείσιμο του modal όταν ο χρήστης κάνει κλικ έξω από αυτό
window.onclick = function (event) {
  const modal = document.getElementById("alertModal");
  const fireModal = document.getElementById("fireAlertModal");
  if (event.target == modal) {
    closeModal();
  }
  if (event.target == fireModal) {
    closeFireModal();
  }
};

// Αρχικοποίηση της λειτουργίας
fetchDataFromAPI();
setInterval(fetchDataFromAPI, 2000); // Ανανεώνουμε τα δεδομένα κάθε 2 δευτερόλεπτα

// app.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;  // Port από το Glitch
let restartArduino = false;
// Middleware για την υποστήριξη JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // Για την υποστήριξη φόρμας

// Ενεργοποίηση CORS για να επιτρέψουμε αιτήσεις από διαφορετικά domains
app.use(cors());

// Μεταβλητή κατάστασης για επανεκκίνηση


let jsonData = {
  temperature: '--',
  aqi: '--',
  tvoc: '--',
  eco2: '--',
  traffic: '--',
  humidity: '--',
  pressure: '--',
  arduino_status: 'offline',
  Detect_Fire: '--',
  restartArduino: restartArduino
};  // Αρχικές τιμές για τα δεδομένα

// Endpoint για να λαμβάνει δεδομένα από το Arduino και να ενημερώνει τη σελίδα HTML
app.post('/data', (req, res) => {
  if (restartArduino) {
        console.log('Received POST request');
        jsonData = req.body;  // Αποθηκεύουμε τα δεδομένα που λαμβάνονται από το Arduino
        console.log('Received Data:', jsonData);
        // Αν χρειάζεται επανεκκίνηση, επιστρέφουμε την εντολή 'restart'
        res.status(200).send('restart');
        restartArduino = false;  // Επαναφορά της κατάστασης για την αποφυγή επανεκκίνησης στην επόμενη κλήση
        console.log('<> Εντολή επανεκκίνησης στάλθηκε στο Arduino. <>');
    } else {
        console.log('Received POST request');
        jsonData = req.body;  // Αποθηκεύουμε τα δεδομένα που λαμβάνονται από το Arduino
        console.log('Received Data:', jsonData);
        // Διαφορετικά, επιστρέφουμε ένα μήνυμα ότι όλα είναι καλά
        res.status(200).send('Data received');
    }
  
  
});

// Route που εμφανίζει τη φόρμα για επανεκκίνηση του Arduino
app.get('/restart', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="el">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="icon" href="https://cdn.glitch.global/1b0e4ef2-383c-4c1c-848c-a26e5fad7097/drone%20city%20mini%20logo.png?v=1728120285062">
            <title>Επανεκκίνηση Arduino</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    text-align: center;
                    padding: 20px;
                    background-color: black;
                    color: lightgrey;
                }
                button {
                    padding: 15px 30px;
                    font-size: 16px;
                    background-color: #ff4500;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                }
                button:hover {
                    background-color: #ff6500;
                }
            </style>
        </head>
        <body>
            <img src="https://cdn.glitch.global/85c496f4-339c-4a03-a7ab-c24872c1a54e/1.png?v=1726006496710" alt="DRONE CITY">
            <h1>Επανεκκίνηση Arduino</h1>
            <form action="/restart" method="POST">
                <button type="submit">Επανεκκίνηση Τώρα</button>
            </form>
            <h6>⌁DRONE CITY API dev mode⌁</h6>
        </body>
        </html>
    `);
});

// Route για να προκαλεί επανεκκίνηση στο Arduino
app.post('/restart', (req, res) => {
    restartArduino = true;

    // Παίρνουμε την IP του χρήστη
    const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
  
    // Δημιουργία του HTML με την IP
    res.send(`
        <!DOCTYPE html>
        <html lang="el">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="icon" href="https://cdn.glitch.global/1b0e4ef2-383c-4c1c-848c-a26e5fad7097/drone%20city%20mini%20logo.png?v=1728120285062">
            <title>Ορισμός Δεδομένων</title>
            <script>
                // Ανακατεύθυνση μετά από 5 δευτερόλεπτα
                setTimeout(function() {
                    window.location.href = '/restart';
                }, 5000);
            </script>
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: black; color: lightgrey;">
            <img src="https://cdn.glitch.global/85c496f4-339c-4a03-a7ab-c24872c1a54e/1.png?v=1726006496710" alt="DRONE CITY" >
            <h1>Η εντολή επανεκκίνησης υποβλήθηκε με επιτυχία!</h1><hr>
            <h4>Θα επιστρέψετε στη φόρμα σε 5 δευτερόλεπτα...</h4>
            <hr>
            <h1> &infin;</h1>
            <h5>Η IP σας είναι: ${userIp}</h5> <!-- Εμφάνιση IP διεύθυνσης -->
            <h6>⌁DRONE CITY API dev mode⌁</h6>
        </body>
        </html>
    `);

    console.log('Εντολή επανεκκίνησης ελήφθη από τον χρήστη.');
    console.log("User IP Address:", userIp);
    console.log("User Agent:", userAgent);
});

// Νέο endpoint για δοκιμαστικά δεδομένα
app.post('/test', (req, res) => {
  console.log('Received /test request');
  // Ενημερώνουμε το jsonData με δεδομένα από το αίτημα ή προεπιλεγμένα
  jsonData = {
    temperature: req.body.temperature || '25',
    aqi: req.body.aqi || '1',
    tvoc: req.body.tvoc || '50',
    eco2: req.body.eco2 || '500',
    traffic: req.body.traffic || '0',
    humidity: req.body.humidity || '45',
    pressure: req.body.pressure || '1013',
    arduino_status: req.body.arduino_status || 'OK',
    Detect_Fire: req.body.Detect_Fire || 'false'
  };
  console.log('Test Data Set:', jsonData);
  res.status(200);
   // Επιστρέφουμε μια HTML απόκριση με JavaScript για αυτόματη ανακατεύθυνση
  res.send(`
    <!DOCTYPE html>
    <html lang="el">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="icon" href="https://cdn.glitch.global/1b0e4ef2-383c-4c1c-848c-a26e5fad7097/1.png?v=1726435044877">
      <title>Ορισμός Δεδομένων</title>
      <script>
        // Ανακατεύθυνση μετά από 5 δευτερόλεπτα
        setTimeout(function() {
          window.location.href = '/test-form';
        }, 5000);
      </script>
    </head>
    <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: black; color: lightgrey; ">
      <img src="https://cdn.glitch.global/85c496f4-339c-4a03-a7ab-c24872c1a54e/1.png?v=1726006496710" alt="DRONE CITY">
      <h1>Τα δεδομένα υποβλήθηκαν με επιτυχία!</h1>
      <h4>Θα επιστρέψετε στη φόρμα σε 5 δευτερόλεπτα...</h4>
      <h6>⌁DRONE CITY API dev mode⌁<h6>
    </body>
    </html>
  `);
});

// Νέο endpoint με φόρμα HTML για ορισμό των δοκιμαστικών δεδομένων
app.get('/test-form', (req, res) => {
  const htmlForm = `
  <!DOCTYPE html>
  <html lang="el">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ορισμός Δοκιμαστικών Δεδομένων</title>
       <link rel="icon" href="https://cdn.glitch.global/1b0e4ef2-383c-4c1c-848c-a26e5fad7097/1.png?v=1726435044877">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  </head>
  <style>  
  
  .form-container {
    width: 300px;
    margin: auto;
    padding: 20px;
    background-color: lightgrey;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
  }

  input {
    width: auto;
    padding: 10px;
    margin: 10px 0;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: lightgrey;
  }

  button {
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  button:hover {
    background-color: #0056b3;
  }
</style>

  <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: black; color: lightgrey; ">
      <h1>Ορισμός Δοκιμαστικών Δεδομένων</h1>
      <form action="/test" method="POST">
    </div><img src="https://cdn.glitch.global/85c496f4-339c-4a03-a7ab-c24872c1a54e/drone%20city.png?v=1726320962120" alt="DRONE CITY" width="auto" height="auto"> 
          <div>
              <label for="temperature">Θερμοκρασία (°C):</label><i class="fas fa-thermometer-half"></i>
              <input type="text" id="temperature" name="temperature" placeholder="π.χ. 23">
          </div>
          <div>
              <label for="aqi">Ποιότητα Αέρα (AQI):</label><i class="fas fa-cloud"></i>
              <input type="text" id="aqi" name="aqi" placeholder="π.χ. 50">
          </div>
          <div>
              <label for="tvoc">TVOC (ppb):</label><i class="fas fa-wind"></i>
              <input type="text" id="tvoc" name="tvoc" placeholder="π.χ. 450">
          </div>
          <div>
              <label for="eco2">eCO2 (ppb):</label> <i class="fas fa-smog"></i>
              <input type="text" id="eco2" name="eco2" placeholder="π.χ. 500">
          </div>
          <div>
              <label for="traffic">Κίνηση:</label><i class="fas fa-car"></i>
              <input type="text" id="traffic" name="traffic" placeholder="π.χ. moderate">
          </div>
          <div>
              <label for="humidity">Υγρασία (%):</label><i class="fas fa-tint"></i>
              <input type="text" id="humidity" name="humidity" placeholder="π.χ. 45">
          </div>
          <div>
              <label for="pressure">Πίεση (hPa):</label><i class="fas fa-tachometer-alt"></i>
              <input type="text" id="pressure" name="pressure" placeholder="π.χ. 1013">
          </div>
          <div>
              <label for="arduino_status">Κατάσταση Arduino:</label><i class="fa fa-spinner"></i>
              <input type="text" id="arduino_status" name="arduino_status" placeholder="π.χ. active">
          </div>
          <div>
              <label for="fire">fire:</label><i class="fa fa-spinner"></i>
              <input type="bool" id="Detect_Fire" name="Detect_Fire" placeholder="true - false">
          </div>
          <button type="submit"><i class="fa fa-check" aria-hidden="true"></i>Υποβολή Δεδομένων</button>
      </form><h6>⌁DRONE CITY API dev mode⌁<h6>
  </body>
  </html>
  `;
  res.send(htmlForm);
});

// Endpoint για να παρέχουμε τα δεδομένα στην ιστοσελίδα
app.get('/data', (req, res) => {
  res.json(jsonData);
});

// Νέο HTML endpoint για εμφάνιση των δεδομένων στη σελίδα με inline CSS και αυτόματη ανανέωση
app.get('/html-data', (req, res) => {
  const html = `
  <!DOCTYPE html>
    <html lang="el">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, initial-scale=1, maximum-scale=1">
        <title>Παρακολούθηση Δεδομένων σε Πραγματικό Χρόνο</title>
        <link rel="icon" href="https://cdn.glitch.global/1b0e4ef2-383c-4c1c-848c-a26e5fad7097/1.png?v=1726435044877">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
        <meta http-equiv="refresh" content="5"> <!-- Αυτόματη ανανέωση κάθε 5 δευτερόλεπτα -->
    </head>
    <body style="font-family: Arial, sans-serif; text-align: center; position: fixed; overflow: hidden; padding: 20px; background-color: black; color: #f4f4f9; transition: background-color 0.3s, color 0.3s;">
        <div><h1>Παρακολούθηση Δεδομένων σε Πραγματικό Χρόνο</h1> </div>
        <div style="font-size: 18px; padding: 10px; background-color: #1e1e1e; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); width: 300px; margin: 10px auto; color: #f4f4f9;">
           <i class="fas fa-thermometer-half"></i> Θερμοκρασία: ${jsonData.temperature}°C
        </div>
        <div style="font-size: 18px; padding: 10px; background-color: #1e1e1e; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); width: 300px; margin: 10px auto; color: #f4f4f9;">
          <i class="fas fa-cloud"></i>  Ποιότητα Αέρα: Δείκτης ${jsonData.aqi}
        </div>
        <div style="font-size: 18px; padding: 10px; background-color: #1e1e1e; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); width: 300px; margin: 10px auto; color: #f4f4f9;">
          <i class="fas fa-wind"></i>  Concentration Reference: TVOC ${jsonData.tvoc} ppb
        </div>
        <div style="font-size: 18px; padding: 10px; background-color: #1e1e1e; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); width: 300px; margin: 10px auto; color: #f4f4f9;">
          <i class="fas fa-smog"></i>  Concentration Reference: eCO2/CO2 ${jsonData.eco2} ppb
        </div>
        <div style="font-size: 18px; padding: 10px; background-color: #1e1e1e; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); width: 300px; margin: 10px auto; color: #f4f4f9;">
          <i class="fas fa-car"></i>  Κίνηση: ${jsonData.traffic}
        </div>
        <div style="font-size: 18px; padding: 10px; background-color: #1e1e1e; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); width: 300px; margin: 10px auto; color: #f4f4f9;">
           <i class="fas fa-tint"></i> Υγρασία: ${jsonData.humidity}%
        </div>
        <div style="font-size: 18px; padding: 10px; background-color: #1e1e1e; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); width: 300px; margin: 10px auto; color: #f4f4f9;">
           <i class="fas fa-tachometer-alt"></i> Πίεση: ${jsonData.pressure} hPa
        </div>
        <div style="font-size: 18px; padding: 10px; background-color: #1e1e1e; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); width: 300px; margin: 10px auto; color: #f4f4f9;">
          <i class="fa fa-spinner"></i>  Arduino status: ${jsonData.arduino_status}
        </div>
    </body>
    </html>
  `;
  res.send(html);  // Επιστρέφουμε τη δυναμικά δημιουργημένη HTML σελίδα
});

// Ξεκίνηση του server στο Glitch
app.listen(port, () => {
  console.log(`DRONE CITY API START`);
  console.log(`Server running on port ${port}`);
});

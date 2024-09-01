const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 8080;

// Middleware για την υποστήριξη JSON requests
app.use(express.json());

// Ενεργοποίηση CORS για να επιτρέψουμε αιτήσεις από διαφορετικά domains
app.use(cors());

let sensorData = {
  temperature: '--',
  airQuality: '--',
  traffic: '--',
  humidity: '--',
  pressure: '--'
};  // Αρχικές τιμές για τα δεδομένα

// Endpoint για να λαμβάνει δεδομένα από το Arduino
app.post('/data', (req, res) => {
  sensorData = req.body;  // Αποθηκεύουμε τα δεδομένα
  console.log('Received Data:', sensorData);
  res.status(200).send('Data received');
});

// Endpoint για να παρέχουμε τα δεδομένα στην ιστοσελίδα
app.get('/data', (req, res) => {
  res.json(sensorData);
});

// Νέο HTML endpoint για εμφάνιση των δεδομένων στη σελίδα με inline CSS και αυτόματη ανανέωση
app.get('/html-data', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="el">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Παρακολούθηση Δεδομένων σε Πραγματικό Χρόνο</title>
        <meta http-equiv="refresh" content="5"> <!-- Αυτόματη ανανέωση κάθε 5 δευτερόλεπτα -->
        <style>
            body {
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 20px;
                background-color: #121212;
                color: #f4f4f9;
                margin: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                transition: background-color 0.3s, color 0.3s;
            }
            h1 {
                font-size: 2.5rem;
                margin-bottom: 20px;
                animation: fadeIn 1s ease-in-out;
            }
            .data-container {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 20px;
            }
            .data-box {
                font-size: 1.2rem;
                padding: 20px;
                background-color: #1e1e1e;
                border-radius: 10px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                width: 300px;
                color: #f4f4f9;
                transition: transform 0.3s, background-color 0.3s;
                animation: slideIn 0.8s ease-in-out;
            }
            .data-box:hover {
                transform: scale(1.05);
                background-color: #333333;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideIn {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @media (max-width: 768px) {
                .data-box {
                    width: 100%;
                    max-width: 90%;
                }
            }
        </style>
    </head>
    <body>
        <h1>Παρακολούθηση Δεδομένων σε Πραγματικό Χρόνο</h1>
        <div class="data-container">
            <div class="data-box">Θερμοκρασία: ${sensorData.temperature}°C</div>
            <div class="data-box">Ποιότητα Αέρα: Δείκτης ${sensorData.airQuality}</div>
            <div class="data-box">Κίνηση: ${sensorData.traffic}</div>
            <div class="data-box">Υγρασία: ${sensorData.humidity}%</div>
            <div class="data-box">Πίεση: ${sensorData.pressure} hPa</div>
        </div>
    </body>
    </html>
  `;
  res.send(html);  // Επιστρέφουμε τη δυναμικά δημιουργημένη HTML σελίδα
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

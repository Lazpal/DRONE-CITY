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
    </head>
    <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #121212; color: #f4f4f9; transition: background-color 0.3s, color 0.3s;">
        <h1>Παρακολούθηση Δεδομένων σε Πραγματικό Χρόνο</h1>
        <div style="font-size: 18px; padding: 10px; background-color: #1e1e1e; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); width: 300px; margin: 10px auto; color: #f4f4f9;">
            Θερμοκρασία: ${sensorData.temperature}°C
        </div>
        <div style="font-size: 18px; padding: 10px; background-color: #1e1e1e; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); width: 300px; margin: 10px auto; color: #f4f4f9;">
            Ποιότητα Αέρα: Δείκτης ${sensorData.airQuality}
        </div>
        <div style="font-size: 18px; padding: 10px; background-color: #1e1e1e; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); width: 300px; margin: 10px auto; color: #f4f4f9;">
            Κίνηση: ${sensorData.traffic}
        </div>
        <div style="font-size: 18px; padding: 10px; background-color: #1e1e1e; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); width: 300px; margin: 10px auto; color: #f4f4f9;">
            Υγρασία: ${sensorData.humidity}%
        </div>
        <div style="font-size: 18px; padding: 10px; background-color: #1e1e1e; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); width: 300px; margin: 10px auto; color: #f4f4f9;">
            Πίεση: ${sensorData.pressure} hPa
        </div>
    </body>
    </html>
  `;
  res.send(html);  // Επιστρέφουμε τη δυναμικά δημιουργημένη HTML σελίδα
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

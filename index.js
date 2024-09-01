const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const port = process.env.PORT || 8080;
const secretKey = 'your_secret_key';  // Θα πρέπει να το αποθηκεύσεις σε μεταβλητή περιβάλλοντος σε παραγωγή

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

// Middleware για έλεγχο JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);  // Αν δεν υπάρχει token, επιστρέφουμε 401

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);  // Αν το token δεν είναι έγκυρο, επιστρέφουμε 403
    req.user = user;
    next();
  });
}

// Endpoint για την έκδοση JWT (π.χ., μετά από login)
app.post('/login', (req, res) => {
  const username = req.body.username;
  const user = { name: username };

  const accessToken = jwt.sign(user, secretKey);
  res.json({ accessToken });
});

// Προστατευμένα Endpoints που απαιτούν JWT

// Endpoint για να λαμβάνει δεδομένα από το Arduino
app.post('/data', authenticateToken, (req, res) => {
  sensorData = req.body;  // Αποθηκεύουμε τα δεδομένα
  console.log('Received Data:', sensorData);
  
  // Αποστολή δεδομένων μέσω WebSocket σε όλους τους συνδεδεμένους πελάτες
  broadcastData();
  
  res.status(200).send('Data received');
});

// Endpoint για να παρέχουμε τα δεδομένα στην ιστοσελίδα
app.get('/data', authenticateToken, (req, res) => {
  res.json(sensorData);
});

// Νέο HTML endpoint για εμφάνιση των δεδομένων στη σελίδα
app.get('/html-data', authenticateToken, (req, res) => {
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

// Δημιουργία του HTTP server
const server = http.createServer(app);

// Δημιουργία του WebSocket server
const wss = new WebSocket.Server({ server });

// Συνδέσεις WebSocket
wss.on('connection', (ws) => {
  console.log('New client connected');
  
  // Στέλνουμε τα τρέχοντα δεδομένα μόλις συνδεθεί κάποιος πελάτης
  ws.send(JSON.stringify(sensorData));
  
  // Όταν αποσυνδεθεί ο πελάτης
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Αποστολή δεδομένων σε όλους τους συνδεδεμένους πελάτες
function broadcastData() {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(sensorData));
    }
  });
}

// Εκκίνηση του server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 8080;

// Middleware για την υποστήριξη JSON requests
app.use(express.json());

// Ενεργοποίηση CORS για να επιτρέψουμε αιτήσεις από διαφορετικά domains
app.use(cors());

let sensorData = {};  // Θα αποθηκεύουμε τα δεδομένα του αισθητήρα εδώ προσωρινά

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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

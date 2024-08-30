const express = require('express');
const app = express();
const port = 8080;

app.use(express.json());

let sensorData = {};

// Endpoint για να λαμβάνει δεδομένα από το Arduino
app.post('/data', (req, res) => {
  sensorData = req.body;
  console.log('Received Data:', sensorData);
  res.status(200).send('Data received');
});

// Endpoint για να παίρνει τα δεδομένα η ιστοσελίδα
app.get('/data', (req, res) => {
  res.json(sensorData);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

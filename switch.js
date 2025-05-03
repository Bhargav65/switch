const express = require('express');
const app = express();
const PORT = 3001;

// Simple in-memory flag
let killSignal = false;

// Secret token for auth (use env vars in production)
const SECRET_TOKEN = 'supersecret123';

app.use(express.json());

// Get the current kill signal state
app.get('/kill', (req, res) => {
  res.send(killSignal ? 'DESTROY' : 'OK');
});

// Set the kill signal (POST /kill with JSON and token)
app.post('/kill', (req, res) => {
  const { token, action } = req.body;

  if (token !== SECRET_TOKEN) {
    return res.status(403).send('Forbidden');
  }

  if (action === 'DESTROY') {
    killSignal = true;
    res.send('Kill signal activated');
  } else if (action === 'RESET') {
    killSignal = false;
    res.send('Kill signal deactivated');
  } else {
    res.status(400).send('Invalid action');
  }
});

app.listen(PORT, () => {
  console.log(`Kill switch server running on port ${PORT}`);
});

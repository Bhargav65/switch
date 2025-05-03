const express = require('express');
const app = express();
const PORT = 3001;

// Simple in-memory kill flag
let killSignal = false;

// Secret password
const SECRET_TOKEN = 'supersecret123';

app.use(express.json());

// Serve HTML directly (no public folder)
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Kill Switch Panel</title>
      <style>
        body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; margin-top: 50px; }
        input, button { margin: 10px; padding: 8px; font-size: 16px; }
        #response { margin-top: 20px; color: red; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>Kill Switch Control</h1>
      <input type="password" id="password" placeholder="Enter Password" />
      <input type="text" id="command" placeholder="Type 'kill' or 'reset'" />
      <button onclick="sendCommand()">Submit</button>
      <div id="response"></div>

      <script>
        async function sendCommand() {
          const password = document.getElementById('password').value;
          const command = document.getElementById('command').value.toLowerCase();
          const responseDiv = document.getElementById('response');

          if (!['kill', 'reset'].includes(command)) {
            responseDiv.textContent = "Invalid command. Use 'kill' or 'reset'.";
            return;
          }

          try {
            const res = await fetch('/kill', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: password, action: command === 'kill' ? 'DESTROY' : 'RESET' })
            });

            const text = await res.text();
            responseDiv.textContent = text;
          } catch (err) {
            responseDiv.textContent = 'Error sending command';
          }
        }
      </script>
    </body>
    </html>
  `);
});

// Check kill status (for your frontend/backend to poll)
app.get('/kill', (req, res) => {
  res.send(killSignal ? 'DESTROY' : 'OK');
});

// Trigger kill/reset with password
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

// Start the server
app.listen(PORT, () => {
  console.log(`Kill switch panel running at http://localhost:${PORT}`);
});

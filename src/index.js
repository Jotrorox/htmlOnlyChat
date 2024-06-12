const express = require('express');
const app = express();
const port = 3000;

const messages = {};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/chat', (req, res) => {
  const name = req.body.name;
  const message = req.body.message;

  if (messages[name]) {
    messages[name].push(message);
  } else {
    messages[name] = [message];
  }

  console.log(`Name: ${name}, message: ${message}`);
  res.send(`
    <html>
      <head>
        <script>
          window.addEventListener('DOMContentLoaded', function() { 
            history.go(-1); 
          });
        </script>
      </head>
      <body>
        <h1>Message Received!</h1>
      </body>
    </html>
  `);
});

app.get('/chat', (_, res) => {
  let chatHistory = '';
  for (const [name, messagesArray] of Object.entries(messages)) {
    messagesArray.forEach(message => {
      chatHistory += `<p>${name}: ${message}</p>`;
    });
  }
  console.log(chatHistory);
  res.send(`
    <html>
      <head>
        <script>
          setInterval(function() {
            location.reload();
          }, 1000);
        </script>
      </head>
      <body>
        <h1>Chat History</h1>
        ${chatHistory}
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
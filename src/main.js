const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

let db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');
});

function setupDB() {
    const sqlCreate = `
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            message TEXT
        )`;
    db.run(sqlCreate, (err) => {
        if (err) console.error(err.message);
        console.log('Created messages table.');
    });
}

function insertMessage(name, message) {
    name = sanitizeString(name);
    message = sanitizeString(message);
    const sqlInsert = 'INSERT INTO messages (name, message) VALUES (?, ?)';
    db.run(sqlInsert, [name, message], (err) => {
        if (err) console.error(err.message);
        console.log('Inserted message into the database.');
    });
}

function getMessages(callback) {
    const sqlSelect = 'SELECT * FROM messages';
    db.all(sqlSelect, (err, rows) => {
        if (err) {
            console.error("Error fetching messages:", err.message);
            callback(null);
        } else {
            console.log(`Fetched ${rows.length} messages.`);
            if (rows.length === 0) {
                console.log("No messages found in the database.");
            }
            callback(rows);
        }
    });
}

/**
 * Sanitizes a string by replacing '<' and '>' characters with their HTML entity equivalents.
 *
 * @param {string} str - The string to be sanitized.
 * @returns {string} The sanitized string.
 */
function sanitizeString(str) {
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/chat', upload.none(),  (req, res) => {
    const { name, message } = req.body;
    insertMessage(name, message);
    console.log(`Received message from ${name}: ${message}`);
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

app.get('/chat', (req, res) => {
    getMessages((messages) => {
        let html = messages.map((message) => {
            console.log(message);
            return `
                <div>
                    <p><strong>${message.name}</strong>: ${message.message}</p>
                </div>
            `;
        }).join('');

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
                ${html}
              </body>
            </html>
          `);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    setupDB();
});
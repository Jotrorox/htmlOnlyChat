const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const sharp = require('sharp');
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
    });
}

function getMessages(callback) {
    const sqlSelect = 'SELECT * FROM messages';
    db.all(sqlSelect, (err, rows) => {
        if (err) {
            console.error("Error fetching messages:", err.message);
            callback(null);
        } else {
            if (rows.length === 0) {
                console.log("No messages found in the database.");
            }
            callback(rows);
        }
    });
}

function getLastMessages(num_messages, callback) {
    const sqlSelect = `SELECT * FROM messages ORDER BY id DESC LIMIT ${num_messages}`;
    db.all(sqlSelect, (err, rows) => {
        if (err) {
            console.error("Error fetching messages:", err.message);
            callback(null);
        } else {
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

app.post('/chat', upload.none(), (req, res) => {
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

app.get('/last-messages-img', (_, res) => {
    getLastMessages(5, (messages) => {
        let svg = messages.map((message, index) => {
            return `
                <text x="10" y="${(index * 20)+20}" font-family="Arial" font-size="16" fill="black">${message.name}: ${message.message}</text>
            `;
        }).join('');

        const svgImage = `
            <svg width="400" height="${messages.length * 23}" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="none" />
                ${svg}
            </svg>
        `;

        sharp(Buffer.from(svgImage))
            .toFormat('png')
            .toBuffer()
            .then(data => {
                res.type('png');
                res.end(data, 'binary');
            })
            .catch(err => {
                console.error(err);
                res.status(500).send('Error generating image');
            });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    setupDB();
});
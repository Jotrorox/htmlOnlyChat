from flask import Flask, request, render_template_string, send_file
from waitress import serve
from PIL import Image, ImageDraw, ImageFont
import io
import os
import re
from  sqlite4  import  SQLite4

app = Flask(__name__)

database = SQLite4("database.db")

def setupDB():
  database.connect()
  database.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, message TEXT)")

@app.route('/chat', methods=['POST'])
def post_chat():
    name = request.form['name']
    message = request.form['message']

    message = re.sub('<[^<]+?>', '', message)
    message = re.sub(r'\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP)\b', '', message)

    database.execute("INSERT INTO users (username, message) VALUES (?, ?)", (name, message))

    print(f"Name: {name}, message: {message}")
    return """
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
    """

@app.route('/chat')
def get_chat():
    chat_history = ''
    rows = database.execute("SELECT username, message FROM users")
    for row in rows:
      name = row[0]
      message = row[1]
      chat_history += f'<p>{name}: {message}</p>'
    return """
    <html>
      <head>
        <script>
          setInterval(function() {{
            location.reload();
          }}, 1000);
        </script>
      </head>
      <body>
        <h1>Chat History</h1>
        {}
      </body>
    </html>
    """.format(chat_history)

if __name__ == '__main__':
  setupDB()
  port = os.environ.get('PORT')
  if port:
    serve(app, host='0.0.0.0', port=int(port))
  else:
    serve(app, host='0.0.0.0')

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
  database.create_table("messages", ["username", "message"])

@app.route('/chat', methods=['POST'])
def post_chat():
    name = request.form['name']
    message = request.form['message']

    message = re.sub('<[^<]+?>', '', message)
    message = re.sub(r'\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP)\b', '', message)

    database.insert("messages", [name, message])
    
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
  try:
    rows = database.execute("SELECT username, message FROM messages").fetchall()
  except Exception as e:
    app.logger.error(f"Database query failed: {e}")
    rows = []

  messages = []
  for row in rows:
    messages.append({"username": row[0], "message": row[1]})

  # Assuming you want to render the messages on a webpage
  return render_template_string('''<ul>{% for message in messages %}
                     <li>{{ message.username }}: {{ message.message }}</li>
                   {% endfor %}</ul>''', messages=messages)

if __name__ == '__main__':
  setupDB()
  port = os.environ.get('PORT')
  if port:
    serve(app, host='0.0.0.0', port=int(port))
  else:
    serve(app, host='0.0.0.0')

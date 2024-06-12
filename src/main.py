from flask import Flask, request, render_template_string, send_file
from waitress import serve
from PIL import Image, ImageDraw, ImageFont
import io
import os
import re

app = Flask(__name__)

messages = {}

@app.route('/chat', methods=['POST'])
def post_chat():
    name = request.form['name']
    message = request.form['message']

    # Remove HTML tags
    message = re.sub('<[^<]+?>', '', message)

    # Remove SQL statements
    message = re.sub(r'\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP)\b', '', message)

    if name in messages:
      messages[name].append(message)
    else:
      messages[name] = [message]

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
    for name, messages_array in messages.items():
        for message in messages_array:
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
  port = os.environ.get('PORT')
  if port:
    serve(app, host='0.0.0.0', port=int(port))
  else:
    serve(app, host='0.0.0.0')

from flask import Flask, request, render_template_string, send_file
from waitress import serve
from PIL import Image, ImageDraw, ImageFont
import io
import os

app = Flask(__name__)

messages = {}

@app.route('/chat', methods=['POST'])
def post_chat():
    name = request.form['name']
    message = request.form['message']

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

@app.route('/chat/image')
def chat_image():
  img = Image.new('RGB', (200, len(messages)*30), color=(73, 109, 137))
  d = ImageDraw.Draw(img)
  font = ImageFont.truetype("./rsc/fonts/Roboto.ttf", 15)

  y_offset = 0
  for name, msgs in messages.items():
      for msg in msgs:
          d.text((10,y_offset), f"{name}: {msg}", fill=(255,255,0), font=font)
          y_offset += 20

  img_io = io.BytesIO()
  img.save(img_io, 'PNG')
  img_io.seek(0)

  return send_file(img_io, mimetype='image/png')

if __name__ == '__main__':
  port = os.environ.get('PORT')
  if port:
    serve(app, host='0.0.0.0', port=int(port))
  else:
    serve(app, host='0.0.0.0')

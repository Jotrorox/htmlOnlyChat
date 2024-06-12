from flask import Flask, request, render_template_string

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
    print(chat_history)
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
    app.run(debug=True, port=3000)

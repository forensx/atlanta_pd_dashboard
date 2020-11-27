from flask import Flask
import json
import time
app = Flask(__name__)


@app.route('/data')
def get_current_data():
    with open('2020_November.json', 'r') as f:
        data = json.load(f)
        return {'results': data}


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

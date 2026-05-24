from flask import Flask, render_template
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

@app.route('/')
def overview():
    return render_template('overview.html', active_page='overview')

@app.route('/clients')
def clients():
    return render_template('clients.html', active_page='clients')

@app.route('/tickets')
def tickets():
    return render_template('tickets.html', active_page='tickets')

@app.route('/billing')
def billing():
    return render_template('billing.html', active_page='billing')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

# Git Tes
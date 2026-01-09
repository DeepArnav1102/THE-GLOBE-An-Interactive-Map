from flask import Flask, render_template, jsonify
import json
import pandas as pd

app = Flask(__name__)

def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

@app.route("/")
def homepage():
    return render_template("homepage.html")

@app.route("/map")
def home():
    return render_template("index.html")

@app.route("/api/cities")
def cities():
    return jsonify(load_json("data/cities.json"))

@app.route("/api/power-plants")
def power_plants():
    df = pd.read_excel("power_plants.xlsx")
    return df.to_json(orient="records")

@app.route("/api/airports")
def airports():
    df = pd.read_excel("india_major_international_airports.xlsx")
    return df.to_json(orient="records")

if __name__ == "__main__":
    app.run(debug=True)

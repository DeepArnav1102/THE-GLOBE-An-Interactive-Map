from flask import Flask, render_template, request, jsonify
import json
import pandas as pd
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

app = Flask(__name__)

api_k = os.getenv("GEMINI_API_KEY")

if not api_k:
    raise ValueError("GEMINI_API_KEY not found")

client = genai.Client(api_key=api_k)

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


SYSTEM_PROMPT = """
You are a travel information assistant.

When given a city name, respond ONLY in valid JSON format like this:

{
  "tourist_attractions": "",
  "local_cuisine": "",
  "cultural_significance": "",
  "best_time_to_visit": ""
}

Keep answers concise but informative.
Do not include markdown.
Do not add extra text.
"""

@app.route("/api/gem", methods=["POST"])
def gem():
    data = request.get_json()
    city_name = data.get("city_name", "").strip()

    if not city_name:
        return jsonify({"error": "City name is required."}), 400

    try:
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=f"{SYSTEM_PROMPT}\n\nCity: {city_name}",
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )

        content = response.text.strip()

        try:
            parsed_json = json.loads(content)
        except json.JSONDecodeError:
            return jsonify({"error": "AI returned invalid JSON"}), 500

        return jsonify(parsed_json)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
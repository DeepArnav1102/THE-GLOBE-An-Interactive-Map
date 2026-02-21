# 🌍 THE GLOBE — An Interactive Map

> A full-stack web application for exploring global infrastructure through an interactive geospatial map.

![Python](https://img.shields.io/badge/Python-3.x-blue?style=flat-square&logo=python)
![Flask](https://img.shields.io/badge/Flask-Backend-lightgrey?style=flat-square&logo=flask)
![Leaflet.js](https://img.shields.io/badge/Leaflet.js-Mapping-green?style=flat-square)
![JavaScript](https://img.shields.io/badge/JavaScript-Frontend-yellow?style=flat-square&logo=javascript)
![Pandas](https://img.shields.io/badge/Pandas-Data%20Processing-purple?style=flat-square&logo=pandas)

---

## 📌 About the Project

**THE GLOBE** is a web-based geospatial visualization platform that transforms raw infrastructure datasets into an interactive, map-driven experience. Instead of browsing static spreadsheets, users can explore thousands of real-world data points — airports and power plants — directly on a dynamic world map.

The application is built with a **Flask** backend that processes and serves data via REST APIs, and a **Leaflet.js** powered frontend that renders everything interactively in the browser.

---

## ✨ Features

- 🗺️ **Interactive World Map** powered by Leaflet.js
- 📍 **Clickable Markers** with detailed popups for each data point
- 🔁 **Layer Toggles** — independently show/hide airports and power plants
- 🔍 **Filter & Search** — query data by name or attributes in real time
- ⚡ **Two Rich Datasets** — Indian international airports & global power plants
- 🔗 **REST API Backend** — Flask serves processed data as JSON to the frontend

---

## 🗂️ Project Structure

```
THE-GLOBE-An-Interactive-Map/
│
├── app.py                                  # Flask app — routes & API endpoints
├── india_major_international_airports.xlsx # Dataset: Indian airports
├── power_plants.xlsx                       # Dataset: Global power plants
│
├── data/                                   # Supporting data files
├── templates/                              # HTML templates (Jinja2)
└── static/                                 # CSS & JavaScript assets
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, Flask |
| Data Processing | Pandas |
| Frontend | HTML5, CSS3, JavaScript |
| Mapping | Leaflet.js |
| Data Format | Excel (.xlsx) → JSON via API |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:
- Python 3.x
- pip

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DeepArnav1102/THE-GLOBE-An-Interactive-Map.git
   cd THE-GLOBE-An-Interactive-Map
   ```

2. **Install dependencies**
   ```bash
   pip install flask pandas openpyxl
   ```

3. **Run the application**
   ```bash
   python app.py
   ```

4. **Open in browser**
   ```
   http://127.0.0.1:5000
   ```

---

## 📊 Datasets

| Dataset | Description |
|---------|-------------|
| `india_major_international_airports.xlsx` | Major international airports across India with location coordinates and details |
| `power_plants.xlsx` | Global power plant data including type, capacity, and geographic coordinates |

---

## 💡 Applications

- **Infrastructure Planning** — Visualize gaps in airport and energy coverage across regions
- **Energy Sector Analysis** — Study distribution of power sources (thermal, solar, hydro, etc.)
- **Academic & Research** — Explore spatial relationships in geography and data science
- **Aviation & Logistics** — Analyze air connectivity and route coverage
- **Policy Making** — Support evidence-based decisions on infrastructure investments

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to open a pull request or raise an issue.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">Made with ❤️ by <a href="https://github.com/DeepArnav1102">DeepArnav1102</a></p>

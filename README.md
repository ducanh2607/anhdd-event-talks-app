# BigQuery Release Notes Viewer & Tweet Composer

An elegant, modern Flask web application that parses the official Google Cloud BigQuery Atom XML release notes feed, presenting them in a beautiful, interactive dashboard with an integrated **X (Twitter) Tweet Composer**.

## 🌟 Features

- **Live XML Feed Parsing**: Automatically fetches, parses, and formats the live [BigQuery Atom XML feed](https://docs.cloud.google.com/feeds/bigquery-release-notes.xml) from Google Cloud.
- **Smart Category Classification**: Automatically classifies release notes headings into distinct types (e.g., *Feature*, *Change*, *Bug Fix*, *Announcement*, *Deprecated*) and styles them with customized icons and color schemes.
- **One-Click Tweet Composer**: Click on any release card to open an interactive drawer that auto-generates a publication-ready tweet (with title, link, and hashtags) trimmed to fit within the 280-character limit.
- **Real-Time Statistics**: Display counts, feed updates, and the exact fetch timestamp.
- **Premium Responsive UI**: Sleek styling with custom animations, loading animations, robust error states, and responsive layout for mobile and desktop screens.

---

## 🛠️ Tech Stack

- **Backend**: Python 3, [Flask](https://flask.palletsprojects.com/) (Web framework), `requests` (HTTP requests), `xml.etree.ElementTree` (Standard library XML parser).
- **Frontend**: HTML5 (semantic layout), Vanilla CSS (modern layout with variables and flex/grid), Vanilla JavaScript (state management and dynamic DOM manipulation).

---

## 🚀 Getting Started

### Prerequisites

Ensure you have Python 3.8+ installed.

### Installation

1. **Clone the repository**:
   ```bash
   git clone git@github.com:ducanh2607/anhdd-event-talks-app.git
   cd anhdd-event-talks-app
   ```

2. **Create and activate a virtual environment**:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. **Install the dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

### Running the Application

Start the Flask development server:
```bash
python app.py
```

The application will start running at `http://127.0.0.1:5000/`. Open this URL in your web browser to view the app!

---

## 📁 Project Structure

```text
├── app.py                  # Flask backend server & XML parsing logic
├── requirements.txt        # Python package dependencies
├── templates/
│   └── index.html          # Main HTML structure and UI layouts
├── static/
│   ├── css/
│   │   └── style.css       # Custom modern responsive styling
│   └── js/
│       └── app.js          # Client-side feed fetching, rendering, and Tweet composition
└── README.md               # Project documentation
```

---

## 🔒 License

Distributed under the MIT License. See `LICENSE` for more information (optional).

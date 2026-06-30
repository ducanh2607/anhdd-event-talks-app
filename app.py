import xml.etree.ElementTree as ET
from datetime import datetime, timezone

import requests
from flask import Flask, jsonify, render_template

app = Flask(__name__)

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"
ATOM_NS = "http://www.w3.org/2005/Atom"


def parse_feed(xml_content: str) -> dict:
    """Parse the Atom XML feed and return structured data."""
    root = ET.fromstring(xml_content)

    feed_title = root.findtext(f"{{{ATOM_NS}}}title", default="BigQuery Release Notes")
    feed_updated_raw = root.findtext(f"{{{ATOM_NS}}}updated", default="")

    entries = []
    for entry in root.findall(f"{{{ATOM_NS}}}entry"):
        title = entry.findtext(f"{{{ATOM_NS}}}title", default="")
        entry_id = entry.findtext(f"{{{ATOM_NS}}}id", default="")
        updated_raw = entry.findtext(f"{{{ATOM_NS}}}updated", default="")
        content_el = entry.find(f"{{{ATOM_NS}}}content")
        content_html = content_el.text if content_el is not None else ""
        link_el = entry.find(f"{{{ATOM_NS}}}link[@rel='alternate']")
        link_href = link_el.get("href", "") if link_el is not None else ""

        # Parse updated date for display
        updated_display = updated_raw
        try:
            dt = datetime.fromisoformat(updated_raw)
            updated_display = dt.strftime("%B %d, %Y")
        except ValueError:
            pass

        entries.append(
            {
                "id": entry_id,
                "title": title,
                "updated": updated_raw,
                "updated_display": updated_display,
                "content": content_html,
                "link": link_href,
            }
        )

    feed_updated_display = feed_updated_raw
    try:
        dt = datetime.fromisoformat(feed_updated_raw)
        feed_updated_display = dt.strftime("%B %d, %Y at %H:%M UTC")
    except ValueError:
        pass

    return {
        "title": feed_title,
        "updated": feed_updated_raw,
        "updated_display": feed_updated_display,
        "entries": entries,
        "fetched_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
    }


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/release-notes")
def release_notes():
    try:
        response = requests.get(FEED_URL, timeout=15)
        response.raise_for_status()
        data = parse_feed(response.content)
        return jsonify({"success": True, "data": data})
    except requests.exceptions.Timeout:
        return jsonify({"success": False, "error": "Request timed out. Please try again."}), 504
    except requests.exceptions.ConnectionError:
        return jsonify({"success": False, "error": "Failed to connect to Google Cloud. Check your network."}), 502
    except requests.exceptions.HTTPError as e:
        return jsonify({"success": False, "error": f"HTTP error: {e.response.status_code}"}), 502
    except ET.ParseError:
        return jsonify({"success": False, "error": "Failed to parse the XML feed."}), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)

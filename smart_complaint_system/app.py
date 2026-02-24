from flask import Flask, render_template, request, redirect, session, jsonify
import sqlite3
import random
import os

app = Flask(__name__)
app.secret_key = 'smart_complaint_secret_key'

# Create database
def init_db():
    conn = sqlite3.connect("database.db")
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS complaints(
        id TEXT,
        name TEXT,
        complaint TEXT,
        location TEXT,
        category TEXT
    )
    """)
    conn.commit()
    conn.close()

init_db()


# AI classification (simple)
def classify(text):
    text = text.lower()

    if "water" in text or "पानी" in text:
        return "Water Issue"
    elif "road" in text or "सड़क" in text:
        return "Road Issue"
    elif "electricity" in text or "बिजली" in text:
        return "Electricity Issue"
    else:
        return "General"


@app.route("/")
def home():
    lang = session.get('language', 'en')
    return render_template("index.html", lang=lang)


@app.route("/submit", methods=["POST"])
def submit():
    name = request.form["name"]
    complaint = request.form["complaint"]
    location = request.form["location"]

    complaint_id = "CMP" + str(random.randint(1000,9999))
    category = classify(complaint)

    conn = sqlite3.connect("database.db")
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO complaints VALUES (?,?,?,?,?)",
        (complaint_id, name, complaint, location, category)
    )

    conn.commit()
    conn.close()

    return f"Complaint Submitted! Your ID: {complaint_id}"


@app.route("/track", methods=["GET","POST"])
def track():
    lang = session.get('language', 'en')
    if request.method == "POST":
        cid = request.form["cid"]

        conn = sqlite3.connect("database.db")
        cur = conn.cursor()

        cur.execute("SELECT * FROM complaints WHERE id=?", (cid,))
        data = cur.fetchone()

        conn.close()

        return render_template("track.html", data=data, lang=lang)

    return render_template("track.html", data=None, lang=lang)


@app.route("/set_language/<lang>")
def set_language(lang):
    session['language'] = lang
    return jsonify({"status": "success", "language": lang})


@app.route("/voice_submit", methods=["POST"])
def voice_submit():
    data = request.get_json()
    text = data.get("text", "")
    
    complaint_id = "CMP" + str(random.randint(1000,9999))
    category = classify(text)
    
    return jsonify({
        "complaint_id": complaint_id,
        "category": category,
        "text": text
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=False)

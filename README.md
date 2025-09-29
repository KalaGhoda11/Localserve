# Localserve

**Localserve** is a lightweight local server built with [Flask](https://flask.palletsprojects.com/), designed to quickly serve static files and dynamic templates.  
It’s a minimal starting point for small projects, demos, or testing web applications locally.

---

## 🚀 Features

- Serve static files (CSS, JS, images, etc.)  
- Render dynamic HTML pages using Jinja2 templates  
- Simple and minimal Flask setup – easy to extend  
- Developer-friendly structure  

---

## 📂 Project Structure

Localserve/
├── app.py # Main Flask application
├── templates/ # Jinja2 HTML templates
│ └── index.html
├── static/ # Static assets (CSS, JS, images)
└── README.md # Documentation (this file)

---

## ⚙️ Installation

### Prerequisites
- Python 3.8+  
- `pip` package manager  

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/KalaGhoda11/Localserve.git
   cd Localserve

---
Optional(create virtual environment to avoid conflicts):
python -m venv venv
source venv/bin/activate   # Linux/macOS
venv\Scripts\activate      # Windows

Install dependencies:

pip install -r requirements.txt
http://127.0.0.1:5000

🔗 Usage

Modify routes in app.py to add new endpoints

Add HTML templates under templates/

Store static files (CSS/JS/images) under static/

Example template usage for static files:

<link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
🛠️ Customization

You can change the Flask server settings in app.py:

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)


host="0.0.0.0" → accessible on your local network

port=5000 → change if needed

debug=True → enables live reload and better error messages
🤝 Contributing

Fork the repo

Create a new branch (feature/new-feature)

Commit changes

Push and open a Pull Request

📜 License

This project is licensed under the MIT License – feel free to use and modify.

👤 Author
SCRIPT KIDDOS

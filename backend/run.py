from app import create_app

# ═══════════════════════════════════════════════════════════════
# Application Entry Point
# ═══════════════════════════════════════════════════════════════

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
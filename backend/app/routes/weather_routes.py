from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from app.services.weather_api import weather_api

# ═══════════════════════════════════════════════════════════════
# Weather Routes
# ═══════════════════════════════════════════════════════════════

weather_bp = Blueprint("weather", __name__, url_prefix="/api/weather")

@weather_bp.route("/current", methods=["GET"])
@jwt_required(optional=True)
def get_current_weather():
    # ═══════════════════════════════════════════════════════════════
    # ───Get current weather for a location using WeatherStack API───
    # ═══════════════════════════════════════════════════════════════     
    # ─── Validate Input ─────────────────────────────────────────
    location = request.args.get('location', '').strip()
    
    if not location:
        return jsonify({
            "success": False,
            "error": "missing_parameter",
            "message": "Please provide a location (e.g., ?location=Chicago)"
        }), 400
    
    # ─── Fetch Data ─────────────────────────────────────────────
    try:
        weather_data = weather_api.get_current_weather(location)
        
        # Check if API returned an error
        if isinstance(weather_data, dict) and 'error' in weather_data:
            status_code = 404 if weather_data['error'] == 'location_not_found' else 500
            return jsonify({
                "success": False,
                "error": weather_data['error'],
                "message": weather_data['message']
            }), status_code
        
        return jsonify({
            "success": True,
            "data": weather_data
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Weather endpoint error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "internal_error",
            "message": "Failed to fetch weather data. Please try again."
        }), 500
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services.weather_api import weather_api

weather_bp = Blueprint("weather", __name__, url_prefix="/api/weather")

@weather_bp.route("/current", methods=["GET"])
@jwt_required(optional=True)
def get_current_weather():
    try:
        location = request.args.get('location')
        
        if not location:
            return jsonify({
                'success': False,
                'error': 'missing_parameter',
                'message': 'Please provide a city name (e.g., ?location=Chicago)'
            }), 400
        
        # Get real weather data from API using your actual API key
        weather_data = weather_api.get_current_weather(location)
        
        # Check if response contains an error
        if isinstance(weather_data, dict) and 'error' in weather_data:
            return jsonify({
                'success': False,
                'error': weather_data['error'],
                'message': weather_data['message']
            }), 404 if weather_data['error'] == 'location_not_found' else 500
        
        # Success!
        return jsonify({
            'success': True,
            'data': weather_data
        }), 200
        
    except Exception as e:
        print(f"Error in weather endpoint: {e}")
        return jsonify({
            'success': False,
            'error': 'internal_error',
            'message': 'An unexpected error occurred while fetching weather data'
        }), 500

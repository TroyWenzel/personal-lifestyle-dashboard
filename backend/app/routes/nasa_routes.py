from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services.nasa_api import nasa_api

nasa_bp = Blueprint("nasa", __name__, url_prefix="/api/nasa")

@nasa_bp.route("/apod", methods=["GET"])
@jwt_required(optional=True)
def get_apod():
    try:
        date = request.args.get('date')
        
        apod_data = nasa_api.get_apod(date)
        
        if isinstance(apod_data, dict) and 'error' in apod_data:
            return jsonify({
                'success': False,
                'error': apod_data['error'],
                'message': apod_data.get('message', 'Failed to fetch NASA data')
            }), 500
        
        return jsonify({
            'success': True,
            'data': apod_data
        }), 200
        
    except Exception as e:
        print(f"Error fetching APOD: {e}")
        return jsonify({
            'success': False,
            'error': 'internal_error',
            'message': 'Failed to fetch Astronomy Picture of the Day'
        }), 500

@nasa_bp.route("/mars-photos", methods=["GET"])
@jwt_required(optional=True)
def get_mars_photos():
    try:
        rover = request.args.get('rover', 'curiosity')
        earth_date = request.args.get('earth_date')
        page = request.args.get('page', 1, type=int)
        
        photos_data = nasa_api.get_mars_rover_photos(rover, earth_date, page)
        
        if isinstance(photos_data, dict) and 'error' in photos_data:
            return jsonify({
                'success': False,
                'error': photos_data['error'],
                'message': 'Failed to fetch Mars rover photos'
            }), 500
        
        return jsonify({
            'success': True,
            'data': photos_data
        }), 200
        
    except Exception as e:
        print(f"Error fetching Mars photos: {e}")
        return jsonify({
            'success': False,
            'error': 'internal_error',
            'message': 'Failed to fetch Mars rover photos'
        }), 500
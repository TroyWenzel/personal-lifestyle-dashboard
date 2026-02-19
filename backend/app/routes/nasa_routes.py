from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from app.services.nasa_api import nasa_api

# ═══════════════════════════════════════════════════════════════
# NASA Routes
# ═══════════════════════════════════════════════════════════════

nasa_bp = Blueprint("nasa", __name__, url_prefix="/api/nasa")

@nasa_bp.route("/apod", methods=["GET"])
@jwt_required(optional=True)
def get_apod():
    # ═══════════════════════════════════════════════════════════════
    # ───────────────Get Astronomy Picture of the Day────────────────
    # ═══════════════════════════════════════════════════════════════    
    try:
        date = request.args.get('date')
        apod_data = nasa_api.get_apod(date)
        
        if isinstance(apod_data, dict) and 'error' in apod_data:
            return jsonify({
                "success": False,
                "error": apod_data['error'],
                "message": apod_data.get('message', 'Failed to fetch NASA data')
            }), 500
        
        return jsonify({
            "success": True,
            "data": apod_data
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"APOD error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "internal_error",
            "message": "Failed to fetch Astronomy Picture of the Day"
        }), 500

@nasa_bp.route("/mars-photos", methods=["GET"])
@jwt_required(optional=True)
def get_mars_photos():
    # ═══════════════════════════════════════════════════════════════
    # ─────────────────Get photos from Mars rovers───────────────────
    # ═══════════════════════════════════════════════════════════════    
    try:
        rover = request.args.get('rover', 'curiosity')
        earth_date = request.args.get('earth_date')
        page = request.args.get('page', 1, type=int)
        
        photos_data = nasa_api.get_mars_rover_photos(rover, earth_date, page)
        
        if isinstance(photos_data, dict) and 'error' in photos_data:
            return jsonify({
                "success": False,
                "error": photos_data['error'],
                "message": "Failed to fetch Mars rover photos"
            }), 500
        
        return jsonify({
            "success": True,
            "data": photos_data
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Mars photos error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "internal_error",
            "message": "Failed to fetch Mars rover photos"
        }), 500

@nasa_bp.route("/backgrounds", methods=["GET"])
@jwt_required(optional=True)
def get_space_backgrounds():
    # ═══════════════════════════════════════════════════════════════
    # ──────────Get random space images for backgrounds──────────────
    # ═══════════════════════════════════════════════════════════════    
    try:
        count = request.args.get('count', 10, type=int)
        backgrounds_data = nasa_api.get_space_backgrounds(count)
        
        if isinstance(backgrounds_data, dict) and 'error' in backgrounds_data:
            return jsonify({
                "success": False,
                "error": backgrounds_data['error'],
                "message": backgrounds_data.get('message', 'Failed to fetch space backgrounds')
            }), 500
        
        return jsonify(backgrounds_data), 200
        
    except Exception as e:
        current_app.logger.error(f"Backgrounds error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "internal_error",
            "message": "Failed to fetch space backgrounds"
        }), 500
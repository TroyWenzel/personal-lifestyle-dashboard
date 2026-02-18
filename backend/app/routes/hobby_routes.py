import requests
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from flask_cors import cross_origin

hobby_bp = Blueprint('hobbies', __name__, url_prefix='/api/hobbies')

BORED_API = 'https://www.boredapi.com/api'

@hobby_bp.route('/random', methods=['GET', 'OPTIONS'])
@cross_origin(origins=[
    'https://steady-rugelach-889cba.netlify.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
], supports_credentials=True)
def get_random_activity():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    @jwt_required()
    def protected():
        try:
            activity_type = request.args.get('type', '')
            participants = request.args.get('participants', '')

            params = {}
            if activity_type:
                params['type'] = activity_type
            if participants:
                params['participants'] = participants

            response = requests.get(f'{BORED_API}/activity', params=params)

            if not response.ok:
                return jsonify({'error': 'No activities found for these filters.'}), 404

            data = response.json()

            if 'error' in data:
                return jsonify({'error': data['error']}), 404

            return jsonify(data), 200

        except Exception as e:
            print(f'Error fetching activity: {e}')
            return jsonify({'error': 'Failed to fetch activity. Please try again.'}), 500

    return protected()
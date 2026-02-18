import random
import requests
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from flask_cors import cross_origin

hobby_bp = Blueprint('hobbies', __name__, url_prefix='/api/hobbies')

BORED_API = 'https://bored-api.appbrewery.com'

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
            participants  = request.args.get('participants', '')

            if activity_type or participants:
                params = {}
                if activity_type:
                    params['type'] = activity_type
                if participants:
                    params['participants'] = participants

                response = requests.get(f'{BORED_API}/filter', params=params, timeout=10)

                if response.status_code == 404 and participants and activity_type:
                    response = requests.get(f'{BORED_API}/filter', params={'type': activity_type}, timeout=10)

                if not response.ok:
                    return jsonify({'error': 'No activities found for these filters. Try different options!'}), 404

                activities = response.json()
                if not activities:
                    return jsonify({'error': 'No activities found for these filters.'}), 404

                data = random.choice(activities)

            else:
                # No filters — /random returns a single object directly
                response = requests.get(f'{BORED_API}/random', timeout=10)

                if not response.ok:
                    return jsonify({'error': 'Failed to fetch activity. Please try again.'}), 500

                data = response.json()

            if 'error' in data:
                return jsonify({'error': data['error']}), 404

            return jsonify(data), 200

        except Exception as e:
            print(f'Error fetching activity: {e}')
            return jsonify({'error': 'Failed to fetch activity. Please try again.'}), 500

    return protected()
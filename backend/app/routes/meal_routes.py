from flask import Blueprint, request, jsonify
from app.services.meal_api import search_meals, get_meal_by_id

meal_bp = Blueprint("meal", __name__, url_prefix="/meals")

@meal_bp.route("/search")
def search():
    query = request.args.get("q", "")
    return jsonify(search_meals(query))

@meal_bp.route("/<meal_id>")
def detail(meal_id):
    return jsonify(get_meal_by_id(meal_id))

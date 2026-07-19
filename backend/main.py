from flask import Flask, request, jsonify
from flask_cors import CORS
from engine import get_stadium_density, determine_route
from ai_service import ask_gemini
import asyncio
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app)

# In-memory store for incidents
incidents_db = []

@app.route("/")
def health_check():
    return jsonify({"status": "ok"})

@app.route("/api/density", methods=["GET"])
def get_density():
    return jsonify(get_stadium_density())

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.json
    if not data or not data.get("query"):
        return jsonify({"detail": "Query cannot be empty"}), 400
    
    language = data.get("language", "en")
    location = data.get("location", "")
    response = asyncio.run(ask_gemini(data["query"], language, location))
    return jsonify({"reply": response["reply"], "intent": response["intent"]})

@app.route("/api/route", methods=["POST"])
def get_route():
    data = request.json
    if not data or not data.get("current_location") or not data.get("destination"):
        return jsonify({"detail": "Location and destination are required"}), 400
        
    route, time, crowding = determine_route(
        data["current_location"], 
        data["destination"], 
        data.get("needs_wheelchair", False)
    )
    
    return jsonify({
        "route": route,
        "estimatedTime": time,
        "crowdingLevel": crowding,
        "stepFree": data.get("needs_wheelchair", False)
    })

@app.route("/api/incidents", methods=["GET"])
def get_incidents():
    # Return all active incidents sorted by newest first
    active = [i for i in incidents_db if i["status"] == "active"]
    return jsonify(sorted(active, key=lambda x: x["timestamp"], reverse=True))

@app.route("/api/incidents", methods=["POST"])
def report_incident():
    data = request.json
    if not data or not data.get("type") or not data.get("location"):
        return jsonify({"detail": "Missing type or location"}), 400
        
    incident = {
        "id": str(uuid.uuid4()),
        "type": data["type"],
        "location": data["location"],
        "timestamp": datetime.utcnow().isoformat(),
        "status": "active"
    }
    incidents_db.append(incident)
    return jsonify(incident), 201

@app.route("/api/incidents/<incident_id>/resolve", methods=["POST"])
def resolve_incident(incident_id):
    for incident in incidents_db:
        if incident["id"] == incident_id:
            incident["status"] = "resolved"
            return jsonify({"detail": "Incident resolved"})
    return jsonify({"detail": "Incident not found"}), 404

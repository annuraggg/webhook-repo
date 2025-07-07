from datetime import datetime
from flask import Blueprint, jsonify, request
from app.extensions import webhook_collection

webhook = Blueprint('Webhook', __name__, url_prefix='/webhook')

@webhook.route('/receiver', methods=["POST"])
def receiver():
    data = request.json
    event_type = request.headers.get("X-GitHub-Event")
    
    formatted_event = None
    
    if event_type == "push":
        head_commit = data.get("head_commit", {})
        author = head_commit.get("author", {}).get("username") or head_commit.get("author", {}).get("name", "Unknown")
        ref = data.get("ref", "")
        branch = ref.split("/")[-1] if ref.startswith("refs/heads/") else ref
        timestamp = head_commit.get("timestamp") or datetime.utcnow().isoformat()
        
        formatted_event = {
            "type": "push",
            "author": author,
            "to_branch": branch,
            "timestamp": timestamp
        }
    
    elif event_type == "pull_request":
        pull_request = data.get("pull_request", {})
        action = data.get("action", "")
        author = pull_request.get("user", {}).get("login", "Unknown")
        from_branch = pull_request.get("head", {}).get("ref", "")
        to_branch = pull_request.get("base", {}).get("ref", "")
        timestamp = pull_request.get("created_at") or datetime.utcnow().isoformat()
        
        # Handle different pull request actions
        if action == "opened":
            formatted_event = {
                "type": "pull_request",
                "author": author,
                "from_branch": from_branch,
                "to_branch": to_branch,
                "timestamp": timestamp,
                "action": "opened"
            }
        elif action == "closed":
            # Check if it was merged or just closed
            if pull_request.get("merged", False):
                merged_by = pull_request.get("merged_by", {}).get("login", author)
                merged_at = pull_request.get("merged_at") or datetime.utcnow().isoformat()
                formatted_event = {
                    "type": "merge",
                    "author": merged_by,
                    "from_branch": from_branch,
                    "to_branch": to_branch,
                    "timestamp": merged_at
                }
            else:
                formatted_event = {
                    "type": "pull_request",
                    "author": author,
                    "from_branch": from_branch,
                    "to_branch": to_branch,
                    "timestamp": pull_request.get("closed_at") or datetime.utcnow().isoformat(),
                    "action": "closed"
                }
    
    # Only insert if we have a valid formatted event
    if formatted_event:
        webhook_collection.insert_one(formatted_event)
        return jsonify({"status": "success", "message": "Event received"}), 200
    else:
        return jsonify({"status": "ignored", "message": f"Event type '{event_type}' not handled"}), 200

@webhook.route("/events", methods=["GET"])
def events():
    print("Fetching events from the database")
    events = list(webhook_collection.find().sort("timestamp", -1))

    # Convert ObjectId to string (serialization)
    for event in events:
        event["_id"] = str(event["_id"])

    return jsonify(events)
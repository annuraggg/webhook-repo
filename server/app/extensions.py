from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure MongoDB connection using environment variable
print("MONGO_URI:", os.getenv("MONGO_URI"))
app.config["MONGO_URI"] = os.getenv("MONGO_URI")

mongo = PyMongo(app)
db = mongo.db
webhook_collection = db['webhook']

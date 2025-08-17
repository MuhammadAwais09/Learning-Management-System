from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import json
import pickle
import numpy as np
import nltk
from nltk.tokenize import word_tokenize
from nltk.stem import SnowballStemmer
import tensorflow as tf
import random
import unicodedata

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/chat": {"origins": "*"}, r"/health": {"origins": "*"}})

# Download NLTK resources
nltk.download('punkt')

# Initialize stemmer
stemmer = SnowballStemmer("english")

# Load trained model and data
try:
    model = tf.keras.models.load_model('learnify_chatbot.h5')
    with open('words.pkl', 'rb') as f:
        words = pickle.load(f)
    with open('classes.pkl', 'rb') as f:
        classes = pickle.load(f)
    with open('learnify_intents.json', 'r', encoding='utf-8') as file:
        intents = json.load(file)
except FileNotFoundError:
    raise Exception("Model or data files missing. Run training.py first.")

# Preprocessing functions
def normalize_text(text):
    return unicodedata.normalize('NFKC', text.lower())

def tokenize_and_stem(text):
    tokens = word_tokenize(text)
    return [stemmer.stem(token) if token.isascii() else token for token in tokens]

def bag_of_words(sentence, words):
    sentence_words = tokenize_and_stem(normalize_text(sentence))
    bag = [0] * len(words)
    for s in sentence_words:
        for i, w in enumerate(words):
            if w == s:
                bag[i] = 1
    return np.array(bag)

# Predict intent and get response based on role
def get_response(user_input, role):
    if role not in ["student", "teacher"]:
        return "Please specify your role (student or teacher) to get the right help! 😊"
    
    bag = bag_of_words(user_input, words)
    prediction = model.predict(np.array([bag]), verbose=0)[0]
    predicted_class = classes[np.argmax(prediction)]
    confidence = np.max(prediction)
    
    if confidence < 0.7:  # Confidence threshold
        for intent in intents['intents']:
            if intent['tag'] == 'noanswer':
                for response in intent['responses']:
                    if response['role'] == role:
                        return response['response']
        return "Hmm, not sure what you mean! Try asking about courses or assignments, and I’ll sort you out! 😅"
    
    for intent in intents['intents']:
        if intent['tag'] == predicted_class:
            for response in intent['responses']:
                if response['role'] == role:
                    return response['response']
            # If no role-specific response, fall back to any response for the intent
            return random.choice([r['response'] for r in intent['responses']])
    
    for intent in intents['intents']:
        if intent['tag'] == 'noanswer':
            for response in intent['responses']:
                if response['role'] == role:
                    return response['response']
    return "Oops, I didn’t catch that! Tell me about your learning needs, and I’ll help! 😄"

# Route for chat interface
@app.route('/')
def chat_interface():
    return render_template('chat.html')

# API endpoint for chatbot //waiter 
@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        if not data or 'message' not in data or 'role' not in data:
            return jsonify({"error": "Message and role (student/teacher) required"}), 400
        
        user_input = data['message']
        role = data['role'].lower()
        response = get_response(user_input, role)
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Health check endpoint
@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "API is running"}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
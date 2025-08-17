import json
import pickle
import numpy as np
import nltk
from nltk.tokenize import word_tokenize
from nltk.stem import SnowballStemmer
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
import random
import unicodedata

# Download NLTK resources
nltk.download('punkt')

# Initialize stemmer (SnowballStemmer for English; basic for Urdu as NLTK doesn't support Urdu stemming)
stemmer = SnowballStemmer("english")

# Load intents file
with open('learnify_intents.json', 'r', encoding='utf-8') as file:
    intents = json.load(file)

# Preprocessing functions
def normalize_text(text):
    # Normalize Unicode characters (important for Urdu)
    return unicodedata.normalize('NFKC', text.lower())

def tokenize_and_stem(text):
    # Tokenize and stem (only for English words; Urdu words are kept as is)
    tokens = word_tokenize(text)
    return [stemmer.stem(token) if token.isascii() else token for token in tokens]

# Prepare training data
words = []
classes = []
documents = []
ignore_words = ['?', '!', '.', ',']

for intent in intents['intents']:
    for pattern in intent['patterns']:
        # Normalize and tokenize pattern
        w = tokenize_and_stem(normalize_text(pattern))
        words.extend(w)
        documents.append((w, intent['tag']))
        if intent['tag'] not in classes:
            classes.append(intent['tag'])

# Remove duplicates and ignore words
words = sorted(list(set([w for w in words if w not in ignore_words])))
classes = sorted(list(set(classes)))

# Create training data
training = []
output_empty = [0] * len(classes)

for doc in documents:
    bag = []
    pattern_words = doc[0]
    for w in words:
        bag.append(1 if w in pattern_words else 0)
    output_row = list(output_empty)
    output_row[classes.index(doc[1])] = 1
    training.append([bag, output_row])

# Shuffle and convert to numpy arrays
random.shuffle(training)
training = np.array(training, dtype=object)

train_x = np.array(list(training[:, 0]))
train_y = np.array(list(training[:, 1]))

# Build model
model = Sequential()
model.add(Dense(128, input_shape=(len(train_x[0]),), activation='relu'))
model.add(Dropout(0.5))
model.add(Dense(64, activation='relu'))
model.add(Dropout(0.5))
model.add(Dense(len(train_y[0]), activation='softmax'))

# Compile model
model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])

# Train model
model.fit(train_x, train_y, epochs=200, batch_size=5, verbose=1)

# Save model and data
model.save('learnify_chatbot.h5')
with open('words.pkl', 'wb') as f:
    pickle.dump(words, f)
with open('classes.pkl', 'wb') as f:
    pickle.dump(classes, f)

print("Training completed! Model and data saved.")
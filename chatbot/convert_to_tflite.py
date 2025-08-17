import tensorflow as tf
import pickle

# Load the trained Keras model
model = tf.keras.models.load_model('moodboost_chatbot.h5')

# Convert to TFLite
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()

# Save the TFLite model
with open('moodboost_chatbot.tflite', 'wb') as f:
    f.write(tflite_model)

print("Model converted to TFLite and saved as moodboost_chatbot.tflite")
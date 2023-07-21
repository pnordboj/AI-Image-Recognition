from flask import Flask, request
from flask_cors import CORS, cross_origin
import tensorflow as tf
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image
import io

app = Flask(__name__)
cors = CORS(app)
app.config["CORS_HEADERS"] = "Content-Type"

model = tf.keras.applications.MobileNetV2(weights="imagenet")


@app.route("/predict", methods=["POST"])
@cross_origin()
def predict():
    if "file" not in request.files:
        return "No file found"
    file = request.files["file"]
    if file.filename == "":
        return "No file found"
    if file:
        image = Image.open(io.BytesIO(file.read()))
        image = image.resize((224, 224))
        image = tf.keras.preprocessing.image.img_to_array(image)
        image = tf.keras.applications.mobilenet_v2.preprocess_input(image)
        image = np.expand_dims(image, axis=0)

        predictions = model.predict(image)
        predicted_classes = tf.keras.applications.mobilenet_v2.decode_predictions(
            predictions, top=3
        )[0]

        response = {
            "predictions": [
                {"label": label, "probability": float(prob)}
                for _, label, prob in predicted_classes
            ]
        }
        return response


if __name__ == "__main__":
    app.run(debug=True)

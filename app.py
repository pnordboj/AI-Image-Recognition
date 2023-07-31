from flask import Flask, request
from flask_cors import CORS, cross_origin
import tensorflow as tf
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image
import io
import pytube
from pytube import YouTube
import moviepy.editor as mp
from io import BytesIO
import os

import openai
import whisper

app = Flask(__name__)
CORS(app)

app.config["CORS_HEADERS"] = "Content-Type"
openai.api_key = "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"

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
        image = image.convert("RGB")
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


@app.route("/speechtotext", methods=["POST"])
@cross_origin()
def speechtotext():
    file = request.files.get("file")
    youtube_url = request.form.get("youtube_url")
    if not file and not youtube_url:
        return "No file or YouTube URL provided"
    if youtube_url:
        yt = YouTube(youtube_url)
        audio = yt.streams.get_audio_only()
        videos_dir = "./videos"
        result = audio.download(output_path=videos_dir)
    elif file.filename == "":
        return "No file found"

    print("Sending audio for transcription...")

    model = whisper.load_model("medium.en")
    transcript = model.transcribe(result)
    print("Transcription complete.")

    print("Result: " + transcript["text"])

    return {"transcript": transcript["text"]}


@app.route("/generateimage", methods=["POST"])
@cross_origin()
def generateimage():
    prompt = request.form.get("prompt")
    if not prompt:
        return "No prompt provided"
    print("Generating image...")
    response = openai.Image.create(
        prompt=prompt,
        n=1,
        size="512x512",
    )
    print("Image generated.")
    image_url = response["data"][0]["url"]
    return {"image_url": image_url}


@app.route("/texttospeech", methods=["POST"])
@cross_origin()
def texttospeech():
    text = request.form.get("text")
    if not text:
        return "No text provided"
    print("Generating speech...")

    response = openai.Completion.create(
        engine="davinci",
        prompt=text,
        temperature=0.9,
        max_tokens=60,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0.6,
        stop=["\n", " Human:", " AI:"],
    )

    print("Speech generated.")

    print("Saving speech to file...")

    with open("speech.mp3", "wb") as f:
        f.write(response["choices"][0]["text"].encode("utf-8"))

    print("Speech saved.")

    return "speech.mp3"


if __name__ == "__main__":
    app.run(debug=True)

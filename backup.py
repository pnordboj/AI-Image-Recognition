import tensorflow as tf
import matplotlib.pyplot as plt

model = tf.keras.applications.MobileNetV2(weights="imagenet")
img_paths = ["images/dog.jpg", "images/plane.jpg"]

for image_path in img_paths:
    img = tf.keras.preprocessing.image.load_img(image_path, target_size=(224, 224))
    input_image = tf.keras.preprocessing.image.img_to_array(img)
    input_image = tf.keras.applications.mobilenet_v2.preprocess_input(input_image)
    input_image = tf.expand_dims(input_image, axis=0)
    predictions = model.predict(input_image)
    predicted_classes = tf.keras.applications.mobilenet_v2.decode_predictions(
        predictions, top=3
    )[0]
    plt.imshow(img, interpolation="bicubic")
    plt.axis("off")
    plt.show()
    print("Predictions")
    print("=====================================")
    first_prediction = True
    for _, class_name, probability in predicted_classes:
        if first_prediction:
            print(f"{class_name}: {probability}")
            first_prediction = False
        else:
            print(f"{class_name}: {probability}")
    print("=====================================")
    print("\n\n")

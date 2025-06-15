from flask import Flask, request, jsonify, render_template
import joblib
import numpy as np
import json
import pandas as pd

app = Flask(__name__)

model = joblib.load("model/housing_price.pkl")

with open("static/column/columns.json", "r") as f:
    data_columns = json.load(f)["data_columns"]


@app.route("/")
def home():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    location = data.get("location", "").lower()
    sqft = float(data.get("sqft", 0))
    bath = int(data.get("bath", 0))
    bhk = int(data.get("bhk", 0))

    x = np.zeros(len(data_columns))
    x[0] = sqft
    x[1] = bath
    x[2] = bhk

    if location in data_columns:
        loc_index = data_columns.index(location)
        x[loc_index] = 1

    x = np.array([x])


    prediction = model.predict(x)[0]
    predicted_price = round(prediction, 2)

    return jsonify({"price": predicted_price})

if __name__ == "__main__":
    app.run(debug=True)
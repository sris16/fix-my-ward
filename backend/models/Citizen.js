import mongoose from "mongoose";

const citizenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true,
    unique: true
  }
});

/* SAFE MODEL EXPORT */

const Citizen =
  mongoose.models.Citizen ||
  mongoose.model("Citizen", citizenSchema);

export default Citizen;
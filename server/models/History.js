import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  originalCode: {
    type: String,
    required: true,
  },

  output: {
    type: String,
    required: true,
  },

  sourceLang: String,
  targetLang: String,

  // 🔥 FIX — THIS WAS BREAKING YOUR APP
  type: {
    type: String,
    default: "run",
  },

  isFavorite: {
    type: Boolean,
    default: false,
  },

}, { timestamps: true });

export default mongoose.model("History", historySchema);
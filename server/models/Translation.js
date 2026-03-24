import mongoose from "mongoose";

const translationSchema = new mongoose.Schema(
  {
    sourceLang: String,
    targetLang: String,
    originalCode: String,
    translatedCode: String
  },
  { timestamps: true }
);

export default mongoose.model("Translation", translationSchema);
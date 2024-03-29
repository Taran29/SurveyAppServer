import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique: true,
  },
  numberOfSurveys: {
    type: Number,
    default: 0
  },
})

const Category = mongoose.model('category', categorySchema)

export {
  Category,
}
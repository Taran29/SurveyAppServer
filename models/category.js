import mongoose from "mongoose";
import Joi from "joi";

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
  surveys: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'survey',
    default: []
  }],
})

categorySchema.index({ name: 1 })

const Category = mongoose.model('category', categorySchema)

const validateCategory = (category) => {
  const schema = Joi.object({
    category: Joi.string().max(20).required(),
  })

  return schema.validate(category, { allowUnknown: true })
}

export {
  Category,
  validateCategory
}
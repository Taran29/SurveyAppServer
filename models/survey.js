import mongoose from 'mongoose'
import Joi from 'joi'

const SurveySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50
  },
  category: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50
  },
  private: {
    type: Boolean,
    required: true,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: new Date(Date.now())
  },
  questions: {
    type: [{
      question: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 50
      },
      options: [String]
    }]
  }
})

const Survey = mongoose.model('survey', SurveySchema)

const validateSurvey = (survey) => {

  let isValid = mongoose.Types.ObjectId
  isValid.isValid(survey.createdBy)

  if (!isValid) return false

  const schema = Joi.object({
    title: Joi.string().min(1).max(50).required(),
    category: Joi.string().min(1).max(50).required(),
    private: Joi.boolean().default(false).required(),
    createdAt: Joi.date().required(),
    questions: Joi.array().items({
      question: Joi.string().min(1).max(50).required(),
      options: Joi.array().items(Joi.string())
    })
  })

  return schema.validate(survey, { allowUnknown: true })
}

export {
  Survey,
  validateSurvey
} 
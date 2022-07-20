import mongoose from 'mongoose'
import Joi from 'joi'
import jwt from 'jsonwebtoken'
import { Survey } from './survey.js'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 5,
    maxlength: 25,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  securityQuestion: {
    type: String,
    required: true
  },
  securityAnswer: {
    type: String,
    required: true
  },
  createdSurveys: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  createdSurveyCount: {
    type: Number,
    default: 0
  },
  filledSurveys: {
    type: [{
      surveyID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'survey'
      },
      questions: {
        type: [{
          questionIndex: {
            type: Number,
            required: true
          },
          option: Number
        }],
        required: true
      }
    }],
    default: []
  },
  filledSurveyCount: {
    type: Number,
    default: 0
  }
})

userSchema.methods.generateAuthToken = function () {
  return jwt.sign({
    _id: this._id,
    email: this.email
  }, process.env.JWT_PRIVATE_KEY)
}

const User = mongoose.model('user', userSchema)

const validateUser = (user) => {
  const schema = Joi.object({
    name: Joi.string().min(5).max(25).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(24).required(),
    securityQuestion: Joi.string().min(3).max(50).required(),
    securityAnswer: Joi.string().min(1).max(30).required()
  })

  return schema.validate(user)
}

export {
  User,
  validateUser
}


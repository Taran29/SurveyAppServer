import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 5,
    maxlength: 25,
    required: true
  },
  userName: {
    type: String,
    unique: true,
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
  createdSurveys: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  filledSurveys: {
    type: [{
      surveyID: {
        type: String,
        required: true
      },
      questions: {
        type: [{
          questionIndex: {
            type: Number,
            required: true
          },
          options: [Number]
        }],
        required: true
      }
    }]
  }
})

const User = mongoose.Model('user', userSchema)

export default User


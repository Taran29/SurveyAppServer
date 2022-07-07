import express from 'express'
import auth from '../middlewares/auth.js'
import { Survey, validateSurvey } from '../models/survey.js'
import { User } from '../models/user.js'
import jwt from 'jsonwebtoken'

const router = express.Router()

router.get('/', async (req, res) => {
  let surveys = await Survey.find({ private: false })
  if (!req.header('x-auth-token')) {
    return res.status(200).send({
      body: surveys
    })
  }

  let payload
  try {
    payload = jwt.verify(req.header('x-auth-token'), process.env.JWT_PRIVATE_KEY)
  } catch (ex) {
    return res.status(400).send({
      message: 'Invalid token'
    })
  }

  const user = await User.findById(payload._id)

  const filledSurveys = user.filledSurveys.map((fs) => {
    return fs.surveyID
  })

  const createdSurveys = user.createdSurveys

  if (filledSurveys.length > 0) {
    surveys = surveys.filter((survey) => {
      let isReturn = false
      filledSurveys.forEach((fs) => {
        if (fs != survey._id) {
          isReturn = true
        }
      })

      if (isReturn) {
        return survey
      }
    })
  }

  if (createdSurveys.length > 0) {
    surveys = surveys.filter((survey) => {
      return !createdSurveys.includes(survey._id)
    })
  }

  return res.status(200).send({
    body: surveys
  })
})

router.post('/create', auth, async (req, res) => {
  const { error } = validateSurvey(req.body)

  if (error) {
    return res.status(400).send({ message: error.details[0].message })
  }

  let questionsArr = req.body.questions.map((ques, index) => {
    let obj = {
      question: ques.question,
      options: ques.options.map((opt, idx) => {
        return {
          option: opt,
          numberOfTimesChosen: 0
        }
      })
    }
    return obj
  })

  const survey = new Survey({
    title: req.body.title,
    category: req.body.category,
    private: req.body.private,
    createdBy: req.body.createdBy,
    createdAt: req.body.createdAt,
    questions: questionsArr
  })

  let result

  try {
    result = await survey.save()
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        createdSurveys: result._id
      },
    })
  } catch (ex) {
    return res.status(404).send({ message: 'Cannot connect to database right now.' })
  }


  res.status(200).send({
    result: result,
    message: 'Survey created successfully.'
  })
})

router.delete('/:surveyID', auth, async (req, res) => {
  const surveyID = req.params.surveyID

  let survey
  try {
    survey = await Survey.findById(surveyID)
  } catch (ex) {
    return res.status(400).send({
      message: 'Survey with the given ID does not exist.'
    })
  }

  if (req.user._id != survey.createdBy) {
    return res.status(401).send({
      message: 'Unauthorized operation. The survey you are trying to delete is not yours.'
    })
  }

  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: {
        createdSurveys: surveyID
      }
    })

    await Survey.findByIdAndDelete(surveyID)
    res.status(200).send({
      message: 'Survey deleted successfully.'
    })
  } catch (ex) {
    res.status(404).send({
      message: 'Network Error. Cannot connect to database'
    })
  }
})

export default router
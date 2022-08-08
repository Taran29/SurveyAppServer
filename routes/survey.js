import express from 'express'
import auth from '../middlewares/auth.js'
import { Survey, validateSurvey } from '../models/survey.js'
import { User } from '../models/user.js'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { Category } from '../models/category.js'

const router = express.Router()

router.get('/page/:pageNumber', async (req, res) => {
  const pageNumber = parseInt(req.params.pageNumber)
  const pageSize = 10
  let surveys = await Survey
    .find({ private: false })
    .populate('category', 'category')
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)

  let count = await Survey.countDocuments({ private: false })
  let totalPages = Math.ceil(count / pageSize)
  if (!req.header('x-auth-token')) {
    return res.status(200).send({
      body: {
        surveys: surveys,
        totalPages: totalPages
      }
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
    return mongoose.Types.ObjectId(fs.surveyID)
  })

  const createdSurveys = user.createdSurveys

  const filterObj = {
    private: false,
    _id: { $nin: [...filledSurveys, ...createdSurveys] },
  }
  surveys = await Survey
    .find(filterObj)
    .populate('category', 'category')
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
  count = await Survey.countDocuments(filterObj)
  totalPages = Math.ceil(count / pageSize)

  return res.status(200).send({
    body: {
      surveys: surveys,
      totalPages: totalPages
    }
  })
})

router.get('/:id', auth, async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id).populate('category', 'category')
    if (survey.createdBy == req.user._id) {
      return res.status(307).send({
        message: 'Cannot fill your own survey.'
      })
    }

    return res.status(200).send({
      message: 'Survey found',
      body: {
        title: survey.title,
        category: survey.category.category,
        questions: survey.questions
      }
    })
  } catch (ex) {
    return res.status(400).send({
      message: 'Could not find survey with given ID.'
    })
  }
})

router.post('/create', auth, async (req, res) => {
  const { error } = validateSurvey(req.body)

  if (error) {
    return res.status(400).send({ message: error.details[0].message })
  }

  let questionsArr = req.body.questions.map((ques) => {
    let obj = {
      question: ques.question,
      options: ques.options.map((opt) => {
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

  try {
    const result = await survey.save()
    await Category.findByIdAndUpdate(req.body.category, {
      $push: {
        surveys: result._id
      },
      $inc: {
        numberOfSurveys: 1
      }
    })
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        createdSurveys: result._id
      },
      $inc: {
        createdSurveyCount: 1
      }
    })
    res.status(200).send({
      result: result,
      message: 'Survey created successfully.'
    })
  } catch (ex) {
    return res.status(404).send({ message: 'Cannot connect to database right now.' })
  }
})

router.post('/fill/:id', auth, async (req, res) => {
  let selections = req.body.userSelections
  let incObj = { 'numberOfTimesFilled': 1 }
  const questions = []
  for (const selection in selections) {
    incObj[`questions.${selection}.options.${selections[selection]}.numberOfTimesChosen`] = 1
    questions.push({ questionIndex: selection, option: selections[selection] })
  }

  const fillObj = {
    surveyID: req.params.id,
    questions: questions
  }

  try {
    await Survey.findByIdAndUpdate(req.params.id, {
      $inc: incObj
    })

    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        filledSurveys: fillObj
      },
      $inc: {
        filledSurveyCount: 1
      }
    })

    return res.status(200).send({ message: 'Survey filled successfully.' })
  } catch (ex) {
    return res.status(502).send({ message: 'Cannot connect to database right now.' })
  }
})

export default router
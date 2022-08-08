import express from 'express'
import auth from '../middlewares/auth.js'
import { User } from '../models/user.js'
import { Survey } from '../models/survey.js'

const router = express.Router()

router.get('/createdSurveys/page/:pageNumber', auth, async (req, res) => {
  const pageNumber = parseInt(req.params.pageNumber)
  const pageSize = 10

  try {
    const createdSurveys = await User
      .findById(req.user._id)
      .select({
        "createdSurveys": { "$slice": [(pageNumber - 1) * pageSize, pageSize] },
        "createdSurveyCount": 1,
        "_id": 0
      })
      .populate({
        path: 'createdSurveys',
        select: 'title category',
      })

    const count = createdSurveys.createdSurveyCount
    const totalPages = Math.ceil(count / pageSize)

    let createdSurveyInfo = createdSurveys.createdSurveys.map((survey) => {
      return {
        _id: survey._id,
        title: survey.title,
        category: survey.category
      }
    })

    return res.status(200).send({
      body: {
        createdSurveys: createdSurveyInfo,
        totalPages: totalPages
      }
    })
  } catch (ex) {
    return res.status(502).send({ message: 'Cannot connect to database.' })
  }
})

router.get('/filledSurveys/page/:pageNumber', auth, async (req, res) => {
  const pageNumber = parseInt(req.params.pageNumber)
  const pageSize = 10

  try {
    const filledSurveys = await User
      .findById(req.user._id)
      .select({
        "filledSurveys": { "$slice": [(pageNumber - 1) * pageSize, pageSize] },
        "filledSurveyCount": 1
      })
      .populate({
        path: 'filledSurveys.surveyID',
        select: 'title category',
      })

    let count = filledSurveys.filledSurveyCount
    let totalPages = Math.ceil(count / pageSize)

    let filledSurveyInfo = filledSurveys.filledSurveys.map((survey) => {
      return {
        _id: survey.surveyID._id,
        title: survey.surveyID.title,
        category: survey.surveyID.category,
      }
    })

    return res.status(200).send({
      body: {
        surveys: filledSurveyInfo,
        totalPages: totalPages
      }
    })
  } catch (ex) {
    console.log(ex)
    return res.status(502).send({ message: 'Cannot connect to database.' })
  }
})

router.get('/filledSurvey/:surveyID', auth, async (req, res) => {
  try {
    const filledSurveys = await User.findById(req.user._id, 'filledSurveys')
    const survey = await Survey
      .findById(req.params.surveyID)
      .select('questions title category')

    let selections
    filledSurveys.filledSurveys.forEach((survey) => {
      if (survey.surveyID == req.params.surveyID) {
        selections = survey.questions
      }
    })
    return res.status(200).send({
      body: {
        survey: {
          title: survey.title,
          category: survey.category,
          questions: survey.questions
        },
        selections: selections
      }
    })
  } catch (ex) {
    return res.status(502).send({
      message: 'Cannot connect to the database right now'
    })
  }
})

router.get('/stats/:id', auth, async (req, res) => {
  try {
    const survey = await Survey
      .findById(req.params.id)
      .select({
        'title': 1,
        'category': 1,
        'numberOfTimesFilled': 1,
        'questions': 1,
        'createdBy': 1,
      })

    if (!survey) {
      return res.status(400).send({ message: 'Survey does not exist' })
    }

    if (survey.createdBy != req.user._id) {
      return res.status(401).send({ message: 'Cannot view stats of a survey that is not yours.' })
    }

    return res.status(200).send({
      body: {
        survey: {
          _id: survey._id,
          title: survey.title,
          category: survey.category,
          numberOfTimesFilled: survey.numberOfTimesFilled,
          questions: survey.questions
        }
      },
    })
  } catch (ex) {
    return res.status(502).send({ message: 'Cannot connect to database.' })
  }
})

export default router
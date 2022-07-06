import express from 'express'
import auth from '../middlewares/auth.js'
import { Survey, validateSurvey } from '../models/survey.js'
import { User } from '../models/user.js'

const router = express.Router()

router.post('/create', auth, async (req, res) => {
  const { error } = validateSurvey(req.body)

  if (error) {
    return res.status(400).send({ message: error.details[0].message })
  }


  const survey = new Survey({
    title: req.body.title,
    category: req.body.category,
    createdBy: req.body.createdBy,
    createdAt: req.body.createdAt,
    questions: req.body.questions
  })

  const result = await survey.save()
  const r = await User.findByIdAndUpdate(req.user._id, {
    $push: {
      createdSurveys: result._id
    },
  }, { new: true })
  console.log(r)

  res.status(200).send({
    result: result,
    message: 'Survey created successfully.'
  })
})

export default router
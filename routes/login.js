import { User } from '../models/user.js'
import _ from 'lodash'
import bcrypt from 'bcrypt'
import express from 'express'

const router = express.Router()

router.post('/', async (req, res) => {
  const user = await User.findOne({ email: req.body.email })
  if (!user) {
    return res.status(400).send('Invalid email or password')
  }

  const validPassword = await bcrypt.compare(req.body.password, user.hashedPassword)

  if (!validPassword) {
    return res.status(400).send('Invalid email or password')
  }

  const result = _.pick(user, ['_id', 'name', 'email', 'createdSurveys', 'filledSurveys'])
  const token = user.generateAuthToken()

  res.setHeader("Access-Control-Expose-Headers", "x-auth-token");
  res.setHeader('x-auth-token', token).status(200).send({
    message: 'User logged in successfully',
    result: result
  })
})

export default router
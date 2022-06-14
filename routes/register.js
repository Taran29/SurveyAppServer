import express from 'express'
import { User, validateUser } from '../models/user.js'
import bcrypt from 'bcrypt'
import _ from 'lodash'

const router = express.Router()

router.post('/', async (req, res) => {
  const existingUser = await User.findOne({ email: req.body.email })
  if (existingUser) {
    return res.status(400).send('User already exists')
  }

  const { error } = validateUser(req.body)
  if (error) {
    return res.status(400).send(error.details[0].message)
  }

  const salt = await bcrypt.genSalt(10)
  const hashed = await bcrypt.hash(req.body.password, salt)

  const user = new User({
    name: req.body.name,
    userName: req.body.userName,
    email: req.body.email,
    hashedPassword: hashed,
  })

  try {
    let result = await user.save()
    result = _.pick(result, ['_id', 'name', 'userName', 'email'])

    const token = user.generateAuthToken()
    res.header('x-auth-token', token).status(200).send(result)
  } catch (ex) {
    res.status(404).send(ex)
  }
})

export default router
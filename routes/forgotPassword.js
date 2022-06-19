import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { User } from '../models/user.js'

const router = express.Router()

router.get('/user/:email', async (req, res) => {
  const result = await User.findOne({ email: req.params.email }).select('securityQuestion -_id')
  if (!result) {
    return res.status(400).send({
      message: 'User does not exist. Please register.'
    })
  }

  return res.status(200).send({
    message: 'User exists',
    securityQuestion: result.securityQuestion
  })
})

router.post('/', async (req, res) => {
  const user = await User.findOne({ email: req.body.email })

  if (!user) {
    return res.status(400).send({
      message: 'User does not exist, please make an account'
    })
  }
  const isValid = await bcrypt.compare(req.body.answer, user.securityAnswer)

  if (!isValid) {
    return res.status(401).send({
      message: 'Answer is wrong'
    })
  }

  const token = jwt.sign({
    _id: user._id,
  }, process.env.JWT_PRIVATE_KEY)
  res.setHeader("Access-Control-Expose-Headers", "x-forgot-password-token");
  res.setHeader('x-forgot-password-token', token)
  res.status(200).send({
    message: 'Answer is correct'
  })
})

router.post('/setNewPassword', async (req, res) => {
  if ((req.body.newPassword.length < 8) || (req.body.newPassword.length > 24)) {
    return res.status(400).send({
      message: 'Password must be between 8 and 24 characters long'
    })
  }

  const token = req.header('x-forgot-password-token')
  if (!token) {
    return res.status(401).send({
      message: 'Access denied. No token provided'
    })
  }

  let payload
  try {
    payload = jwt.verify(token, process.env.JWT_PRIVATE_KEY)
  } catch (ex) {
    return res.status(402).send({
      message: 'Invalid token'
    })
  }

  const salt = await bcrypt.genSalt(10)
  const hashed = await bcrypt.hash(req.body.newPassword, salt)

  try {
    const user = await User.findByIdAndUpdate(payload._id, {
      $set: {
        hashedPassword: hashed
      }
    }, { new: true })

    return res.status(200).send({
      message: 'Password reset successful.',
      result: {
        email: user.email
      }
    })
  } catch (ex) {
    return res.status(500).send({
      message: 'Connection error'
    })
  }

})

export default router
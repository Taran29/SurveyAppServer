import express from 'express'
import mongoose from 'mongoose'
import { config } from 'dotenv'
import register from './routes/register.js'
import login from './routes/login.js'

config()

const app = express()
app.use(express.json())
app.use('/api/register', register)
app.use('/api/login', login)

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB...")
  }).catch((err) => {
    console.error(err)
  })

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
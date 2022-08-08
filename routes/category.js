import express from 'express'
import { Category } from '../models/category.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const result = await Category
      .find({})
      .sort({ numberOfSurveys: -1, category: 1 })
      .select('category')
    return res.status(200).send({ body: result })
  } catch (ex) {
    return res.status(502).send({ message: 'Cannot reach database' })
  }
})

export default router
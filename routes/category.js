import express from 'express'
import auth from '../middlewares/auth.js'
import { Category, validateCategory } from '../models/category.js'

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

router.post('/', auth, async (req, res) => {
  const { error } = validateCategory(req.body)
  if (error) {
    return res.status(400).send({ message: error.details[0].message })
  }

  try {
    const category = new Category({
      category: req.body.category
    })

    await category.save()
    return res.status(200).send({ message: 'Category created successfully.' })
  } catch (ex) {
    if (ex.code === 11000) {
      return res.status(400).send({ message: 'Category already exists.' })
    }
    return res.status(502).send({ message: 'Cannot reach database.' })
  }
})

export default router
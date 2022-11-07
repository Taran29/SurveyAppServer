import express from 'express'
import Block from '../models/blocks.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const blocks = await Block.find();
    res.status(200).send(blocks[0].blocks)
  } catch (ex) {
    console.log(ex)
  }
})

router.post('/', async(req, res) => {
  await Block.deleteMany()
  try {
    const blocks = new Block({
      blocks: req.body.blocks
    })
    const result = await blocks.save()
    return res.status(200).send(blocks)
  } catch (ex) {
    console.log(ex)
  }
})

export default router
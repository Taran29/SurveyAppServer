import mongoose from 'mongoose'

const blockSchema = new mongoose.Schema({
  blocks: {
    type: []
  }
})

const Block = mongoose.model('block', blockSchema)

export default Block
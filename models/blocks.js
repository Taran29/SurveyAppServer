import mongoose from 'mongoose'

const blockSchema = new mongoose.Schema({
  blocks: {
    
  }
})

const Block = mongoose.model('block', blockSchema)

export {
  Block,
}
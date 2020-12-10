const mongoose = require('mongoose');

const Article = require('./Article');

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  articles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }]
}, {timestamps: true});


const Author = mongoose.model('Author', authorSchema);

module.exports = Author;

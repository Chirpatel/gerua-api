const mongoose = require('mongoose');
const data =  new mongoose.Schema({
    name: String,
    categories: String,
    price: Number,
    images: {
      thumImg: String,
      medImg:String,
      img: String
    },
    date: {type: Date, default: Date.now}
});

module.exports =  mongoose.model('data',data);
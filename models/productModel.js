const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  brand: {
    type: String,
    required: true,
  },
  mrp: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  packsize: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  availability: {
    type: Boolean,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
},{versionKey:false});
let productModel = mongoose.model('products', productSchema);
module.exports = productModel


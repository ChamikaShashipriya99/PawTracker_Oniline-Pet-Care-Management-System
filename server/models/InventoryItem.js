const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: String,
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

module.exports = mongoose.model('InventoryItem', InventoryItemSchema);
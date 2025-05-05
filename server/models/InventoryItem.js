import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: String,
  quantity: { type: Number, required: true, default: 0 },
  price: { type: Number, required: true, default: 0 }
}, { timestamps: true });

export default mongoose.model('InventoryItem', inventoryItemSchema);
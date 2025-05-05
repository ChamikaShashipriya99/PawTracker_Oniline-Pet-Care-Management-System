import express from 'express';
import Inventory from '../models/Inventory.js';

const router = express.Router();

// Get all items
router.get('/', async (req, res) => {
  try {
    const items = await Inventory.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new item
router.post('/', async (req, res) => {
  const item = new Inventory({
    name: req.body.name,
    category: req.body.category,
    description: req.body.description,
    quantity: req.body.quantity,
    price: req.body.price
  });

  try {
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update item
router.put('/:id', async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete item
router.delete('/:id', async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Stock entry
router.post('/:id/stock', async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    item.quantity += Number(req.body.amount);
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
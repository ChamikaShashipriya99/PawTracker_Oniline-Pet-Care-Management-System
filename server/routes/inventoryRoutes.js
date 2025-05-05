const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');

// Get all inventory items
router.get('/', async (req, res) => {
    try {
        const items = await Inventory.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add new inventory item
router.post('/', async (req, res) => {
    try {
        // Extract image data from request body
        const { name, category, description, quantity, price, image } = req.body;
        
        // Create new inventory item with image
        const item = new Inventory({
            name,
            category,
            description,
            quantity,
            price,
            image // Save the base64 image string
        });

        const newItem = await item.save();
        res.status(201).json(newItem);
    } catch (err) {
        console.error('Error saving item:', err);
        res.status(400).json({ message: err.message });
    }
});

// Update inventory item
router.put('/:id', async (req, res) => {
    try {
        const item = await Inventory.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Update all fields including image
        const { name, category, description, quantity, price, image } = req.body;
        if (name) item.name = name;
        if (category) item.category = category;
        if (description) item.description = description;
        if (quantity !== undefined) item.quantity = quantity;
        if (price !== undefined) item.price = price;
        if (image) item.image = image; // Update image if provided

        const updatedItem = await item.save();
        res.json(updatedItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete inventory item
router.delete('/:id', async (req, res) => {
    try {
        const result = await Inventory.deleteOne({ _id: req.params.id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ message: 'Item deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update stock
router.post('/:id/stock', async (req, res) => {
    try {
        const item = await Inventory.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        const amount = parseInt(req.body.amount);
        if (isNaN(amount)) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        item.quantity += amount;
        const updatedItem = await item.save();
        res.json(updatedItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get single inventory item
router.get('/:id', async (req, res) => {
    try {
        const item = await Inventory.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router; 
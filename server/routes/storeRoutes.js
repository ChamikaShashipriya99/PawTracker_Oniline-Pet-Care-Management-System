import express from 'express';
import Inventory from '../models/Inventory.js';

const router = express.Router();

// GET all inventory items for store
router.get('/inventory', async (req, res) => {
    try {
        const items = await Inventory.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router; 
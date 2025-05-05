import express from 'express';
const router = express.Router();

// GET all inventory items for store
router.get('/inventory', async (req, res) => {
    try {
        res.json({ message: 'Store inventory endpoint' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router; 
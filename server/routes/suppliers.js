import express from 'express';
import Supplier from '../models/Supplier.js';

const router = express.Router();

// Get all suppliers
router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (err) {
    console.error('Error fetching suppliers:', err);
    res.status(500).json({ message: 'Failed to fetch suppliers' });
  }
});

// Add a new supplier
router.post('/', async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.name || !req.body.email) {
      return res.status(400).json({ message: 'Name and email are required fields' });
    }

    // Check if email already exists
    const existingSupplier = await Supplier.findOne({ email: req.body.email });
    if (existingSupplier) {
      return res.status(400).json({ message: 'A supplier with this email already exists' });
    }

    console.log('Received logo data length:', req.body.logo ? req.body.logo.length : 0);

    const supplier = new Supplier({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone || '',
      address: req.body.address || '',
      products: req.body.products || '',
      logo: req.body.logo || ''
    });

    const newSupplier = await supplier.save();
    console.log('Saved supplier with logo:', newSupplier.logo ? 'Logo present' : 'No logo');
    res.status(201).json(newSupplier);
  } catch (err) {
    console.error('Error adding supplier:', err);
    res.status(400).json({ message: err.message || 'Failed to add supplier' });
  }
});

// Update a supplier
router.put('/:id', async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.name || !req.body.email) {
      return res.status(400).json({ message: 'Name and email are required fields' });
    }

    // Check if email already exists for other suppliers
    const existingSupplier = await Supplier.findOne({ 
      email: req.body.email,
      _id: { $ne: req.params.id }
    });
    if (existingSupplier) {
      return res.status(400).json({ message: 'A supplier with this email already exists' });
    }

    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    // Update supplier fields
    supplier.name = req.body.name;
    supplier.email = req.body.email;
    supplier.phone = req.body.phone || '';
    supplier.address = req.body.address || '';
    supplier.products = req.body.products || '';
    supplier.logo = req.body.logo || '';
    
    // Update status if provided, otherwise keep existing status
    if (req.body.status) {
      supplier.status = req.body.status;
    }

    const updatedSupplier = await supplier.save();
    res.json(updatedSupplier);
  } catch (err) {
    console.error('Error updating supplier:', err);
    res.status(400).json({ message: err.message || 'Failed to update supplier' });
  }
});

// Delete a supplier
router.delete('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    await Supplier.deleteOne({ _id: req.params.id });
    res.json({ message: 'Supplier deleted successfully' });
  } catch (err) {
    console.error('Error deleting supplier:', err);
    res.status(500).json({ message: err.message || 'Failed to delete supplier' });
  }
});

export default router; 
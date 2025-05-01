import express from 'express';
import Pet from '../models/Pet.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all pets
router.get('/', async (req, res) => {
  try {
    const pets = await Pet.find().populate('owner', 'firstName lastName email');
    res.json(pets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single pet
router.get('/:id', async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id).populate('owner', 'firstName lastName email');
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    res.json(pet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new pet
router.post('/', auth, async (req, res) => {
  try {
    const pet = new Pet({
      ...req.body,
      owner: req.user._id
    });
    await pet.save();
    res.status(201).json(pet);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a pet
router.put('/:id', auth, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    if (pet.owner.toString() !== req.user._id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    Object.assign(pet, req.body);
    await pet.save();
    res.json(pet);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a pet
router.delete('/:id', auth, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    if (pet.owner.toString() !== req.user._id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await pet.remove();
    res.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vaccination routes
router.get('/:petId/vaccinations', auth, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.petId);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    res.json(pet.vaccinations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:petId/vaccinations', auth, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.petId);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    if (pet.owner.toString() !== req.user._id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    pet.vaccinations.push(req.body);
    await pet.save();
    res.status(201).json(pet.vaccinations[pet.vaccinations.length - 1]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:petId/vaccinations/:vaccinationId', auth, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.petId);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    if (pet.owner.toString() !== req.user._id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const vaccination = pet.vaccinations.id(req.params.vaccinationId);
    if (!vaccination) {
      return res.status(404).json({ error: 'Vaccination not found' });
    }
    Object.assign(vaccination, req.body);
    await pet.save();
    res.json(vaccination);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:petId/vaccinations/:vaccinationId', auth, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.petId);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    if (pet.owner.toString() !== req.user._id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    pet.vaccinations.id(req.params.vaccinationId).remove();
    await pet.save();
    res.json({ message: 'Vaccination deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 
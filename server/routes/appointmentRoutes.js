// // server/routes/appointmentRoutes.js
// const express = require('express');
// const router = express.Router();
// const appointmentController = require('../Controllers/appointmentController');

// // GET all appointments (used by MyAppointments.js and AdminAppointments.js)
// router.get('/', appointmentController.getAllAppointments);

// // GET user appointments (not currently used by frontend, but keeping for future use)
// router.get('/user', appointmentController.getUserAppointments);

// // GET single appointment by ID (used by ViewAppointment.js and EditAppointment.js)
// router.get('/:id', appointmentController.getAppointment);

// // POST new appointment (used by BookAppointment.js)
// router.post('/', appointmentController.createAppointment);

// // PUT update appointment (used by EditAppointment.js and AdminAppointments.js for status updates)
// router.put('/:id', appointmentController.updateAppointment);

// // DELETE appointment (used by MyAppointments.js)
// router.delete('/:id', appointmentController.deleteAppointment);

// module.exports = router;

const express = require('express');
const router = express.Router();
const appointmentController = require('../Controllers/appointmentController');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

router.get('/', appointmentController.getAppointments);
router.get('/:id', appointmentController.getAppointment);
router.post('/', appointmentController.createAppointment);
router.put('/:id', appointmentController.updateAppointment);
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router;
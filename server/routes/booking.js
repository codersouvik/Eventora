const express = require('express');
const router = express.Router();
const {protect,admin} = require('../middleware/auth.js');
const {bookEvent,sendBookingOtp,getMyBookings,confirmBooking,cancelBooking, getAllBookings} = require('../controller/bookingcontroller.js')

router.post('/',protect,bookEvent);
router.post('/send-otp',protect,sendBookingOtp);
router.get('/my',protect, getMyBookings);
router.get('/', protect, admin, getAllBookings);
router.put('/:id/confirm',protect,admin,confirmBooking);
router.delete('/:id',protect,cancelBooking)


module.exports = router;
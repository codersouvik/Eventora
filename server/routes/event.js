const express = require('express');
const router = express.Router();

const {protect,admin} = require('../middleware/auth.js')
const {getAllEvents,getEventbyId,createEvent,updateEvent,deleteEvent} = require("../controller/eventcontroller.js")

router.get('/',getAllEvents);
router.get('/:id',getEventbyId);
router.post('/',protect,admin,createEvent);
router.put('/:id',protect,admin,updateEvent);
router.delete('/:id',protect,admin,deleteEvent);

module.exports = router;
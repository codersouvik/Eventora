
const Event = require('../models/Event.js')


exports.getAllEvents = async (req, res) => {
    try {
        const filters = {};
        if (req.query.category) {
            filters.category = req.query.category;
        }
        if (req.query.ticketPrice) {
            filters.ticketPrice = req.query.ticketPrice;
        }

        const events = await Event.find(filters);
        res.json(events)
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}


exports.getEventbyId = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' })
        }
        res.status(201).json(event)
    }
    catch (error) {
        res.status(500).json({ error: error.message })
    }
}


exports.createEvent = async (req, res) => {
    const { title, description, date, location, category, totalSeats, ticketPrice, imageUrl } = req.body;
    try {
        const event = await Event.create({
            title,
            description,
            date,
            location,
            category,
            totalSeats,
            availableSeats: totalSeats,
            ticketPrice: ticketPrice || 0,
            imageUrl,
            createdBy: req.user.id
        })

        res.status(201).json(event)
    }
    catch (error) {
      
        res.status(500).json({ error: error.message })
    }
}

exports.updateEvent = async (req, res) => {
    const { title, description, date, location, category, totalSeats, ticketPrice, imageUrl } = req.body;

    try {
        const event = await Event.findByIdAndUpdate(req.params.id, {
            title,
            description,
            date,
            location,
            category,
            totalSeats,
            ticketPrice,
            imageUrl
        }, { new: true });

        if (!event) {
            return res.status(404).json({ error: 'Event not found' })
        }

        res.status(201).json(event)

    }
    catch (error) {
        res.status(500).json({ error: error.message })
    }
}

exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(400).json({ error: 'Event not found' })
        }
        res.json({ message: "Event deleted Successfully" })
    }
    catch (error) {
        res.status(500).json({ error: error.message })
    }
}
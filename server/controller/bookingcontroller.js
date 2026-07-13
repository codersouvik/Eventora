const Booking = require('../models/Booking.js');
const Otp = require('../models/Otp.js');
const Event = require('../models/Event.js');
const  {sendOtpEmail,sendBookingEmail} =  require('../utils/email');


const generateOtp = ()=>{
    return Math.floor(100000 + Math.random() * 900000).toString();
}
exports.sendBookingOtp = async(req,res)=>{
    const otp = generateOtp();
    await Otp.findOneAndDelete({email:req.user.email,action:'event_booking'});
    await Otp.create({email:req.user.email,otp:otp,action:'event_booking'});
    await sendOtpEmail(req.user.email,otp,'event_booking');
    res.json({message:'Otp send to mail'})
}
exports.bookEvent = async(req,res)=>{
    const {eventId,otp} = req.body;

    const otprecord = await Otp.findOne({email:req.user.email,otp,action:'event_booking'});
    if(!otprecord){
        return res.status(400).json({error:"Invalid or expired Otp"})
    }

    const event = await Event.findById(eventId);
    if(!event){
        return res.status(400).json({error:'Event not found'});
    }

    if(event.availableSeats<=0)
    {
        return res.status(400).json({error:'No Seats Available'})
    }

    const existingBooking = await Booking.findOne({userId:req.user.id,eventId});
    if(existingBooking)
    {
        return res.status(400).json({error:'You have already booked this event'});
    }

    const booking = await Booking.create({
        userId:req.user._id,
        eventId,
        amount:event.ticketPrice,
        status:'pending',
        paymentStatus:'non_paid'
    })

    await Otp.deleteMany({email:req.user.email,action:'event_booking'});
    await sendBookingEmail(req.user.email,event.title,booking._id);
    res.status(201).json({message:"Booking created.Please check your email for confirmation"})

}

exports.confirmBooking = async(req,res)=>{
    const paymentStatus =  req.body.paymentStatus;
    if(!['paid','non_paid'].includes(paymentStatus)){
        return res.status(400).json({error:'Invalid Payment status'})
    }

    const booking = await Booking.findById(req.params.id).populate('eventId').populate('userId');
    if(!booking)
    {
        return res.status(404).json({error:'Booking not found'});
    }

    if(booking.status === 'confirmed'){
        return res.status(400).json({error:'Booking is already confirmed'})
    }

    const event = await Event.findById(booking.eventId._id);
    if(event.availableSeats <= 0){
        return res.status(400).json({error:'No Seats Available'})
    }

    booking.status = 'confirmed';
    if(paymentStatus){
        booking.paymentStatus = paymentStatus;
    }

    await booking.save();
    event.availableSeats  -=1;
    await event.save();
    await sendBookingEmail(booking.userId.email,event.title,booking._id); 

    res.json({message:'Booking Confirmed'})
}

exports.getMyBookings = async(req,res)=>{
    const bookings = await Booking.find({userId:req.user._id}).populate('eventId');
    res.json(bookings);
}

exports.cancelBooking = async(req,res)=>{
    const booking = await Booking.findById(req.params.id);
    if(!booking)
    {
        return res.status(404).json({message:'Booking not found'})
    }
    if(booking.userId.toString() !== req.user._id.toString())
    {
        return res.status(403).json({error:'Unauthorized'})
    }
    if(booking.status === 'cancelled')
    {
        return res.status(400).json({message:"Already Cancelled"})
    }

    const wasConfirmed = booking.status === 'confirmed';

    booking.status = 'cancelled';
    await booking.save();

    if(wasConfirmed){
        const event = await Event.findById(booking.eventId._id);
        event.availableSeats +=1;
        await event.save();
    }

    res.json({message:"Booking Cancelled Successfully"})
}

exports.getAllBookings = async (req, res) => {
    const bookings = await Booking.find()
        .populate('userId')
        .populate('eventId');

    res.json(bookings);
}
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require('./routes/auth')
const eventRoutes = require('./routes/event');
const bookingRoutes = require('./routes/booking')
dotenv.config();

const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173", process.env.CLIENT_URL],
    credentials: true,
  })
);

app.use(express.json());


app.use("/api/auth",authRoutes);
app.use("/api/events",eventRoutes);
app.use("/api/bookings",bookingRoutes); 

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log("Connected to Mongodb")
})
.catch((error)=>{
     console.error("Error Connecting to Mongodb",error)
})





const PORT = process.env.PORT || 5000;

app.listen(PORT ,()=>{
    console.log(`Server is running on port ${PORT}`)
})


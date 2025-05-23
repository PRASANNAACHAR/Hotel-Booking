import Booking from "../models/Booking.js"
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";


// function to check availability of room
const checkAvailability = async ({checkInDate, checkOutDate, room}) => {
    try {
        const bookings =await Booking.find({
            room,
            checkInDate:{$lte: checkOutDate},
            checkOutDate:{$gte: checkInDate},
        });
       const isAvailable =  bookings.length === 0;
       return isAvailable;

    } catch (error) {
        console.error(error.message);
        
    }
}

// api to check availabiltit of room
// posy /api/bookings/check-availability
export const checkAvailabilityAPI = async (req, res) => {
    try {
       const {room, checkInDate, checkOutDate} = req.body; 
       const isAvailable = await checkAvailability({checkInDate, checkOutDate, room});
       res.json({success: true, isAvailable})
    } catch (error) {
               res.json({success: false, message: error.message})

    }
}

// api to creare to new bookings
// post /api/bookings/book

export const createBooking = async (req, res) =>{
    try {
        const {room, checkInDate, checkOutDate, guests} = req.body;
        const user = req.user._id;
        // before booking check availability
        const isAvailable = await checkAvailability({checkInDate,checkOutDate, room});
        if(!isAvailable){
            return res.json({success: false, message: "Room is not available"})
        }
        // get totalPrice from  room
        const roomData = await Room.findById(room).populate("hotel");
        let totalPrice = roomData.pricePerNight;
        
        // calculate totalprice based on night
        const checkIn = new Date(checkInDate)
        const checkOut = new Date(checkOutDate)
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

        totalPrice *= nights;
        const booking = await Booking.create({
            user,
            room,
            hotel: roomData.hotel._id,
            guests: +guests,
            checkInDate,
            checkOutDate,
            totalPrice,
        })
        res.json({success: true, message:"Booking Create Successfully"})

    } catch (error) {
        console.log(error);
         res.json({success: false, message:"Failed to Create booking"})
    }
}

// api to get all bookings for a user
// get /api/bookings/user
export const getuserBookings = async (req, res)=>{
    try {
        const user = req.user._id;
        const bookings =  await Booking.find({user}).populate("room hotel").sort({createdAt: -1})
        res.json({success: true, bookings})
    } catch (error) {
        res.json({success: false, message: "Failed to fetch bookings"});
    }
}
export const getHotelBookings = async (req,res)=> {
   try {
     const hotel = await Hotel.findOne({owner: req.auth.userId});
    if(!hotel){
        return res.json({success:false, message: "No Hotel found"});
    }
    const bookings = await Booking.find({hotel:hotel._id}).populate("room hotel user").sort({createdAt: -1});
    // total bookings
    const totalBookings = bookings.length;
    // total revennu
    const totalRevenue = bookings.reduce((acc, booking)=> acc + booking.totalPrice, 0)

    res.json({success: true, dashboardData : {totalBookings, totalRevenue, bookings}})
   } catch (error) {
    res.json({success: false, message:"Failed to fetch bookings"})
   }
}
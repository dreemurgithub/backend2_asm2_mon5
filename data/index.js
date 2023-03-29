require('dotenv').config()
const mongoose = require('mongoose');
const uri = `${process.env.database}/Hotel`
mongoose.connect(uri);

const User_schema = new mongoose.Schema({
    username: String ,
    password: String ,
    fullName: String ,
    phoneNumber: String ,
    email: String ,
    isAdmin: Boolean

})



const Room_schema = new mongoose.Schema({
    hotel:String,
    title: String ,
    price: Number ,
    maxPeople: Number ,
    desc: String ,
    roomNumbers: [String],
    date_fill :[ {room: String , date:[Date] } ] ,
    createdAt: Date,
    updatedAt: Date
});
const Hotel_schema = new mongoose.Schema({
    name: String ,
    type: String ,
    city: String ,
    title:String ,
    address: String ,
    distance: String ,
    photos: [String] ,
    desc: String ,
    rating: Number,
    rooms: [String],
    cheapestPrice: Number,
    feature: Boolean
});

const Transaction_Schema = new mongoose.Schema({
    user_id:String,
    user: [String,String,String,String] ,
    hotel: Hotel_schema ,
    room: [{price:Number , room_list:[String]}],
    dateStart: Date ,
    dateEnd: Date ,
    price: Number ,
    Payment: String ,
    status: String,
    roomNumbers :[String],
    createAt : Date
});

module.exports = {Hotel_schema: mongoose.model('hotels',Hotel_schema) ,
    User_schema: mongoose.model('users',User_schema),
    Room_schema: mongoose.model('rooms',Room_schema),
    Transaction_Schema: mongoose.model('transactions',Transaction_Schema)
}
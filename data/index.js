const mongoose = require('mongoose');
const uri = 'mongodb://127.0.0.1:27017/Hotel'
mongoose.connect(uri);

const User_schema = new mongoose.Schema({
    username: String ,
    password: String ,
    fullName: String ,
    phoneNumber: String ,
    email: String ,
    isAdmin: Boolean

})

const Hotel_schema = new mongoose.Schema({
    name: String ,
    type: String ,
    city: String ,
    address: String ,
    distance: String ,
    photos: [String] ,
    desc: String ,
    rating: Number,
    rooms: [String]
});


const Room_schema = new mongoose.Schema({
    title: String ,
    price: Number ,
    maxPeople: Number ,
    desc: String ,
    roomNumbers: [String]
});
const Transaction_Schema = new mongoose.Schema({
    user_id:String,
    user: [String,String,String,String] ,
    hotel: Hotel_schema ,
    room: Room_schema ,
    dateStart: Date ,
    dateEnd: Date ,
    price: Number ,
    Payment: String ,
    status: Number
});

module.exports = {Hotel_schema: mongoose.model('hotels',Hotel_schema) ,
    User_schema: mongoose.model('users',User_schema),
    Room_schema: mongoose.model('rooms',Room_schema),
    Transaction_Schema: mongoose.model('transactions',Transaction_Schema)
}
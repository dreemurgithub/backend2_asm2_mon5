const Admin_Route = require('express')()
const {Transaction_Schema, Hotel_schema, Room_schema, User_schema} = require('../data/index')

//TODO admin signin and sign out - middleware
function isAdmin(req, res, next) {
    if (req.url === '/admin/signout' || req.url === '/admin/login') {
        next();
        return
    }
    if (req.session.isAdmin === true) {
        next();
        return;
    } else res.send([]) // luôn return [] để cho list
    let aaaaa = 0
}

Admin_Route.use(isAdmin)
//TODO admin signin and sign out end

Admin_Route.get('/admin/home', async (req, res) => {

    const array = await Transaction_Schema.find().sort({createAt: -1})
    const edit = array.slice(0, 8) // 8 doc đầu tiên
    res.send(edit)
})

Admin_Route.post('/admin/login', async (req, res) => {
    const admin = await User_schema.findOne({email: req.body.email, password: req.body.password})
    if (admin.isAdmin === true) {
        req.session.isAdmin = admin.isAdmin
        res.send({isAdmin: admin.isAdmin})
        return
    } else {
        res.send({isAdmin: false})
        return
    }
})

Admin_Route.get('/admin/signout', async (req, res) => {
    req.session.destroy()
    res.clearCookie('connect.sid')
    res.send({isAdmin: false})

})
//TODO start hotel - end sign in signout
Admin_Route.get('/admin/hotel', async (req, res) => {
    const hotel_arr = await Hotel_schema.find()
    res.send(hotel_arr)
})

Admin_Route.post('/admin/hotel', async (req, res) => {
    const hotel = req.body
    const room_list = hotel.rooms.split(',')
    const photos = hotel.photos.split(',')

    const new_hotel = await Hotel_schema({
        name: hotel.name, type: hotel.type,
        distance: parseInt(hotel.distance),
        rating: parseFloat(hotel.rating), photos: photos,
        title: hotel.title,
        city: hotel.city,
        feature: hotel.feature === 'true' ? true : false,
        cheapestPrice: parseInt(hotel.price),
        address: hotel.address,
        desc: hotel.desc
    })
    await new_hotel.save()
    res.send([])
    let aaaaa = 0
})

Admin_Route.put('/admin/hotel', async (req, res) => {
    const hotel = req.body
    const room_list = hotel.rooms.split(',')
    const photos = hotel.photos.split(',')

    const update_hotel = {
        name: hotel.name, type: hotel.type,
        distance: parseInt(hotel.distance),
        rating: parseFloat(hotel.rating), photos: photos,
        title: hotel.title,
        city: hotel.city,
        feature: hotel.feature === 'true' ? true : false,
        cheapestPrice: parseInt(hotel.price),
        address: hotel.address,
        desc: hotel.desc,
    }
    await Hotel_schema.findOneAndUpdate({_id: hotel.id}, update_hotel)
    res.send([])
    let aaaaa = 0
})
Admin_Route.delete('/admin/hotel', async (req, res) => {
    await Hotel_schema.deleteOne({_id: req.body.id})
    res.send([])
})


//TODO end hotel - start Room

Admin_Route.get('/admin/rooms', async (req, res) => {
    const array = await Room_schema.find()
    res.send(array)
})
Admin_Route.get('/admin/rooms/:id', async (req, res) => {
    const array = await Room_schema.deleteOne({_id: req.params.id})
    res.send([])
})
Admin_Route.post('/admin/rooms', async (req, res) => {
    const room = req.body;
    const room_list = room.roomNumbers.split(',')
    const date_fill = room_list.map(el => {
        return {
            room: el,
            date: []
        }
    })
    const new_room = new Room_schema({
        createdAt: new Date(),
        updatedAt: new Date(),
        desc: room.desc,
        maxPeople: room.maxPeople,
        hotel: room.hotel_id,
        price: parseInt(room.price),
        roomNumbers: room_list,
        date_fill: date_fill,
        title: room.title,
        maxPeople: room.maxPeople
    })
    const update_room = await Hotel_schema.findById(room.hotel_id)
    await new_room.save()
    update_room.rooms.push(new_room._id)
    await update_room.save()
    res.send([])
    let aaaaaaaaa = 0
})
Admin_Route.delete('/admin/rooms/:id/:hotel', async (req, res) => {
    await Room_schema.deleteOne({_id: req.params.id})
    const update_hotel = await Hotel_schema.findById(req.params.hotel)
    const room_hotel = update_hotel.rooms
    let index = room_hotel.indexOf(req.params.id) // index để xóa
    const room_hotel_update = room_hotel.splice(index, 1)
    update_hotel.rooms = room_hotel_update
    await update_hotel.save()
    res.send([])
})

//TODO start transaction - End Rooms
Admin_Route.get('/admin/tran/:page', async (req, res) => {
    const page = parseInt(req.params.page)
    const array = await Transaction_Schema.find().sort({createAt: -1})
    const arr_obj = array.map(el=>el.toObject())
    const edit = arr_obj.slice((5*page), 5*(page+1))
    res.send(edit)
    let aaa=0
})


module.exports = Admin_Route
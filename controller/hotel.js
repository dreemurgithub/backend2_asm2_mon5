const hotel_route = require('express')()
const {Hotel_schema, Room_schema} = require('../data/index')

hotel_route.get('/hotel_list', async (req, res) => {

    const arr = await Hotel_schema.find()
    arr.sort((a, b) => b.rating - a.rating)
    arr.length = 3
    res.send(arr)

})
hotel_route.get('/hotel_list/:id', async (req, res) => {

    const obj = await Hotel_schema.findById(req.params.id)
    res.send(obj)

})
hotel_route.get('/hotel_room/:id', async (req, res) => {

    // const obj = await Hotel_schema.findById(req.params.id)
    // const arr= obj.rooms;
    // const res_arr = await Room_schema.find({
    //     "_id": {   // done
    //         $in : arr
    //     }
    // })

    // res.send(res_arr)
    const obj = await Room_schema.findById(req.params.id)
    res.send(obj)

})

hotel_route.get('/home', async (req, res) => {
    const Da_nang = await Hotel_schema.find({city: 'Da Nang'})
    const Ha_noi = await Hotel_schema.find({city: 'Ha Noi'})
    const HCM = await Hotel_schema.find({city: 'Ho Chi Minh'})
    const hotel = await Hotel_schema.find({type: 'hotel'})
    const apartment = await Hotel_schema.find({type: 'apartment'})
    const resorts = await Hotel_schema.find({type: 'resorts'})
    const villas = await Hotel_schema.find({type: 'villas'})
    const cabins = await Hotel_schema.find({type: 'cabins'})
    res.send({
        Da_nang: Da_nang.length,
        Ha_noi: Ha_noi.length,
        HCM: HCM.length,
        hotel: hotel.length,
        apartment: apartment.length,
        resorts: resorts.length,
        villas: villas.length,
        cabins: cabins.length,
    })
})

hotel_route.post('/search', async (req, res) => {

    if (req.body.people.kid==='')req.body.people.kid=0
    if (req.body.people.adult==='')req.body.people.adult=0
    req.body.people.kid = parseInt(req.body.people.kid)
    req.body.people.adult = parseInt(req.body.people.adult)

    const body = req.body
    const time = req.body.time
    const time_arr = time.map(el=>new Date(el))
    time_arr.forEach(el=>el.setHours(0,0,0,0)) // để thực hiện so sánh
    const list_time = date_loop(time_arr[1], time_arr[0])
    const list_time_num = list_time.map(el=>el.getTime())

    const arr = await Hotel_schema.find()
    const arr_obj = arr.map(el=>el.toObject())
    const hotel_list = arr_obj.map(el=>el._id)
    const room = await Room_schema.find({hotel:{$in :hotel_list }})
    const room_obj = room.map(el=>el.toObject())

    // thực hiện đếm date của user input, date trong user input tồn tại trong date_fill.room => count+=1, chỉ return các room có count===0
    room_obj.forEach(el=>el.date_fill.forEach(room=> {
        room.count = 0
        const time_room = room.date.map(el=>el.getTime())
        const check_ = list_time_num
        time_room.forEach(el=>{ // date của phòng bên trong date của user date , tăng count
            if(list_time_num.includes(el) ) room.count+=1
            // count===0 mới trả về room
        })
        let aaaa=0 // breakpoint check giá trị
    }) )

    const arr_filter_maxPeople = room_obj.filter(room=>
        room.maxPeople>=(req.body.people.adult+req.body.people.kid))
    arr_filter_maxPeople.forEach(el=>el['filter_date'] = el.date_fill.filter(item=>item.count===0))

    arr_filter_maxPeople.forEach(el=>{
        for (let i = 0; i < arr_obj.length; i++)
            if (arr_obj[i]._id.toString()===el.hotel) arr_obj[i]['room_list'] = el
    })
    const log_arr_obj_filter = arr_filter_maxPeople
    arr_obj.forEach(hotel=>{
       if(hotel.room_list!==undefined && hotel.room_list!== null ) hotel['room_avai'] =  hotel.room_list.filter_date.length
    })

    const arr_hotel = arr_obj.filter(hotel=>hotel.room_avai!== undefined || hotel.room_avai>0 || hotel.room_list!== undefined)
    // remove các hotel ko có phòng phù hợp
    const arr_hotel_room = arr_hotel.filter(hotel=> (hotel.room_avai>=parseInt(req.body.people.room))
        && (hotel.cheapestPrice >= parseInt(req.body.people.min)) && (hotel.cheapestPrice<=parseInt(req.body.people.max))
    )
    arr_hotel_room.sort((a,b)=>b.rating-a.rating) // sort cho đẹp
    res.send( arr_hotel_room)
    const log = arr_hotel_room
    let aaaaa= 0 // breakpoint check giá trị
})

function date_loop(date_end, date_start) {
    const new_date_start = new Date(date_start)
    const new_date_end = new Date(date_end)
    const list = []
    while (new_date_start.getTime() <= new_date_end.getTime()) {
        const new_p = new Date(new_date_start)
        list.push(new_p)
        new_date_start.setDate(new_date_start.getDate() + 1)
    }
    return list
}


module.exports = hotel_route
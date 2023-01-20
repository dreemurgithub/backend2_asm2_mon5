const transcation_route = require('express')()
// const uri = 'mongodb://127.0.0.1:27017/Hotel'
// const mongoose = require('mongoose')
const {Hotel_schema, Room_schema, Transaction_Schema} = require('../data/index')

transcation_route.post('/booking', async (req, res) => {
    if (req.session.isAdmin === true || req.session.isAdmin === false) {
        const date_end = new Date(req.body.dateEnd)
        const date_start = new Date(req.body.dateStart)
        let total = 0;
        const arr = Object.keys(req.body.all_room) // all room id

        const date_list = date_loop(req.body.dateEnd, req.body.dateStart)
        const room_booked = [];
        console.log(req.body.all_room)

        // req.body.all_room.forEach(el=>{
        //     el.forEach(li=>room_list.push(i))
        // })


        arr.forEach(el => {
            total += req.body.all_room[el].price * req.body.all_room[el].room_list.length
            req.body.all_room[el].room_list.forEach(li => room_booked.push(li.room))
            // delete null object?
            if (req.body.all_room[el].room_list.length === 0) delete req.body.all_room[el]

        })
        const roomNumbers = []
        arr.forEach(el => {
            console.log(req.body.all_room[el])
            if (req.body.all_room[el] !== undefined)
                req.body.all_room[el].room_list.forEach(room_n => roomNumbers.push(room_n.room) )
        })
        console.log(room_booked, ' room booked')
        const room = [] // array cho price và danh sách phòng đk
        arr.forEach(el => {
            if (req.body.all_room[el] !== undefined && req.body.all_room[el] !== null)
                room.push(req.body.all_room[el])
        })
        if (total === 0) return
        // console.log(room, ' room')
        console.log(req.body.all_room, ' req.body.all_room')

        const new_Transaction = new Transaction_Schema({
            user_id: req.body.user_id,
            user: req.body.user,
            hotel: req.body.hotel,
            dateStart: req.body.dateStart,
            dateEnd: req.body.dateEnd,
            Payment: req.body.Payment,
            status: 'Booked',
            price: total * ((date_end - date_start) / (1000 * 60 * 60 * 24) + 1),
            room: room,
            roomNumbers: roomNumbers
            // date_fill: date_loop(req.body.dateEnd, req.body.dateStart)
        })
        transac_room = [];
        room.forEach(el => {
            el.room_list.forEach(elel => {
                transac_room.push(elel)
            })
        })
        console.log(transac_room, ' trans room')
        const test_room = await Room_schema.find({hotel: req.body.hotel}) // all hotel obj
        console.log(test_room)
        // const room_index = room_booked.map(el=>room_list.indexOf(el)) // index of booked room

        test_room.forEach(async (room) => { // add date vào từng phòng
            room.date_fill.forEach((roomNums) => {
                if (room_booked.includes(roomNums.room)) {
                    roomNums.date = roomNums.date.concat(date_list)
                    roomNums.date.sort((a, b) => b.getTime() - a.getTime())
                }
            })
            await room.save()
        })

        // room_index.forEach( async (index)=>{
        //     test_room.forEach(room=>{
        //         room.date_fill[index].date.concat(date_loop(date_end,date_start))
        //     })
        //     await room.save()
        // })

        // push_date_loop(req.body.dateEnd,req.body.dateStart,test_room[0])
        await new_Transaction.save()
        res.send('done')

    } // only sign up user can get new transaction
})

transcation_route.get('/booking/:user_id', async (req, res) => {
    // get user_id from localstorage
    const arr = await Transaction_Schema.find({user_id: req.params.user_id})
    res.send(arr)
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

function push_date_loop(date_end, date_start, {room, date}) {
    const arr = date_loop(date_end, date_start)
    for (let i = 0; i < arr.length; i++) date.push(arr[i])
    date.sort((a, b) => b.getTime() - a.getTime())
    console.log({room, date})
}

transcation_route.get('/test', (req, res) => {

    res.send(date_loop('Mon Jan 31 2023 00:00:00 GMT+0700 (Giờ Đông Dương)', 'Mon Jan 21 2023 00:00:00 GMT+0700 (Giờ Đông Dương)'))
})

module.exports = transcation_route
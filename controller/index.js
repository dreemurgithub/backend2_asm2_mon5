const controller = require('express')()
const hotel_route = require('./hotel');controller.use(hotel_route)
const user_route = require('./user');controller.use(user_route)
const transcation_route = require('./transaction'); controller.use(transcation_route)
controller.get('/ha',(req,res)=>{
    res.send('hello controller')
})

module.exports = controller
const user_route = require('express')()
const uri = 'mongodb://127.0.0.1:27017/Hotel'
const mongoose = require('mongoose')
const {User_schema} = require('../data/index')

user_route.post('/user',async (req,res)=>{
    // await mongoose.connect(uri)
    const chec_arr = await User_schema.find({email:req.body.email})
    if(chec_arr.length===0){

        const new_user = new User_schema({
            username: req.body.email,
            password: req.body.password,
            fullName: req.body.fullname,
            phoneNumber: req.body.phone,
            email: req.body.email,
            isAdmin: false
        })
        await new_user.save()
        res.send({message:'New Account Created'})
    }
    if(chec_arr.length>0) res.send({message:'Email already exist'})
    // mongoose.connection.close()



})

user_route.post('/userlogin',async (req,res)=>{
    // await mongoose.connect(uri)
    const user = await User_schema.findOne({email:req.body.email,password:req.body.password})
    console.log(req.session)
    if (user=== null || user === undefined) res.send('')
    if (user!== null && user !== undefined) {
        req.session.isAdmin = user.isAdmin
        res.send(user)
    }
    // mongoose.connection.close()
})

user_route.get('/userlogin', (req,res)=>{
    console.log(req.session)
    req.session.destroy()
    res.clearCookie("connect.sid")
    res.send('')

})


module.exports = user_route
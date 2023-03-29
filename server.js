require('dotenv').config()
const express = require('express')
const app = express()
app.use(express.json());
const cookieParser = require('cookie-parser')
app.use(cookieParser());
const uri = process.env.database
const origin = [];
if(JSON.parse(process.env.production)) {
    origin.push('https://hotel-asm.web.app')
    origin.push('https://hotel-asm.firebaseapp.com')
    origin.push('https://admin-hotel-asm2.web.app')
    origin.push('https://admin-hotel-asm2.firebaseapp.com')

} else {
    origin.push('http://localhost:3000')
    origin.push('http://localhost:3001')
}

app.use((req, res, next) => {
    // console.log(req.get('origin'))
    // console.log(req.cookies)
    if (origin.includes(req.get('origin'))) {
        app.set('trust proxy', 1)
        res.header('Access-Control-Allow-Credentials', true)
        res.setHeader('Access-Control-Allow-Headers', true);
        next()
    }  // quick test, un comment sau khi test xong
    // next()
})

const cors = require('cors');
app.use(cors({
    credentials: true, origin: origin
}))

const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const store = new MongoDBStore({
    uri: `${uri}/Hotel`,
    collection: 'sessions'
});

// Catch errors
store.on('error', function(error) {
    console.log(error);
});

app.use(require('express-session')({
    secret: 'This is a secret',
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 , // 1 day
        secure: JSON.parse(process.env.production) ? true : 'auto',
        sameSite:  JSON.parse(process.env.production) ? 'none' : 'lax',
        httpOnly: JSON.parse(process.env.production),
    },
    store: store, resave: false, saveUninitialized: false
}));



app.get('/', (req, res) => {
    res.send('hello world')
})


const controller = require('./controller/index');
app.use(controller)

app.listen(5000, () => console.log('5k port reload 2?'))
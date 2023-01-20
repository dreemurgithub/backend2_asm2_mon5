const express = require('express')
const app = express()
app.use(express.json());
const cookieParser = require('cookie-parser')
app.use(cookieParser());

app.use((req, res, next) => {
    // console.log(req.get('origin'))
    // console.log(req.cookies)
    if (req.get('origin') === 'http://localhost:3000' || req.get('origin') === 'http://localhost:3001') {
        res.setHeader('Access-Control-Allow-Headers', true);

        next()
    }  // quick test, un comment sau khi test xong
    // next()
})

const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const store = new MongoDBStore({
    uri: 'mongodb://localhost:27017/Hotel',
    collection: 'sessions'
});

// Catch errors
store.on('error', function(error) {
    console.log(error);
});

app.use(require('express-session')({
    secret: 'This is a secret',
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    store: store, resave: false, saveUninitialized: false
}));



const cors = require('cors');
app.use(cors({
    credentials: true, origin: ['http://localhost:3000', 'http://localhost:3001']
    // ['http://localhost:3000/','http://localhost:3001/']
}))

app.get('/', (req, res) => {
    res.send('hello world')
})


const controller = require('./controller/index');
app.use(controller)

app.listen(5000, () => console.log('5k port'))
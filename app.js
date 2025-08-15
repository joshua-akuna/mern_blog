//
const express = require('express')
const {connect} = require('mongoose')
const cors = require('cors')
require('dotenv').config()
const userRoutes = require('./routes/userRoutes')
const postRoutes = require('./routes/postRoutes')
const upload = require('express-fileupload')

const {} = require('./middleware/errorMiddleware')
const { notFound } = require('./middleware/errorMiddleware')
const { errorHandler } = require('./middleware/errorMiddleware')

// specify the web app port
const PORT = process.env.PORT || 5500

// initialize and setup express
const app = express()
app.use(express.json({extended: true}))
app.use(express.urlencoded({extended: true}))
app.use(cors())
app.use(upload())
app.use('/uploads', express.static(__dirname + '/uploads'))

// setup the routes
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)

app.use(notFound)
app.use(errorHandler)

// connect to mongo db
connect(process.env.MONGO_URI).then(app.listen(PORT, ()=>{ console.log(`app listening on port ${PORT}`); })).catch(err => {console.log(err);})
/*app.listen(PORT, (req, res)=>{
    console.log(`app listening on port ${PORT}`);
})*/
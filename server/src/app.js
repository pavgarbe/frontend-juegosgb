const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const { Server } = require('socket.io')

// Initializations
const app = express()

// Middlewares
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

// Routes

app.post('*', (req, res, next) => {
    console.log(req.body)
    if (typeof req.body.eventName === "undefined") {
        return res.status(400).json({message: "eventName must be set"})
    }
    io.emit(req.body.eventName, req.body)
    return res.status(200).json({message: "order sent"})
})


// app.use('*', (req, res, next) => {
//     return res.status(404).json({message: 'Route not found'})
// })

app.use((err, req, res, next) => {
    return res.status(500).json({message: 'Internal server error'})
})

const server = app.listen(5001, () => 'Server listen at port 5001')
// ------ Socket server
const io = new Server(server, {
    cors: {origin: '*'}
})

let connections = []

setInterval(() => {
    console.log(connections.length);
}, 5000);

io.on('connection', (conn) => {
    connections.push(conn)
    console.log('User connected with id: ', conn.id)

    conn.on('disconnect', () => {
        console.log(`Client ${conn.id} disconnected`)
        connections = connections.filter(c => {
            return c.id !== conn.id

        })
    })
})

module.exports = { app }
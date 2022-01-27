const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const nextHandler = nextApp.getRequestHandler()

const messages = []
let players = []

io.on('connection', socket => {
	console.log('\x1b[32m%s\x1b[0m', socket.id, 'connected')

	/** Handle user movement */
	socket.on('user data', userPosition => {
		/** Remove user position from db */
		players = players.filter(e=>e.id !== userPosition.id)

		/** Add new user position to db */
		players.push(userPosition)
	})

	/** Handle chat message */
	// socket.on('chat message', data => {
	// 	messages.push(data)
	// 	io.emit('messages', messages)
	// })
	
	/** Handle user disconnection */
	socket.on('disconnect', () => {
		console.log('\x1b[31m%s\x1b[0m', socket.id, 'disconnected')
		/** Remove disconnected user from temporal database */
		players = players.filter(e=>e.id !== socket.id)
	})
})

/** Broadcast players positions 30 times per second */
setInterval(() => { 
	io.emit('players', players) 
	// console.log(players.map(p=>p.id))
}, 1000/30)

nextApp.prepare().then(() => {
	app.get('/messages', (req,res) => {
		res.json(messages)
	})

	app.get('*', (req, res) => {
		return nextHandler(req, res)
	})
	
	server.listen(3000, err => {
		if (err) process.exit(0)
		console.log('ready...')
	})
})
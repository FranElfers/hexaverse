const app = require('express')()
const server = require('http').Server(app)
const { Server } = require('socket.io')
const io = new Server(server, {
	cors: { 
		origin: ["http://localhost:3000", "https://hexaverse.netlify.app"]
	}
})

const messages = []
let players = []

io.on('connection', socket => {
	console.log('\x1b[32m%s\x1b[0m', socket.id.match(/^[\w]{5}/g)[0], 'connected')

	/** Handle user movement */
	socket.on('user data', userPosition => {
		/** Remove user position from db */
		players = players.filter(e=>e.id !== userPosition.id)

		/** Add new user position to db */
		players.push(userPosition)
	})
	
	/** Handle user disconnection */
	socket.on('disconnect', () => {
		console.log('\x1b[31m%s\x1b[0m', socket.id.match(/^[\w]{5}/g)[0], 'disconnected')
		/** Remove disconnected user from temporal database */
		players = players.filter(e=>e.id !== socket.id)
	})
})

/** Broadcast players positions 30 times per second */
setInterval(() => { 
	io.emit('players', players) 
}, 1000/30)

app.get('/', (req, res) => {
	console.log(res.header())
	res.header('Access-Control-Allow-Origin','*')
	res.json({msg:' hey'})
})

server.listen(3001, err => {
	if (err) process.exit(0)
	console.log('ready...')
})
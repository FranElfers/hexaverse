import io from'socket.io-client'

const socket = io(process.env.NODE_ENV === 'production' 
	? 'http://18.228.9.168:3000/'
	: 'http://localhost:3001/'
)

socket.on('connect', () => {
	console.log('connected', socket.id)	
})

socket.on('disconnect', () => {
	socket.disconnect()
})

export default socket
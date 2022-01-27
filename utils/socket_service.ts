import io from'socket.io-client'

const socket = io()

socket.on('connect', () => {
	console.log('connected', socket.id)	
})

socket.on('disconnect', () => {
	socket.disconnect()
})

export default socket
import io from'socket.io-client'

const socket = io('https://18.228.9.168:3000/')

socket.on('connect', () => {
	console.log('connected', socket.id)	
})

socket.on('disconnect', () => {
	socket.disconnect()
})

export default socket
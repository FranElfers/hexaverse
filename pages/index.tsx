import { useEffect, useState } from 'react'
import { Player, PlayerMesh, UserInfo } from '../interfaces/hex.interface'
import { Movement } from '../utils/player_movement'
import GlobalThree from '../utils/global_three'
import socket from '../utils/socket_service'
import Head from 'next/head'
import { smoothOut } from '../utils/smooth_movement'

export default function HomePage() {
	const [ loginfo, setLoginfo ] = useState<UserInfo>()
	const [ three, setThree ] = useState<GlobalThree>()
	const playerMov: Movement = new Movement(0, 0)
	let players: PlayerMesh[] = []
	let nicknames: any[] = []


	const loginHandler = (e: any) => {
		e.preventDefault()
		console.log(e.target[0].value, 'logged')
		setLoginfo({
			id: socket.id,
			nickname: e.target[0].value,
			time: ''
		})
	}

	/** Socket.io */
	useEffect(() => {
		if (!three || !loginfo) return

		socket.on('players', (data: Player[]) => {
			/** Sends user data to server */
			const userData: Player = {x:playerMov.x, y:playerMov.y, nickname:loginfo?.nickname||'', id:socket.id}
			socket.emit('user data', userData)

			/** Filters user data */
			data = data.filter(player => player.id !== socket.id && player.id)
			
			const oldPlayersId: string[] = players.map(p=>p.id)
			const newPlayers: Player[] = data.filter(p=>!oldPlayersId.includes(p.id))

			players = players.map((p: PlayerMesh): PlayerMesh => {
				const updatedData = data.find(nP => nP.id === p.id)
				if (updatedData) return {
					x: updatedData.x, 
					y: updatedData.y, 
					id: p.id, 
					nickname: p.nickname, 
					mesh: p.mesh
				}
				return p
			})

			for (let player of players) {
				/** Last position */
				const { x, z } = player.mesh.position

				/** Search new data of this player */
				const newData: Player | undefined = data.find(newP => newP.id === player.id)

				/** Updates player data (except for the mesh) */
				if (newData) player = {...newData, mesh: player.mesh}

				/** New position (smoothed out) */
				player.mesh.position.set(
					smoothOut(x, player.x,6), 
					5, 
					smoothOut(z, player.y,6)
				)
			}

			for (let player of newPlayers) {
				const playerMesh = three.createPlayer(0x3333bb)
				nicknames.push(three.createText(player.nickname))
				players.push({...player, mesh: playerMesh })
			}
		})
	}, [three, loginfo])

	/** TRHEEJS */
	useEffect(() => {
		if (!three || !loginfo) return

		/** Movement */
		document.addEventListener('keydown', e => playerMov.keyPressHandler(e))
		document.addEventListener('keyup', e => playerMov.keyReleaseHandler(e))		

		const userMesh = three.createPlayer(0x33bb33)
		// three.gridHelper()
		
		const animate = () => {
			playerMov.releaseSpeed(0.1)
			playerMov.update()

			userMesh.position.set(playerMov.x, 5, playerMov.y)

			for (let i in players) {
				let player = players[i]
				let text = nicknames[i]

				const { x, y, z } = player.mesh.position

				text.position.set(x,y+15,z)

				text.lookAt(three.camera.position)
			}
			
			three.renderLoop(animate)
		}
		animate()
	}, [three, loginfo])

	useEffect(() => {
		setThree(new GlobalThree())
	},[])

	return <>
		<Head>
			<title>Hexaverse</title>
			{/* <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" /> */}
		</Head>
		<div className={`interface ${loginfo ? 'active' : ''}`}>
			<form className="login" onSubmit={loginHandler}>
				<input type="text" placeholder='Nickname' required />
				<button type="submit">Enter</button>
			</form>
		</div>
	</>
}
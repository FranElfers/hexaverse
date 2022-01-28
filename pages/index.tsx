import { useEffect, useState } from 'react'
import { Player, PlayerMesh, UserInfo } from '../interfaces/hex.interface'
import { Movement } from '../utils/player_movement'
import GlobalThree from '../utils/global_three'
import socket from '../utils/socket_service'
import Head from 'next/head'

export default function HomePage() {
	const [ loginfo, setLoginfo ] = useState<UserInfo>()
	const [ three, setThree ] = useState<GlobalThree>()
	const playerMov: Movement = new Movement(0, 0)

	const loginHandler = (e: any) => {
		e.preventDefault()
		console.log(e.target[0].value, 'logged')
		setLoginfo({
			id: socket.id,
			nickname: e.target[0].value,
			time: ''
		})
	}

	useEffect(() => {
		if (!three || !loginfo) return
		let players: PlayerMesh[] = []

		/** Movement */
		document.addEventListener('keydown', e => playerMov.keyPressHandler(e))
		document.addEventListener('keyup', e => playerMov.keyReleaseHandler(e))		

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
				/** Search new data of this player */
				const newData: Player | undefined = data.find(newP => newP.id === player.id)

				/** Updates player data (except for the mesh) */
				if (newData) player = {...newData, mesh: player.mesh}

				if (player.mesh) player.mesh.position.set(player.x, 5, player.y)
			}

			for (let player of newPlayers) {
				const playerMesh = three.createPlayer(0x3333bb)
				players.push({...player, mesh: playerMesh})
			}
		})
	}, [three, loginfo])

	useEffect(() => {
		if (!three || !loginfo) return
		/** TRHEEJS */
		const userMesh = three.createPlayer(0x33bb33)		
		three.gridHelper()
		
		const animate = () => {
			playerMov.releaseSpeed(0.1)
			playerMov.update()			
			userMesh.position.set(playerMov.x, 5, playerMov.y)
			
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
			<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests" />
		</Head>
		<div className={`interface ${loginfo ? 'active' : ''}`}>
			<form className="login" onSubmit={loginHandler}>
				<input type="text" placeholder='Nickname' required />
				<button type="submit">Enter</button>
			</form>
		</div>
	</>
}
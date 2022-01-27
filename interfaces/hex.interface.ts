import { Mesh } from 'three'

type socketId = string

interface UserBase {
	id: socketId
	nickname: string
}

export interface Player extends UserBase {
	x: number
	y: number
}

export interface PlayerMesh extends Player {
	mesh: Mesh
}

export interface UserInfo extends UserBase {
	time: string
}
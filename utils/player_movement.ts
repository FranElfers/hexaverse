export class Movement {
	velX: number
	velY: number
	VELOCITY: number
	arrows: {
		[key: string]: () => number
	}
	beingPressed: string[] = []
	constructor (public x: number, public y: number) {
		this.x = x
		this.y = y
		this.velX = 0
		this.velY = 0
		this.VELOCITY = 0.2
		this.arrows = {
			ArrowUp: () => this.addVelocity('velY', -this.VELOCITY),
			ArrowRight: () => this.addVelocity('velX', this.VELOCITY),
			ArrowDown: () => this.addVelocity('velY', this.VELOCITY),
			ArrowLeft: () => this.addVelocity('velX', -this.VELOCITY)
		}
	}

	addVelocity(this: any, dir: string, vel: number) {
		const sum = this[dir] + vel
		this[dir] = Math.abs(sum)>0.001 && Math.abs(sum)<5 ? sum : this[dir]
		return sum
	}

	update() {
		/** Press arrows in the "currently pressed arrows" list */
		for (let i in this.beingPressed) this.arrows[this.beingPressed[i]]()

		const resX = this.x + this.velX
		const resY = this.y + this.velY
		this.x = resX
		this.y = resY
		// if (resX > 0 && resX < window.innerWidth-10) this.x = resX
		// if (resY > 0 && resY < window.innerHeight-10) this.y = resY

	}

	releaseSpeed(rate: number) {
		this.velX = parseFloat(this.velX.toFixed(4))
		this.velY = parseFloat(this.velY.toFixed(4))
		
		this.velX += Math.abs(this.velX) >= 0.01 ? (this.velX<0?rate:-rate) : 0
		this.velY += Math.abs(this.velY) >= 0.01 ? (this.velY<0?rate:-rate) : 0
	}	
	
	keyPressHandler(e: any) {
		if (!this.arrows) return
		/** If the pressed key is not an arrow key */
		if (!Object.keys(this.arrows).includes(e.code)) return 
		
		
		const key: keyof typeof this.arrows = e.code
		this.arrows[key]()
	
		/** Add arrow to "currently pressed arrow list" */
		if (!this.beingPressed.includes(e.code)) this.beingPressed.push(e.code)
	}

	keyReleaseHandler(e: any) {
		/** Remove released arrow from "currently pressed arrow list" */
		this.beingPressed = this.beingPressed.filter(k=>k!==e.code)
	}
}
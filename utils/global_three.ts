import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { BoxGeometry, GridHelper, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer } from "three";

export default class GlobalThree {
	scene: Scene
	renderer: WebGLRenderer
	camera: PerspectiveCamera
	controls: OrbitControls
	constructor() {
		this.scene = new Scene()
		
		/** Renderer */
		this.renderer = new WebGLRenderer()
		this.renderer.setSize(window.innerWidth+1, window.innerHeight+1)
		this.renderer.setClearColor(0x282C34)
		/** removes the previous one (a problem only in auto refresh) */
		document.querySelector('[data-engine="three.js r137"]')?.remove()
		document.querySelector('#__next')?.appendChild(this.renderer.domElement)

		/** Camera positioning */
		this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000)
		this.camera.position.set(0,0,100)
		this.camera.lookAt(0,0,0)

		/** Orbit camera controls */
		this.controls = new OrbitControls(this.camera, this.renderer.domElement)
	}

	renderLoop(cb: () => void) {
		requestAnimationFrame(cb)
		this.controls.update()
		this.renderer.render(this.scene, this.camera)
	}

	/**
	 * Create player mesh
	 * @param color 0xrrggbb[aa]
	 * @returns playerMesh
	 */
	createPlayer(color: number): Mesh {
		const playerGeometry = new BoxGeometry(10,10,10)
		const playerMaterial = new MeshBasicMaterial({ color })
		const playerMesh = new Mesh(playerGeometry, playerMaterial)
		this.scene.add(playerMesh)
		return playerMesh
	}

	/** Activate grid */
	gridHelper() {
		this.scene.add(new GridHelper(1000,10))
	}
}
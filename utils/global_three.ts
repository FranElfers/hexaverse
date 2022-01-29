import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { AmbientLight, BoxGeometry, CameraHelper, GridHelper, HemisphereLight, Loader, Mesh, MeshBasicMaterial, MeshNormalMaterial, MeshStandardMaterial, PCFSoftShadowMap, PerspectiveCamera, PlaneGeometry, PointLight, Scene, Texture, TextureLoader, Vector2, WebGLRenderer } from "three";

export default class GlobalThree {
	scene: Scene
	renderer: WebGLRenderer
	camera: PerspectiveCamera
	controls: OrbitControls
	font: Font | undefined
	constructor() {
		this.scene = new Scene()
		
		/** Renderer */
		this.renderer = new WebGLRenderer({ antialias: true })
		this.renderer.setSize(window.innerWidth+1, window.innerHeight+1)
		this.renderer.setClearColor(0x61FFFF)
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = PCFSoftShadowMap;
		/** removes the previous one (a problem only in auto refresh) */
		document.querySelector('[data-engine="three.js r137"]')?.remove()
		document.querySelector('#__next')?.appendChild(this.renderer.domElement)
		/** Renderer */

		/** Camera positioning */
		this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000)
		this.camera.position.set(0,50,100)
		this.camera.lookAt(0,0,0)

		/** Orbit camera controls */
		this.controls = new OrbitControls(this.camera, this.renderer.domElement)

		/** Lighting */
		const skyLight = new HemisphereLight(0xffffbb, 0x080820, .5)
		const ambientLight = new AmbientLight(0x404040)
		const sun = new PointLight(0xffffff, 1, 3000, 0.1)
		sun.castShadow = true
		sun.shadow.mapSize = new Vector2(512, 1024)
		sun.position.set(-300, 300, -300)
		this.scene.add(skyLight)
		this.scene.add(sun)
		this.scene.add(ambientLight)
		/** Lighting */

		/** Floor */
		const floorMesh = new Mesh(
			new PlaneGeometry(4000, 4000),
			new MeshStandardMaterial({ color: 0xffaa00 })
		)
		floorMesh.receiveShadow = true
		floorMesh.rotateX(-90*Math.PI/180)
		this.scene.add(floorMesh)
		/** Floor */

		/** Font */
		this.font = undefined
		const fontLoader = new FontLoader()
		fontLoader.load('/assets/helvetiker_regular.typeface.json', data => {
			this.font = data
		})
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
		const playerMaterial = new MeshStandardMaterial({ color })
		const playerMesh = new Mesh(playerGeometry, playerMaterial)
		playerMesh.castShadow = true
		this.scene.add(playerMesh)
		return playerMesh
	}

	createText(nickname: string): Mesh | void {
		if (!this.font) return

		const textGeometry = new TextGeometry(nickname, {
			font: this.font,
			size: 10,
			height: 0
		})
		const textMaterial = new MeshBasicMaterial({ color: '0xffffff' })
		const textMesh = new Mesh(textGeometry, textMaterial)
		this.scene.add(textMesh)

		return textMesh
	}

	/** Activate grid */
	gridHelper() {
		this.scene.add(new GridHelper(1000,10))
	}
}
import "THREE/examples/js/loaders/GLTFLoader.js";
const THREE = window.THREE;

interface options{
	renderder:any;
}

class Space {

	animateActionMap:Map<string,Function>;
	camera:any;
	readonly element:Element;
	innerHeight:Number;
	innerWidth:Number;
	readonly options:options;
	orbitControl:any;
	renderer:any;
	scene:any;

	constructor(element:Element,options?:options){
		this.element = element;
		this.options = options;
		this.init();
		return this;
	}


	addAnimateAction(key:string,func:Function):Space{
		const map = this.animateActionMap;
		if(map.has(key)){
			console.warn(`${key} already existed in animateActionMap,and replace by new function.`);
		}
		map.set(key,func);
		return this;
	}

	animate(){
		requestAnimationFrame( this.animate.bind(this) );
		this.renderer.render( this.scene, this.camera );
		this.animateActionMap.forEach((func:Function)=>{
			func();
		})
	}



	init(){
		const e = this.element;
		let renderer = this.renderer = new THREE.WebGLRenderer();
		this.innerWidth =  e.clientWidth;
		this.innerHeight =  e.clientHeight;
		renderer.setSize(e.clientWidth, e.clientHeight );
		e.appendChild(renderer.domElement);
		this.animateActionMap = new Map();
	}

	load(file:string):Promise<any> {
		const scope = this;
		return new Promise((resolve,reject)=>{
			// TODO: set and get data first from indexDB
			const loader = new THREE.GLTFLoader();
			loader.load(file,
				function loaded(gltf:any) {
					// console.log(gltf);
					let e = scope.element;
					let scene = scope.scene = gltf.scene;
					let camera = scope.camera = new THREE.PerspectiveCamera( 20, e.clientWidth/e.clientHeight, 0.1, 1000 );
					scope.setPerspectiveCamera(camera,scene.userData);
					scene.add(camera);
					scene.add( new THREE.HemisphereLight( 0xffffff, 0xcccccc, 1 ) );
					scope.animate();
					resolve();
				},
				function loaddingProgressing(xhr:any) {
					console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
					// TODO: show progressing in html
				},
				function loadingError(error:Error) {
					reject(error);
				})
		});
	}

	removeAnimateAction(key:string):Space{
		this.animateActionMap.delete(key);
		return this;
	}

	setPerspectiveCamera(camera:any,data:any):Space{
		camera.fov = data.fov;
		camera.position.set(data.x||0,data.y||0,data.z||0)
		camera.rotation.set(data.rx*Math.PI/180||0,data.ry*Math.PI/180||0,data.rz*Math.PI/180||0)
		camera.updateProjectionMatrix()
		if(this.orbitControl){
			this.orbitControl.update()
		}
		return this;
	}

}

export default Space;
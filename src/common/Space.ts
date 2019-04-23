import "THREE/examples/js/loaders/GLTFLoader.js";
import "THREE/examples/js/controls/OrbitControls.js"
import Inspector from "./Inspector";

const THREE = window.THREE;

interface options{
	renderder?:any;
	inspector?:boolean;
	orbit?:boolean;
}

class Space {

	animateActionMap:Map<string,Function>;
	camera:any;
	readonly element:Element;
	innerHeight:number;
	innerWidth:number;
	offset:{
		top:number;
		left:number;
	};
	readonly options:options;
	orbit:any;
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

	animate():Space{
		requestAnimationFrame( this.animate.bind(this) );
		this.renderer.render( this.scene, this.camera );
		this.animateActionMap.forEach((func:Function)=>{
			func();
		})
		return this;
	}

	autoRotate(flag:boolean,speed?:number){
		const orbit = this.orbit
		if(!orbit){
			return console.warn("autoRotate need orbit control");
		}
		orbit.autoRotate = flag;

		if(flag){
			orbit.autoRotateSpeed = speed || 2;			
			this.addAnimateAction('autoRotate',()=>{
				orbit.update();
			})
		}
		else{
			this.removeAnimateAction('autoRotate');
		}
	}
	
	init():Space{
		const e = this.element;
		const options = this.options || {};
		const renderer = this.renderer = new THREE.WebGLRenderer();
		this.innerWidth =  e.clientWidth;
		this.innerHeight =  e.clientHeight;
		this.animateActionMap = new Map();
		this.offset = $(e).offset();

		renderer.setSize(e.clientWidth, e.clientHeight );
		e.appendChild(renderer.domElement);

		if(options.inspector){
			const inspector = new Inspector(e);
			this.addAnimateAction("inspector",inspector.animateAction);
		}



		window.addEventListener('resize', this.resize.bind(this));
		return this;
	}

	initOrbit():Space{
		const options = this.options || {};

		if(options.orbit){
			const orbit = this.orbit = new THREE.OrbitControls(this.camera,this.renderer.domElement);
			orbit.update();
		}

		return this;
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

	resize():Space{
		const camera = this.camera;
		const e = this.element;
		this.offset = $(e).offset(); 
		if(e.clientWidth === 0 || e.clientHeight === 0){
			console.error("resize error:element width and height is error.",e.clientWidth,e.clientHeight);
			return this;
		}

		// console.log(camera,offset);

		if(camera.type === "PerspectiveCamera"){
			camera.aspect = e.clientWidth / e.clientHeight;
			camera.updateProjectionMatrix();
		}

		this.renderer.setSize(e.clientWidth, e.clientHeight);
		return this;
	}

	setPerspectiveCamera(camera:any,data:any):Space{
		const degToRad  = THREE.Math.degToRad ;
		camera.fov = data.fov;
		camera.position.set(data.x||0,data.y||0,data.z||0)
		camera.rotation.set(degToRad(data.rx||0),degToRad(data.ry||0),degToRad(data.rz||0))
		camera.updateProjectionMatrix();
		this.initOrbit();
		return this;
	}

}

export default Space;
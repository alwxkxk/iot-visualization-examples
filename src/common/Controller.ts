import { Euler, Group, Vector3 } from "three";
import Space from "./Space";

const THREE = (window as windowEx).THREE;

class Controller {
	public lineObject3d: GroupEx;
	public name: string;
	public object3d: Objects;
	public originalPosition: Vector3;
	public originalRotation: Euler;
	public originalScale: Vector3;
	public position: Vector3;
	public rotation: Euler;
	public userData: any;
	public scale: Vector3;
	public showingObject3d: Objects;
	public showingModel: string;
	public space: Space;

	constructor(space: Space, object3d: Objects, options?: any) {
		this .space = space;
		this .object3d = object3d;
		object3d.$controller = this ;

		this .init();
	}

	public init(): Controller {
		const object3d = this .object3d;

		this .name = object3d.name;
		this .userData = object3d.userData;

		this .originalPosition = this .position = object3d.position.clone();
		this .originalRotation = this .rotation = object3d.rotation.clone();
		this .originalScale = this .scale = object3d.scale.clone();

		this .showingModel = "normal";
		this .showingObject3d = object3d;

		return this ;
	}

	public initLineModel(color?: any): Controller {
		const object3d = this .object3d;
		const group = this .lineObject3d = new THREE.Group();
		const lineMaterial = new THREE.LineBasicMaterial({color: color || 0x00FFFF});
		const boxMaterial = new THREE.LineBasicMaterial({
			depthTest: false,
			depthWrite: false,
			opacity: 0 ,
			side: THREE.BackSide,
			transparent: true,
		});
		group.name = this .name + "_lineObject3d";
		group.$controller = this ;

		object3d.traverse((v: MeshEx) => {
			// group don't have geometry
			if (!this .isGroup(v)) {
				const geo = new THREE.EdgesGeometry(v.geometry);
				const line = new THREE.LineSegments( geo , lineMaterial);
				// add transparent box to avoid picking difficult by raycaster.
				const box = new THREE.Mesh(geo, boxMaterial);

				this
				.copyCoordinate(v, line)
				.copyCoordinate(v, box);

				group
				.add(line)
				.add(box);

			}
		});
		this .lineObject3d = group;
		return this ;
	}

	public isGroup(obj: Objects): boolean {
		// @ts-ignore
		return !!obj.isGroup;
	}

	public changeShowingModel(model: string): Controller {
		switch (model) {
			case "line":
				this .changeToLineModel();
				break;
			case "normal":
				this .changeToNormalModel();
				break;

			default:
				console.error("can't change to this model :", model);
				return this ;
		}
		this .showingModel = model;
		return this ;
	}

	public changeToNormalModel(): Controller {
		this .updateShowingObject3d(this .object3d);
		return this ;
	}

	public changeToLineModel(): Controller {
		if (!this .lineObject3d) {
			this .initLineModel();
		}

		this .updateShowingObject3d(this .lineObject3d);
		return this ;
	}

	public copyCoordinate(from: Objects, to: Objects): Controller {
		to.position.copy(from.position.clone());
		to.scale.copy(from.scale.clone());
		to.rotation.copy(from.rotation.clone());
		return this ;
	}

	public updateShowingObject3d(newShowingObject3d: Objects): Controller {
		// move children(group) to new showingObject3d(exclude other objects that have been change to newModel.)
		const showingObject3d = this .showingObject3d;
		const children = Array.from(showingObject3d.children);
		children.forEach((obj: GroupEx) => {
			if (this .isGroup(obj)) {
				newShowingObject3d.add(obj);
			}
		});

		const parent = showingObject3d.parent;
		if (parent) {
			// append to parent
			// remove old showingObject3d from parent
			parent
			.add(newShowingObject3d)
			.remove(showingObject3d);
		}
		this .showingObject3d = newShowingObject3d;
		return this ;
	}

}

export default Controller;

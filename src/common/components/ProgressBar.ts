import * as Selection from "d3-selection";
import * as Interpolators from "d3-interpolate";
import * as Transition from "d3-transition";
import * as uuid from "uuid";

const colorRGBA={
	main:"rgb(8,34,88)",
	mainAlpha:"rgba(8,34,88,0.6)",
	submain:"rgb(16,235,244)",
	submainAlpha:"rgba(16,235,244,0.8)",
	font:"rgb(243,188,15)",
	border:"rgb(243,188,15)",

	safe:"rgb(139,195,74)",
	much:"rgb(255,235,59)",
	over:"rgb(255,152,0)",
	dangerous:"rgb(f44336)"
}
class ProgressBar {
	readonly element:Element;
	id:string;
	progressValue:number;
	progressSelection:any;
	svgSelection:any;
	textSelection:any;
	constructor(element:Element) {
		if(element.clientWidth === 0 || element.clientHeight === 0){
			console.error("element should had width and height before init.");
		}
		this .element = element;
		this .progressValue = 0;
		this .id = "progress-bar"+uuid();
		this .init();
	}

	init(){
		const svgSelection = this .svgSelection = Selection.select(this .element)
		.append("div")
		.attr("id", this .id)
		.style("left", "15%")
		.style("top", "40%")
		.style("position", "absolute")
		.style("width", "70%")
			.append("svg")
			.attr("viewBox", "0 0 100 20")

	svgSelection
		.append("rect")
		.attr("width", "100")
		.attr("height", "20")
		.attr("fill", colorRGBA.mainAlpha);

	this .progressSelection = svgSelection
		.append("rect")
		.attr("width", "0")
		.attr("height", "20")
		.attr("fill", colorRGBA.submain);

	svgSelection
		.append("line")
		.attr("x1", "0")
		.attr("x2", "100")
		.attr("y1", "0")
		.attr("y2", "0")
		.attr("stroke", colorRGBA.border);

	svgSelection
		.append("line")
		.attr("x1", "0")
		.attr("x2", "100")
		.attr("y1", "20")
		.attr("y2", "20")
		.attr("stroke", colorRGBA.border);
	svgSelection
		.append("line")
		.attr("x1", "0")
		.attr("x2", "0")
		.attr("y1", "0")
		.attr("y2", "20")
		.attr("stroke", colorRGBA.border);
	svgSelection
		.append("line")
		.attr("x1", "100")
		.attr("x2", "100")
		.attr("y1", "0")
		.attr("y2", "20")
		.attr("stroke", colorRGBA.border);

	this .textSelection = svgSelection
		.append("text")
		.attr("font-size", "80%")
		.attr("x", "5")
		.attr("y", "14")
		.attr("fill", colorRGBA.font)
		.text("LOADING 0%")
	}

	progress(value:number){
		let interpolateFun = Interpolators.interpolate(this .progressValue, value);
		this .progressValue = value;
		Transition.transition().tween("progress", ()=>{
			return (t:any)=>{
				let data = interpolateFun(t).toFixed(0);
				this .textSelection.text(`LOADING ${data}%`);
				this .progressSelection.attr("width", data );
			}
		});
	}

	setText(text:string){
		this .textSelection.text(text);
	}

	start(){
		this .textSelection.text(`LOADING 0%`);
	}

	parse(){
		this .progressSelection.transition().attrTween("width", ()=>{
			return Interpolators.interpolateNumber(0, 100);
		});
		this .setText(" PARSEING");
	}

	error(){
		this .setText("LOAD ERROR");
	}

	dispose(){
		setTimeout(() => {
			Selection.selectAll(`#${this .id}`).remove();
		}, 1000);
	}

}

export default ProgressBar;

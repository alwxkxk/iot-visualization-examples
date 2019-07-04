import * as Interpolators from "d3-interpolate";
import * as Selection from "d3-selection";
import * as Transition from "d3-transition";
import * as uuid from "uuid";
import {colorRGBA} from "./common";

class ProgressBar {
  public readonly element: Element;
  public id: string;
  public progressValue: number;
  public progressSelection: any;
  public svgSelection: any;
  public textSelection: any;
  constructor(element: Element) {
    if (element.clientWidth === 0 || element.clientHeight === 0) {
      console.error("element should had width and height before init.");
    }
    this .element = element;
    this .progressValue = 0;
    this .id = "progress-bar" + uuid();
    this .init();
  }

  public init() {
    this .svgSelection = Selection.select(this .element)
    .append("div")
    .attr("id", this .id)
    .style("left", "15%")
    .style("top", "40%")
    .style("position", "absolute")
    .style("width", "70%")
      .append("svg")
      .attr("viewBox", "0 0 100 20");
    const svgSelection = this .svgSelection;
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
      .text("LOADING 0%");
  }

  public progress(value: number) {
    const interpolateFun = Interpolators.interpolate(this .progressValue, value);
    this .progressValue = value;
    Transition.transition().tween("progress", () => {
      return (t: any) => {
        const data = interpolateFun(t).toFixed(0);
        this .textSelection.text(`LOADING ${data}%`);
        this .progressSelection.attr("width", data );
      };
    });
  }

  public setText(text: string) {
    this .textSelection.text(text);
  }

  public start() {
    this .textSelection.text(`LOADING 0%`);
  }

  public parse() {
    this .progressSelection.transition().attrTween("width", () => {
      return Interpolators.interpolateNumber(0, 100);
    });
    this .setText(" PARSEING");
  }

  public error() {
    this .setText("LOAD ERROR");
  }

  public dispose() {
    setTimeout(() => {
      Selection.selectAll(`#${this .id}`).remove();
    }, 1000);
  }

}

export default ProgressBar;

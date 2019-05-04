import ProgressBar from "./common/components/ProgressBar";



function mockProgressBar() {
  const e = $("#progressing-bar")[0];
  const progressBar = new ProgressBar(e);
  let i = 0;
  const data = [4, 8, 15, 16, 23, 42,80,99,100];

  let s = setInterval(()=>{
    let d = data[i++]

    if(i > data.length +2){
      clearInterval(s);
      progressBar.dispose();
      return ;
    }

    if(d){
      progressBar.progress(d);
    }
    else{
      progressBar.parse();
    }
    
  },1000);
}
$("#progressing-bar-start").on("click",()=>{
  mockProgressBar();
})

$.when($.ready).then(()=>{
  mockProgressBar();
})





// let i = 0;
// let s = setInterval(()=>{
//   let oldData = data[i-1] || 0;
//   let d = data[i++]
//   console.log(d)
//   if(i > data.length){
//     clearInterval(s);
//     return ;
//   }
//   let interpolateFun = d3.interpolate(oldData,d);
//   d3.transition().tween("progress",()=>{
//     return (t:any)=>{
//       // console.log(t)
//       let data = interpolateFun(t)
//       textSelection.text(`${data}%`);
//       progressSelection.attr("width",data );
//     }
//   })
// },5000);


// d3.select("#progressing-bar")
//     .style("color", "black")
//     .style("background-color", "red");

// var x = d3.scaleLinear()
//     .domain([0, d3.max(data)])
//     .range([0, 420]);

//     d3.select($("#progressing-bar")[0]).selectAll("div")
//       .data(data)
//     .enter().insert("div")
//     .style("background-color", "red")
//       .style("width", function(d) { return x(d) + "px"; })
//       .text(function(d) { return d; });
// console.log($("#progressing-bar")[0],d3.select($("#progressing-bar")[0]))
// console.log(d3.select("#progressing-bar"),    d3.select("#progressing-bar").selectAll("div"))
    // .selectAll("div")

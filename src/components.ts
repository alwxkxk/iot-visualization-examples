import ProgressBar from "./common/components/ProgressBar";
import StripeBar from "./common/components/StripeBar";

function mockProgressBar() {
  const e = $("#progressing-bar")[0];
  const progressBar = new ProgressBar(e);
  let i = 0;
  const data = [4, 8, 15, 16, 23, 42, 80, 99, 100];

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

  }, 1000);
}
$("#progressing-bar-start").on("click", ()=>{
  mockProgressBar();
})




function mockStripeBar(element:Element,value:number) {
  let stripeBar = new StripeBar(element, value);
}

$.when($.ready).then(()=>{
  mockProgressBar();
  mockStripeBar($("#stripe-bar1")[0],100);
})
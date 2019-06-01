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




function mockStripeBar(element:Element,value:number,twinkle?:boolean) {
  return new StripeBar(element, value,{twinkle:twinkle});
}

$.when($.ready).then(()=>{
  mockProgressBar();
  let s1 = mockStripeBar($("#stripe-bar1")[0],30);
  
  mockStripeBar($("#stripe-bar2")[0],84,true);
  mockStripeBar($("#stripe-bar3")[0],100);

  $("#stripe-bar1-value-input").on("change",()=>{
    s1.setValue( Number($("#stripe-bar1-value-input").val()));
  })
})


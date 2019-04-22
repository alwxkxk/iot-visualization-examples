interface ICallback {
  ( error: Error, result?: number ) : void;
}

// https://github.com/mrdoob/stats.js/blob/master/src/Stats.js
interface StatsInterface{
  dom:Element;
  new():any;
  update():any;
}

interface Window { 
  $: any; 
  jquery:any;
  THREE:any;
  Stats: StatsInterface; 
}





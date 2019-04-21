
interface Window { 
  $: any; 
  jquery:any;
  THREE:any;
  Stats: StatsInterface; 
}

// https://github.com/mrdoob/stats.js/blob/master/src/Stats.js
interface StatsInterface{
  dom:Element;
  new():any;
  update():any;
}

interface ICallback {
  ( error: Error, result?: number ) : void;
}

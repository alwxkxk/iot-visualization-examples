import * as $ from "jquery";
import * as THREE from "THREE";

// avoid ts type check error.
declare global {
    interface Window { 
        $: any; 
        jquery:any;
        THREE:any;
    }
}

window.$ = window.jquery = $;
window.THREE = THREE;
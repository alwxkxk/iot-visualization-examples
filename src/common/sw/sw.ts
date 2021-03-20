importScripts("static/js/workbox-sw.js");

// Declare workbox
// declare const workbox: typeof import("workbox-sw");

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);
  workbox.routing.registerRoute(
    /\.(html)/ig,
    new workbox.strategies.StaleWhileRevalidate(),
  );
  workbox.routing.registerRoute(
    /\.(png|jpg|js|css|glb|svg)/ig,
    new workbox.strategies.CacheFirst(),
  );
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}

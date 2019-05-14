// TODO: add type definition for service worker.
// console.log("sw start.");
const CACHE_NAME = "v20190514";

self.addEventListener("activate", function (event) {
  console.log("sw activate.");
});

self.addEventListener("fetch", function (event) {
  // @ts-ignore
  console.log("sw request:", event.request.url);
  // @ts-ignore
  event.respondWith(
    // @ts-ignore
    caches.match(event.request)
      .then(function (response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // IMPORTANT:Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response.
        // @ts-ignore
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function (res) {
            // Check if we received a valid response
            if (!res || res.status !== 200 || res.type !== "basic") {
              return res;
            }

            // IMPORTANT:Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.

            const responseToCache = res.clone();

            caches.open(CACHE_NAME)
              .then(function (cache) {
                // @ts-ignore
                cache.put(event.request, responseToCache);
              });

            return res;
          },
        );
      }),
    );
});

const lastVersion = "v1";
const currentVersion = "v2";
self.addEventListener("install", (event) => {
  event.waitUntil(caches.delete(lastVersion));
  // event.waitUntil(
  //   caches.open(version).then((cache) => {
  //     for (const asset of coreAssets) {
  //       cache.add(new Request(asset));
  //     }
  //     return cache;
  //   })
  // );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  // Offline-first
  if (
    request.headers.get("Accept").includes("text/html") ||
    request.headers.get("Accept").includes("text/css") ||
    request.headers.get("Accept").includes("text/javascript") ||
    request.headers.get("Accept").includes("image")
  ) {
    event.respondWith(
      caches.match(request).then((response) => {
        return (
          response ??
          fetch(request).then((response) => {
            caches.open(currentVersion).then((cache) => {
              cache.put(request, response.clone());
            });
            return response;
          })
        );
      })
    );
  }
});

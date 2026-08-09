// Service worker minimal: doar cache-uieste scheletul aplicatiei
// (nu are nevoie de logica offline complexa - camera oricum
// cere conexiune https activa pe majoritatea dispozitivelor).

var CACHE_NAME = "pocket-scan-v1";
var SHELL = ["./", "./index.html", "./jsQR.js", "./manifest.json"];

self.addEventListener("install", function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE_NAME; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function(event){
  // doar shell-ul propriu; navigarea catre aplicatia Pocket Management
  // (alt domeniu) trece direct prin retea, neschimbata
  var url = event.request.url;
  if(SHELL.some(function(s){ return url.indexOf(s.replace("./","")) !== -1; })){
    event.respondWith(
      caches.match(event.request).then(function(cached){
        return cached || fetch(event.request);
      })
    );
  }
});

const CACHE_NAME = 'imovion-v2.0.0'; // Versão atualizada
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;
const IMAGE_CACHE = `${CACHE_NAME}-images`;

// Assets críticos para cache imediato
const STATIC_ASSETS = [
  '/',
  '/globals.css',
  '/favicon.ico',
  '/imovion.webp',
  '/offline.html',
  '/manifest.json',
  // Adicionar recursos críticos identificados
  '/fonts/inter-var.woff2'
];

// Image domains to cache
const IMAGE_DOMAINS = [
  'supabase.co',
  'googleusercontent.com',
  'unsplash.com'
];

// Network timeout reduzido para resposta mais rápida
const NETWORK_TIMEOUT = 1500; // Reduzido de 3000ms para 1500ms

// Cache strategies
const CACHE_STRATEGIES = {
  // Essential pages - cache first with network fallback
  essential: ['/login', '/cadastro', '/anunciar'],
  
  // API endpoints - network first with cache fallback
  api: ['/api/'],
  
  // Static assets - cache first
  static: ['.css', '.js', '.woff2', '.woff', '.ttf', '.ico'],
  
  // Images - cache with stale-while-revalidate
  images: ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif']
};

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Skip waiting');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Install failed:', error);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('imovion-') && 
                     !cacheName.includes(CACHE_NAME);
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('[SW] Activation failed:', error);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Skip analytics and external tracking
  if (url.hostname.includes('analytics') || 
      url.hostname.includes('gtag') ||
      url.hostname.includes('facebook') ||
      url.hostname.includes('google-analytics')) {
    return;
  }
  
  event.respondWith(handleFetch(request));
});

// Main fetch handler
async function handleFetch(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  try {
    // Handle images
    if (isImage(pathname) || isImageDomain(url.hostname)) {
      return await handleImage(request);
    }
    
    // Handle static assets
    if (isStaticAsset(pathname)) {
      return await handleStatic(request);
    }
    
    // Handle API requests
    if (isApiRequest(pathname)) {
      return await handleApi(request);
    }
    
    // Handle essential pages
    if (isEssentialPage(pathname)) {
      return await handleEssential(request);
    }
    
    // Handle regular pages
    return await handlePage(request);
    
  } catch (error) {
    console.error('[SW] Fetch error:', error);
    return await handleOffline(request);
  }
}

// Image strategy: Cache with stale-while-revalidate
async function handleImage(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);
  
  if (cached) {
    // Return cached version and update in background
    fetchAndCache(request, cache);
    return cached;
  }
  
  try {
    const response = await fetchWithTimeout(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Return placeholder for failed images
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="#e5e7eb"><rect width="100%" height="100%"/><text x="50%" y="50%" text-anchor="middle" dy="0.3em" fill="#9ca3af">Imagem indisponível</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

// Static assets strategy: Cache first
async function handleStatic(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  const response = await fetchWithTimeout(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

// API strategy: Network first with cache fallback
async function handleApi(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    const response = await fetchWithTimeout(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Essential pages strategy: Cache first with network fallback
async function handleEssential(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);
  
  if (cached) {
    // Update cache in background
    fetchAndCache(request, cache);
    return cached;
  }
  
  const response = await fetchWithTimeout(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

// Regular pages strategy: Network first
async function handlePage(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    const response = await fetchWithTimeout(request);
    if (response.ok && response.headers.get('content-type')?.includes('text/html')) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Offline fallback
async function handleOffline(request) {
  if (request.headers.get('accept')?.includes('text/html')) {
    const cache = await caches.open(STATIC_CACHE);
    const offline = await cache.match('/offline.html');
    if (offline) {
      return offline;
    }
  }
  
  return new Response('Offline', { 
    status: 503, 
    statusText: 'Service Unavailable' 
  });
}

// Helper functions
function fetchWithTimeout(request) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Network timeout')), NETWORK_TIMEOUT)
    )
  ]);
}

async function fetchAndCache(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
  } catch (error) {
    console.log('[SW] Background fetch failed:', error);
  }
}

function isImage(pathname) {
  return CACHE_STRATEGIES.images.some(ext => pathname.includes(ext));
}

function isImageDomain(hostname) {
  return IMAGE_DOMAINS.some(domain => hostname.includes(domain));
}

function isStaticAsset(pathname) {
  return CACHE_STRATEGIES.static.some(ext => pathname.includes(ext));
}

function isApiRequest(pathname) {
  return CACHE_STRATEGIES.api.some(path => pathname.startsWith(path));
}

function isEssentialPage(pathname) {
  return CACHE_STRATEGIES.essential.some(path => pathname.startsWith(path));
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'background-sync-imoveis') {
    event.waitUntil(syncImoveis());
  }
});

async function syncImoveis() {
  try {
    // Sync any pending data when back online
    // Implementation depends on your data sync requirements
    console.log('[SW] Syncing imoveis data');
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova atualização disponível',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver detalhes',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Imovion', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('[SW] Service Worker registered successfully');
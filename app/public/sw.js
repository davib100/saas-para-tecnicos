const CACHE_NAME = 'techos-v1.0.0'
const STATIC_CACHE = `${CACHE_NAME}-static`
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/offline.html'
]

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
}

// Route patterns and their strategies
const ROUTE_STRATEGIES = [
  {
    pattern: /\/_next\/static\//,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    cacheName: STATIC_CACHE
  },
  {
    pattern: /\.(?:js|css|woff2|png|jpg|jpeg|svg|webp|ico)$/,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    cacheName: STATIC_CACHE
  },
  {
    pattern: /\/api\//,
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    cacheName: DYNAMIC_CACHE
  }
]

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static assets...')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Static assets cached successfully')
        return self.skipWaiting()
      })
      .catch(error => {
        console.error('Failed to cache static assets:', error)
      })
  )
})

// Activate event - clean old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - handle requests with caching strategies
self.addEventListener('fetch', event => {
  const { request } = event
  const { url, method } = request

  // Only handle GET requests
  if (method !== 'GET') {
    return
  }

  // Skip cross-origin requests
  if (!url.startsWith(self.location.origin)) {
    return
  }

  // Find matching strategy
  const matchedStrategy = ROUTE_STRATEGIES.find(({ pattern }) => 
    pattern.test(url)
  )

  if (matchedStrategy) {
    event.respondWith(
      handleRequest(request, matchedStrategy)
    )
  } else {
    // Default strategy for pages
    event.respondWith(
      handlePageRequest(request)
    )
  }
})

// Handle requests based on strategy
async function handleRequest(request, { strategy, cacheName }) {
  const cache = await caches.open(cacheName)

  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request, cache)
    
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request, cache)
    
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request, cache)
    
    default:
      return fetch(request)
  }
}

// Cache first strategy
async function cacheFirst(request, cache) {
  try {
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('Cache first failed:', error)
    const cachedResponse = await cache.match(request)
    return cachedResponse || new Response('Network error', { status: 503 })
  }
}

// Network first strategy
async function networkFirst(request, cache) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.error('Network first failed, trying cache:', error)
    const cachedResponse = await cache.match(request)
    return cachedResponse || new Response('Offline', { status: 503 })
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request, cache) {
  const cachedResponse = await cache.match(request)
  
  const networkResponsePromise = fetch(request)
    .then(response => {
      if (response.ok) {
        cache.put(request, response.clone())
      }
      return response
    })
    .catch(error => {
      console.error('Stale while revalidate network failed:', error)
    })

  return cachedResponse || networkResponsePromise
}

// Handle page requests with offline fallback
async function handlePageRequest(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('Page request failed:', error)
    
    // Try cache first
    const cache = await caches.open(DYNAMIC_CACHE)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page
    const offlineResponse = await cache.match('/offline.html')
    return offlineResponse || new Response('Offline', { 
      status: 503,
      statusText: 'Service Unavailable'
    })
  }
}

// Handle background sync (for future features)
self.addEventListener('sync', event => {
  console.log('Background sync triggered:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync tasks
      handleBackgroundSync()
    )
  }
})

async function handleBackgroundSync() {
  try {
    // Sync pending data when online
    console.log('Performing background sync...')
    // Implementation for syncing offline actions
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// Handle push notifications (for future features)
self.addEventListener('push', event => {
  console.log('Push notification received:', event)
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do TechOS',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver detalhes',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('TechOS', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event)
  
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})
'use client';

import { useEffect } from 'react';

// Extend ServiceWorkerRegistration for background sync
interface ExtendedServiceWorkerRegistration extends ServiceWorkerRegistration {
  sync?: {
    register(tag: string): Promise<void>;
  };
}

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content available, notify user
                  if (window.confirm('Nova versão disponível! Deseja atualizar?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });

          console.log('✅ Service Worker registrado com sucesso');
        } catch (error) {
          console.error('❌ Falha ao registrar Service Worker:', error);
        }
      };

      // Register on page load
      registerSW();

      // Handle updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }

    // Register for background sync if supported
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        // Register background sync for offline actions
        const extendedReg = registration as ExtendedServiceWorkerRegistration;
        return extendedReg.sync?.register('background-sync-imoveis');
      }).catch((error) => {
        console.log('Background sync não suportado:', error);
      });
    }

    // Register for push notifications if supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        return registration.pushManager.getSubscription();
      }).then((subscription) => {
        if (!subscription) {
          // User not subscribed, could prompt for permission here
          console.log('Push notifications disponíveis mas não ativadas');
        }
      }).catch((error) => {
        console.log('Push notifications não suportadas:', error);
      });
    }
  }, []);

  return null;
}
'use client';

import { useEffect } from 'react';

// Lista de recursos críticos para preload
const criticalResources: Array<{
  href: string;
  as: string;
  type?: string;
  crossOrigin?: string;
}> = [
  // Apenas recursos realmente críticos
  // Removendo imovion.webp, favicon.ico e fonts para evitar warnings
  
  // Stylesheets críticos
  { href: '/globals.css', as: 'style' },
];

// Lista de domains para prefetch
const prefetchDomains = [
  'https://supabase.co',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://vercel.com',
  'https://images.unsplash.com',
];

// Lista de rotas críticas para prefetch
const prefetchRoutes = [
  '/',
  '/login',
  '/cadastro',
  '/anunciar',
];

export default function ResourcePreloader() {
  useEffect(() => {
    // Desabilitar em desenvolvimento para reduzir logs no console
    if (process.env.NODE_ENV === 'development') {
      console.log('ResourcePreloader desabilitado em desenvolvimento');
      return;
    }
    // Função para criar link preload/prefetch
    const createLink = (href: string, rel: string, options: Record<string, string> = {}) => {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      
      Object.entries(options).forEach(([key, value]) => {
        link.setAttribute(key, value);
      });
      
      document.head.appendChild(link);
      return link;
    };

    // Preload recursos críticos
    const preloadLinks = criticalResources.map(resource => {
      const options: Record<string, string> = {};
      if (resource.as) options.as = resource.as;
      if (resource.type) options.type = resource.type;
      if (resource.crossOrigin) options.crossOrigin = resource.crossOrigin;
      
      return createLink(resource.href, 'preload', options);
    });

    // DNS prefetch para domains externos
    const prefetchLinks = prefetchDomains.map(domain => 
      createLink(domain, 'dns-prefetch')
    );

    // Prefetch rotas críticas (após 1 segundo para não bloquear)
    const routePreloadTimeout = setTimeout(() => {
      const routeLinks = prefetchRoutes.map(route => 
        createLink(route, 'prefetch')
      );
      
      // Cleanup function para route links
      return () => {
        routeLinks.forEach(link => {
          if (document.head.contains(link)) {
            document.head.removeChild(link);
          }
        });
      };
    }, 1000);

    // Preload próximas páginas baseado em hover/focus
    const preloadOnInteraction = () => {
      const links = document.querySelectorAll('a[href^="/"]');
      links.forEach(link => {
        const handleInteraction = () => {
          const href = link.getAttribute('href');
          if (href && !document.querySelector(`link[rel="prefetch"][href="${href}"]`)) {
            createLink(href, 'prefetch');
          }
        };

        link.addEventListener('mouseenter', handleInteraction, { once: true });
        link.addEventListener('focus', handleInteraction, { once: true });
      });
    };

    // Executar após DOM carregar
    if (document.readyState === 'complete') {
      preloadOnInteraction();
    } else {
      window.addEventListener('load', preloadOnInteraction);
    }

    // Intersection Observer para lazy preload
    const intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const link = entry.target as HTMLAnchorElement;
          const href = link.getAttribute('href');
          if (href && href.startsWith('/')) {
            createLink(href, 'prefetch');
            intersectionObserver.unobserve(link);
          }
        }
      });
    }, {
      rootMargin: '100px' // Preload quando estiver 100px da viewport
    });

    // Observar links para preload automático
    setTimeout(() => {
      const links = document.querySelectorAll('a[href^="/"]');
      links.forEach(link => intersectionObserver.observe(link));
    }, 2000);

    // Cleanup function
    return () => {
      clearTimeout(routePreloadTimeout);
      intersectionObserver.disconnect();
      
      // Remove preload links
      [...preloadLinks, ...prefetchLinks].forEach(link => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      });
    };
  }, []);

  // Service Worker preload
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Preload recursos no service worker
      navigator.serviceWorker.ready.then(registration => {
        if (registration.active) {
          registration.active.postMessage({
            type: 'PRELOAD_RESOURCES',
            resources: criticalResources.map(r => r.href)
          });
        }
      });
    }
  }, []);

  return null; // Este componente não renderiza nada
}
import { Suspense } from 'react';

// CSS crítico inline para FCP imediato
const criticalCSS = `
  /* Reset e base styles críticos */
  *, *::before, *::after {
    box-sizing: border-box;
  }
  
  html {
    line-height: 1.15;
    -webkit-text-size-adjust: 100%;
  }
  
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 16px;
    line-height: 1.5;
    color: #333;
    background-color: #fff;
  }
  
  /* Loading states para evitar layout shift */
  .loading-skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
  }
  
  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  
  /* Above-the-fold crítico */
  .hero-section {
    min-height: 50vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* Navigation crítica */
  .nav-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }
  
  /* Buttons críticos */
  .btn-primary {
    background-color: #2563eb;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    border: none;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
  }
  
  .btn-primary:hover {
    background-color: #1d4ed8;
  }
  
  /* Grid layouts críticos */
  .grid-container {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
  
  /* Responsive crítico */
  @media (max-width: 768px) {
    .nav-container {
      flex-direction: column;
      gap: 1rem;
    }
    
    .grid-container {
      grid-template-columns: 1fr;
    }
  }
`;

interface CriticalCSSProps {
  children: React.ReactNode;
}

export default function CriticalCSS({ children }: CriticalCSSProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
      <Suspense 
        fallback={
          <div className="loading-skeleton" style={{ height: '100vh' }}>
            <div className="nav-container">
              <div style={{ width: '120px', height: '32px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}></div>
              <div style={{ width: '200px', height: '40px', backgroundColor: '#e5e7eb', borderRadius: '8px' }}></div>
            </div>
            <div className="hero-section">
              <div style={{ width: '300px', height: '200px', backgroundColor: '#e5e7eb', borderRadius: '12px' }}></div>
            </div>
          </div>
        }
      >
        {children}
      </Suspense>
    </>
  );
}
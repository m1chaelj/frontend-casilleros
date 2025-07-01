export const environment = {
  production: true,
  apiUrl: (typeof window !== 'undefined' && (window as any)['NG_API_URL']) || 'https://backend-casilleros.onrender.com'
};

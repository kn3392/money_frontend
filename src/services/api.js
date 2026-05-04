import axios from 'axios';

const TOKEN_KEY = 'smartkhata_token';

const baseURL =
  import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? '';

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  const u = config.url;
  if (
    typeof u === 'string' &&
    u.startsWith('/api/') &&
    !u.startsWith('/api/v1/')
  ) {
    config.url = u.replace(/^\/api\//, '/api/v1/');
  }
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new CustomEvent('smartkhata:auth-logout'));
    }
    return Promise.reject(error);
  }
);

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export { TOKEN_KEY };
export default api;

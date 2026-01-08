const raw = import.meta.env.VITE_API_BASE_URL;
const normalized = raw ? raw.replace(/\/+$|\s+/g, '') : '';
export const API_BASE_URL = normalized || 'http://localhost:8080';

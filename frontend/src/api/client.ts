import axios from 'axios';

// In local dev, VITE_API_URL is empty so requests hit the Vite proxy (/surveys → SAM on 3001).
// In production, set VITE_API_URL to the full API Gateway URL.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
  headers: { 'Content-Type': 'application/json' },
});
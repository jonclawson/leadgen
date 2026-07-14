import { defineEventHandler, getRequestURL } from 'h3';

export default defineEventHandler((event) => {
  const url = getRequestURL(event) || '';
  console.log('Received request for URL:', url.href);
});
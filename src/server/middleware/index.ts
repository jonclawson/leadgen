import { defineEventHandler } from 'h3';

export default defineEventHandler((event) => {
  const url = event.node.req.url || '';
  console.log('Received request for URL:', url);
});
import { defineEventHandler } from 'h3';
import { getPrisma } from '../../../../lib/prisma';


export default defineEventHandler(async () => {
  console.log('Hello from the API route!');
  const prisma = await getPrisma();
  console.log('Prisma client obtained');
  const message = await prisma.message.findFirst();
  console.log('Message obtained from Prisma:', message);
  // return ({ message: message?.body || 'No message found' })

  const keys = Object.keys((globalThis as any)?.global);
  return ({ 
    message: 'Hello from the API!', 
    keys,
    global: Object.keys((globalThis as any)?.global), 
    env: Object.keys((globalThis as any)?.__env__), 
    process: Object.keys((globalThis as any)?.process), 
    _importMeta_: Object.keys((globalThis as any)?._importMeta_), 
    process_env: Object.keys((globalThis as any)?.process?.env), 
  })
});

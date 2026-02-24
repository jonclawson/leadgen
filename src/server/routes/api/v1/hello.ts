import { defineEventHandler } from 'h3';
import { prisma } from '../../../../lib/prisma';


export default defineEventHandler(async () => {
    console.log('Hello from the API route!', process.env.DATABASE_URL);
    const message = await prisma.message.findFirst();
    return ({ message: message?.body || 'No message found' })
    // return ({ message: 'Hello from the API!' })
});

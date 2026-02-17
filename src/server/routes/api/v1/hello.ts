import { defineEventHandler } from 'h3';
import { prisma } from '../../../../lib/prisma';


export default defineEventHandler(async () => {
    const message = await prisma.message.findFirst();
    return ({ message: message?.body || 'No message found' })
});

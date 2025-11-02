import 'module-alias/register';
import { PrismaClient } from '@prisma/client'

import { createApp } from '@/app';

export const prisma = new PrismaClient();

const app = createApp();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

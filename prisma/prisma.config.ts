import { defineConfig } from '@prisma/internals';

export default defineConfig({
  // Disable prepared statements for Supabase connection pooler compatibility
  client: {
    disablePreparedStatements: true,
  },
});

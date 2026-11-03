import { getDatabase, disconnectDatabase, databaseOptions } from '../src/config/database.js';
import { seedDevelopment } from '../src/services/seed.service.js';

try {
  const options = databaseOptions(process.env.DATABASE_URL);
  if (process.env.NODE_ENV === 'production' || !['localhost', '127.0.0.1'].includes(options.host)
    || options.database !== 'seraphine_portfolio_dev') throw new Error('Development database required');
  await seedDevelopment(getDatabase());
  console.log('Development seed completed; existing records preserved. No users, contacts, projects or achievements seeded.');
} catch { console.error('Development seed failed; inspect local configuration/database safely.'); process.exitCode = 1; }
finally { await disconnectDatabase(); }

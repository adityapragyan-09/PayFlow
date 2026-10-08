const logger = require('../utils/logger');

/**
 * Demo invoice seeding is disabled.
 * PayFlow starts with an empty invoice ledger. Invoices are created through the API.
 */
async function seedDatabase() {
  logger.info('[Seed] Demo invoice seeding is disabled. No sample invoices were created.');
  return { seeded: false };
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { seedDatabase };

import { Pool } from 'pg';

export const DatabaseProvider = {
  provide: 'PG_POOL',
  useFactory: async () => {
    return new Pool({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'postgres',
      database: 'nest_db',
    });
  },
};
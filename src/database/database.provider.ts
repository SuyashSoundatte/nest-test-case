import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

export const DatabaseProvider = {
  provide: 'PG_POOL',
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    return new Pool({
      host: configService.get<string>('DB_HOST'),
      port: configService.get<number>('DB_PORT', { infer: true }),
      user: configService.get<string>('DB_USER'),
      password: configService.get<string>('DB_PASSWORD'),
      database: configService.get<string>('DB_NAME'),
    });
  },
};
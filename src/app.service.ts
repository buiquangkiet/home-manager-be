import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger('Database');

  constructor(private readonly dataSource: DataSource) {}

  onModuleInit() {
    if (this.dataSource.isInitialized) {
      const isSupabase = process.env.DATABASE_URL?.includes('supabase');
      const host = isSupabase ? 'Supabase Cloud (PostgreSQL)' : 'Localhost (PostgreSQL)';
      this.logger.log(`Kết nối cơ sở dữ liệu thành công tới: ${host}`);
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}


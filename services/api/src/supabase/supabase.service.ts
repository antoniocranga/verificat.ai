import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

if (typeof global.WebSocket === 'undefined') {
  (global as unknown as Record<string, unknown>).WebSocket = class {};
}

@Injectable()
export class SupabaseService implements OnModuleInit {
  private client!: ReturnType<typeof createClient>;

  onModuleInit() {
    const supabaseUrl =
      process.env.SUPABASE_URL || 'https://wbuiwmwvlwmeyvcbuluw.supabase.co';
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      'fallback-anon-key-for-dev';

    this.client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  getClient(): ReturnType<typeof createClient> {
    return this.client;
  }
}

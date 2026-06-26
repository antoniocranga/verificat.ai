import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  getStats() {
    return { usersCount: 100, pendingFactChecks: 5 };
  }

  async logAction(actorId: string | null, action: string, payload: Record<string, any>) {
    try {
      const { error } = await this.supabaseService.getClient().from('audit_log').insert({
        actor_id: actorId,
        action,
        payload
      } as any);
      
      if (error) {
        this.logger.error(`Failed to insert audit log: ${error.message}`);
      }
    } catch (e) {
      this.logger.error(`Exception while inserting audit log: ${e}`);
    }
  }

  async resolveReport(reportId: string, resolutionNote: string, adminId: string) {
    const { error } = await (this.supabaseService.getClient()
      .from('reports') as any)
      .update({
        status: 'resolved',
        resolution_note: resolutionNote,
        handled_by: adminId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reportId);
      
    if (error) {
      throw new Error(`Failed to resolve report: ${error.message}`);
    }

    await this.logAction(adminId, 'RESOLVE_REPORT', { reportId, resolutionNote });
  }
}

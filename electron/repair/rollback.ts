interface RollbackEntry {
  issueId: string;
  timestamp: string;
  steps: string[];
  restorePointCreated: boolean;
  restorePointDescription?: string;
}

export class RollbackManager {
  private rollbackEntries: Map<string, RollbackEntry> = new Map();
  private restorePoints: Array<{ id: number; description: string; timestamp: string }> = [];

  async createRestorePoint(description: string): Promise<{ success: boolean; message: string; duration?: number }> {
    // Simulated restore point creation
    const start = Date.now();
    await new Promise((r) => setTimeout(r, 1500));

    const point = {
      id: this.restorePoints.length + 1,
      description,
      timestamp: new Date().toISOString(),
    };
    this.restorePoints.push(point);

    return {
      success: true,
      message: `还原点已创建: "${description}" (ID: ${point.id})`,
      duration: (Date.now() - start) / 1000,
    };
  }

  storeRollbackInfo(issueId: string, steps: string[]): void {
    this.rollbackEntries.set(issueId, {
      issueId,
      timestamp: new Date().toISOString(),
      steps,
      restorePointCreated: this.restorePoints.length > 0,
      restorePointDescription: this.restorePoints[this.restorePoints.length - 1]?.description,
    });
  }

  async rollback(issueId: string): Promise<{ success: boolean; message: string; duration?: number }> {
    const entry = this.rollbackEntries.get(issueId);
    if (!entry) {
      return { success: false, message: '未找到回滚信息' };
    }

    const start = Date.now();

    if (entry.restorePointCreated && this.restorePoints.length > 0) {
      // Simulated restore
      await new Promise((r) => setTimeout(r, 2000));
      this.rollbackEntries.delete(issueId);
      return {
        success: true,
        message: `已通过还原点 "${entry.restorePointDescription}" 回滚更改`,
        duration: (Date.now() - start) / 1000,
      };
    }

    // Execute rollback steps in reverse
    for (const step of entry.steps.reverse()) {
      await new Promise((r) => setTimeout(r, 300));
    }

    this.rollbackEntries.delete(issueId);
    return {
      success: true,
      message: '已成功回滚更改',
      duration: (Date.now() - start) / 1000,
    };
  }
}

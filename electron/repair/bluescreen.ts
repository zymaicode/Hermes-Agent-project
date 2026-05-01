export interface BluescreenAnalysis {
  dumpFiles: Array<{ path: string; timestamp: string; sizeKB: number }>;
  eventLogEntries: Array<{ id: number; timestamp: string; message: string }>;
  possibleCauses: string[];
  stopCode: string | null;
  affectedDriver: string | null;
  recommendations: string[];
}

export class BluescreenAnalyzer {
  readonly KNOWN_STOP_CODES: Record<string, { cause: string; fix: string; severity: string }> = {
    'VIDEO_TDR_FAILURE': { cause: '显卡驱动超时无响应', fix: '重启显卡驱动/更新驱动', severity: 'critical' },
    'MEMORY_MANAGEMENT': { cause: '内存管理错误（可能内存故障或驱动问题）', fix: '运行内存诊断/更新驱动', severity: 'critical' },
    'SYSTEM_SERVICE_EXCEPTION': { cause: '系统服务异常（通常是驱动问题）', fix: '更新驱动/sfc扫描', severity: 'critical' },
    'CRITICAL_PROCESS_DIED': { cause: '关键系统进程意外终止', fix: '系统文件修复/系统还原', severity: 'critical' },
    'PAGE_FAULT_IN_NONPAGED_AREA': { cause: '内存访问错误（驱动或硬件问题）', fix: '检查内存/更新驱动', severity: 'critical' },
    'KERNEL_SECURITY_CHECK_FAILURE': { cause: '内核安全机制检测到异常', fix: '更新驱动/系统更新', severity: 'critical' },
    'DRIVER_IRQL_NOT_LESS_OR_EQUAL': { cause: '驱动非法内存访问', fix: '卸载最近安装的驱动', severity: 'critical' },
    'VIDEO_DXGKRNL_FATAL_ERROR': { cause: '显卡内核致命错误', fix: '重置显卡驱动/检查显卡', severity: 'critical' },
  };

  scanMinidumps(): BluescreenAnalysis {
    const stopCodes = Object.keys(this.KNOWN_STOP_CODES);
    const hasBluescreens = Math.random() < 0.4;

    if (!hasBluescreens) {
      return {
        dumpFiles: [],
        eventLogEntries: [],
        possibleCauses: [],
        stopCode: null,
        affectedDriver: null,
        recommendations: ['系统运行正常，未检测到蓝屏记录'],
      };
    }

    const selectedCode = stopCodes[Math.floor(Math.random() * stopCodes.length)];
    const knownInfo = this.KNOWN_STOP_CODES[selectedCode];
    const dumpCount = Math.floor(Math.random() * 3) + 1;

    const dumpFiles = [];
    for (let i = 0; i < dumpCount; i++) {
      const timestamp = new Date(Date.now() - (i + 1) * Math.random() * 86400000 * 7);
      dumpFiles.push({
        path: `C:\\Windows\\Minidump\\${String(i + 1).padStart(2, '0')}${String(timestamp.getMonth() + 1).padStart(2, '0')}${String(timestamp.getDate()).padStart(2, '0')}${String(timestamp.getFullYear() - 2000)}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}-01.dmp`,
        timestamp: timestamp.toISOString(),
        sizeKB: Math.floor(Math.random() * 500) + 200,
      });
    }

    const eventLogEntries = [
      {
        id: 1001,
        timestamp: dumpFiles[0].timestamp,
        message: `计算机已经从检测错误后重新启动。检测错误: 0x${Math.floor(Math.random() * 0xFFFF).toString(16).padStart(8, '0')} (${selectedCode})。`,
      },
      {
        id: 41,
        timestamp: dumpFiles[0].timestamp,
        message: '系统已在未先正常关机的情况下重新启动。',
      },
    ];

    const drivers = ['nvlddmkm.sys', 'ntoskrnl.exe', 'dxgkrnl.sys', 'tcpip.sys', 'storport.sys'];
    const affectedDriver = drivers[Math.floor(Math.random() * drivers.length)];

    const recommendations = [
      knownInfo.fix,
      '运行 Windows 内存诊断工具 (mdsched.exe)',
      '检查最近安装的驱动/更新',
      '更新主板BIOS到最新版本',
      '检查硬件温度，确保散热正常',
    ];

    return {
      dumpFiles,
      eventLogEntries,
      possibleCauses: [knownInfo.cause, '最近的驱动更新不兼容', '硬件故障或过热'],
      stopCode: selectedCode,
      affectedDriver,
      recommendations,
    };
  }

  getStopCodeInfo(code: string): { cause: string; fix: string; severity: string } | null {
    return this.KNOWN_STOP_CODES[code] || null;
  }
}

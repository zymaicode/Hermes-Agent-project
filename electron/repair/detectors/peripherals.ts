import type { DetectedIssue } from '../engine';
import { createRng } from '../utils';

export function detectPeripheralIssues(seed?: number): DetectedIssue[] {
  const issues: DetectedIssue[] = [];
  const rng = createRng(seed);

  const usbControllerError = rng() < 0.08;
  const keyboardError = rng() < 0.04;
  const printerOffline = rng() < 0.12;
  const bluetoothError = rng() < 0.1;

  if (usbControllerError) {
    issues.push({
      id: 'usb-controller-error',
      category: 'peripherals',
      severity: 'warning',
      title: 'USB控制器异常',
      description: 'USB根集线器报告错误，可能导致部分USB设备无法识别',
      details: 'USB控制器驱动异常会导致部分USB端口无法使用。常见原因是驱动冲突或电源管理设置问题。',
      evidence: [
        '控制器: Intel USB 3.0 eXtensible Host Controller',
        '错误代码: 代码43 (Windows已停止此设备)',
        '受影响端口: 2个USB 3.0端口',
        '事件日志: Event ID 3 (USB设备驱动错误)',
      ],
      canAutoFix: true,
      autoFixDescription: '重启USB控制器（禁用后重新启用）',
      canGuideFix: true,
      requiresAdmin: true,
      fixId: 'restart-usb-controller',
      rollbackPlan: '自动回滚: 控制器重启后自动恢复',
    });
  }

  if (keyboardError) {
    issues.push({
      id: 'keyboard-mouse-unresponsive',
      category: 'peripherals',
      severity: 'critical',
      title: '键盘/鼠标可能无响应',
      description: '检测到输入设备驱动异常，可能导致键盘或鼠标无响应',
      details: 'HID输入设备驱动报告错误。可能是驱动冲突或USB端口问题。',
      evidence: [
        '设备: HID Keyboard Device',
        '错误代码: 代码19 (注册表配置错误)',
        '最近更改: Windows更新 KB5031354',
        '建议: 尝试其他USB端口或重启HID服务',
      ],
      canAutoFix: true,
      autoFixDescription: '重启HID人机接口设备服务',
      canGuideFix: true,
      requiresAdmin: true,
      fixId: 'restart-hid-service',
      rollbackPlan: '自动回滚: 服务重启后自动恢复',
    });
  }

  if (printerOffline) {
    issues.push({
      id: 'printer-offline',
      category: 'peripherals',
      severity: 'warning',
      title: '打印机脱机',
      description: '检测到默认打印机处于脱机状态，无法打印',
      details: '打印机脱机可能是网络连接问题、打印后台处理程序停止或打印机电源未开启。',
      evidence: [
        '打印机: HP LaserJet Pro M404dn',
        '状态: 脱机',
        '打印队列: 3个文档等待中',
        '后台处理程序: Print Spooler (运行中)',
        '连接方式: 网络 (IP: 192.168.1.50)',
      ],
      canAutoFix: true,
      autoFixDescription: '重启打印后台处理程序，清除打印队列',
      canGuideFix: true,
      requiresAdmin: true,
      fixId: 'restart-print-spooler',
      rollbackPlan: '自动回滚: 服务重启后自动恢复，但打印队列会被清除',
    });
  }

  if (bluetoothError) {
    issues.push({
      id: 'bluetooth-adapter-error',
      category: 'peripherals',
      severity: 'warning',
      title: '蓝牙适配器异常',
      description: '蓝牙无线收发器报告错误或已关闭，蓝牙设备无法连接',
      details: '蓝牙适配器异常可能由飞行模式、驱动问题或硬件开关关闭引起。',
      evidence: [
        '适配器: Intel Wireless Bluetooth',
        '状态: 无线电已关闭',
        '蓝牙服务: 正在运行',
        '飞行模式: 关闭',
        '固件版本: LMP 11.256',
      ],
      canAutoFix: true,
      autoFixDescription: '重启蓝牙服务和适配器',
      canGuideFix: true,
      requiresAdmin: true,
      fixId: 'restart-bluetooth',
      rollbackPlan: '自动回滚: 蓝牙服务重启后自动恢复',
    });
  }

  return issues;
}

import type { DetectedIssue } from '../engine';

/** Simple seeded PRNG (mulberry32) */
function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function detectNetworkIssues(seed?: number): DetectedIssue[] {
  const issues: DetectedIssue[] = [];
  const rng = seed !== undefined ? seededRandom(seed) : Math.random;

  const pingOk = rng() > 0.1;
  const dnsOk = rng() > 0.15;
  const proxyOk = rng() > 0.2;
  const wifiStrength = rng() * 100;
  const ipConflict = rng() < 0.05;
  const driverError = rng() < 0.08;

  if (!pingOk) {
    issues.push({
      id: 'network-disconnected',
      category: 'network',
      severity: 'critical',
      title: '网络连接断开',
      description: '无法连接到互联网，ping 8.8.8.8 无响应',
      details: '网络完全断开。可能原因: 网线未连接、路由器故障、ISP服务中断或网卡驱动异常。',
      evidence: [
        'Ping 8.8.8.8: 请求超时',
        'Ping 114.114.114.114: 请求超时',
        '默认网关: 无法访问',
        '网卡状态: 已连接（无Internet访问）',
      ],
      canAutoFix: true,
      autoFixDescription: '重置网络配置（释放DHCP、刷新DNS、重置Winsock）',
      canGuideFix: true,
      requiresAdmin: true,
      fixId: 'reset-network-full',
      rollbackPlan: '网络重置后配置将被清除，需要重新连接WiFi（密码需重新输入）',
    });
  }

  if (pingOk && !dnsOk) {
    issues.push({
      id: 'dns-resolution-failure',
      category: 'network',
      severity: 'warning',
      title: 'DNS解析失败',
      description: '可以ping通IP地址但无法解析域名，DNS服务器可能不可用',
      details: 'DNS解析失败意味着可以连接互联网但无法将域名转换为IP地址。可能是DNS服务器设置错误或DNS服务未响应。',
      evidence: [
        'Ping 8.8.8.8: 正常 (延迟 12ms)',
        'Ping www.baidu.com: 无法解析',
        '当前DNS服务器: 192.168.1.1',
        'DNS查询超时: 2秒',
      ],
      canAutoFix: true,
      autoFixDescription: '刷新DNS缓存，将DNS服务器更换为公共DNS (114.114.114.114)',
      canGuideFix: true,
      requiresAdmin: true,
      fixId: 'fix-dns',
      rollbackPlan: 'DNS设置可在网络适配器属性中手动恢复',
    });
  }

  if (!proxyOk) {
    issues.push({
      id: 'proxy-config-error',
      category: 'network',
      severity: 'warning',
      title: '代理配置异常',
      description: '系统配置了代理服务器但无法连接，可能导致部分应用无法上网',
      details: '代理服务器设置可能已过期或配置错误。某些应用使用系统代理设置，错误的配置会导致网络连接失败。',
      evidence: [
        '代理服务器: 127.0.0.1:7890',
        '代理状态: 无法连接',
        '受影响应用: Chrome, Edge, VS Code',
      ],
      canAutoFix: true,
      autoFixDescription: '清除系统代理设置，恢复直连',
      canGuideFix: true,
      requiresAdmin: false,
      fixId: 'reset-proxy',
      rollbackPlan: '可在Windows设置中重新配置代理服务器',
    });
  }

  if (wifiStrength < 30) {
    issues.push({
      id: 'wifi-weak-signal',
      category: 'network',
      severity: 'info',
      title: 'WiFi信号弱',
      description: `WiFi信号强度仅 ${wifiStrength.toFixed(0)}%，可能导致网速慢或频繁断连`,
      details: 'WiFi信号弱通常由距离路由器太远、障碍物遮挡或信道干扰引起。',
      evidence: [
        `信号强度: ${wifiStrength.toFixed(0)}%`,
        '当前SSID: TP-LINK_5G',
        '信道: 6 (2.4GHz)',
        '建议: 切换到5GHz频段或靠近路由器',
      ],
      canAutoFix: false,
      autoFixDescription: '',
      canGuideFix: true,
      requiresAdmin: false,
      fixId: '',
      rollbackPlan: '',
    });
  }

  if (ipConflict) {
    issues.push({
      id: 'ip-address-conflict',
      category: 'network',
      severity: 'critical',
      title: 'IP地址冲突',
      description: '检测到网络中IP地址冲突，可能导致间歇性断网',
      details: '另一台设备使用了相同的IP地址。这通常由手动IP配置或DHCP服务器故障引起。',
      evidence: [
        '冲突IP: 192.168.1.105',
        '本机MAC: 00:E0:4C:68:2A:1F',
        '事件日志: Event ID 4199 (IP冲突)',
      ],
      canAutoFix: true,
      autoFixDescription: '释放并更新DHCP租约，获取新IP地址',
      canGuideFix: true,
      requiresAdmin: true,
      fixId: 'reset-ip-config',
      rollbackPlan: '自动回滚: 重新获取DHCP IP',
    });
  }

  if (driverError) {
    issues.push({
      id: 'nic-driver-error',
      category: 'network',
      severity: 'warning',
      title: '网卡驱动异常',
      description: '网络适配器驱动报告错误，可能导致网络不稳定',
      details: '网卡驱动状态异常。可能是驱动版本过旧或与系统更新不兼容。',
      evidence: [
        '网卡: Realtek PCIe GbE Family Controller',
        '驱动版本: 10.54.1111.2021 (2021年)',
        '驱动状态: 设备管理器报告代码10',
        '建议: 更新网卡驱动',
      ],
      canAutoFix: true,
      autoFixDescription: '重启网络适配器（禁用后重新启用）',
      canGuideFix: true,
      requiresAdmin: true,
      fixId: 'restart-network-adapter',
      rollbackPlan: '自动回滚: 适配器重启后自动恢复',
    });
  }

  return issues;
}

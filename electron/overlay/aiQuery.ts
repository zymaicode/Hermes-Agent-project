import { callAiApi } from '../ai/apiClient';
import type { HardwareSnapshot } from '../hardware/collector';

interface OverlayAiResult {
  answer: string;
  error?: string;
}

export async function handleOverlayAiQuery(
  query: string,
  snapshot: HardwareSnapshot,
  config: { endpoint: string; model: string; apiKey: string }
): Promise<OverlayAiResult> {
  if (!config.apiKey) {
    return { answer: '❌ 请先在设置中配置 API Key', error: 'no_api_key' };
  }

  const systemInfo = [
    `CPU: ${snapshot.cpu.name} — 使用率 ${snapshot.cpu.usage}% — 温度 ${snapshot.cpu.temp}°C`,
    `内存: ${snapshot.memory.total}GB — 占用 ${snapshot.memory.usagePercent}%`,
    `GPU: ${snapshot.gpu.name} — 使用率 ${snapshot.gpu.usage}% — 温度 ${snapshot.gpu.temp}°C`,
    `磁盘: ${snapshot.disks.map(d => `${d.name || d.model}: ${d.usagePercent}%`).join('、')}`,
  ].join('\n');

  const prompt = `你是一个PC硬件助手。以下是当前系统状态：\n${systemInfo}\n\n用户问：${query}\n\n请基于以上数据简短回答（50字以内），给出具体建议。`;

  const res = await callAiApi(config, [{ role: 'user', content: prompt }], 256);

  if (res.error) {
    return { answer: `❌ 查询失败: ${res.error}`, error: res.error };
  }

  return { answer: res.content || '（无回复）' };
}

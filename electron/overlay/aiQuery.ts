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

  try {
    const systemInfo = [
      `CPU: ${snapshot.cpu.name} — 使用率 ${snapshot.cpu.usage}% — 温度 ${snapshot.cpu.temp}°C`,
      `内存: ${snapshot.memory.total}GB — 占用 ${snapshot.memory.usagePercent}%`,
      `GPU: ${snapshot.gpu.name} — 使用率 ${snapshot.gpu.usage}% — 温度 ${snapshot.gpu.temp}°C`,
      `磁盘: ${snapshot.disks.map(d => `${d.name || d.model}: ${d.usagePercent}%`).join('、')}`,
    ].join('\n');

    const prompt = `你是一个PC硬件助手。以下是当前系统状态：\n${systemInfo}\n\n用户问：${query}\n\n请基于以上数据简短回答（50字以内），给出具体建议。`;

    const url = `${config.endpoint}/v1/chat/completions`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 256,
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json() as { choices: Array<{ message: { content: string } }> };
    return { answer: data.choices[0]?.message?.content?.trim() || '（无回复）' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { answer: `❌ 查询失败: ${msg}`, error: msg };
  }
}

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Bot, User, Wrench } from 'lucide-react';
import { useRepairStore } from '../stores/repairStore';

export default function RepairAIChat() {
  const messages = useRepairStore((s) => s.aiChatMessages);
  const sendAiMessage = useRepairStore((s) => s.sendAiMessage);
  const setState = useRepairStore((s) => s.setState);
  const scanResult = useRepairStore((s) => s.scanResult);

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setSending(true);
    try {
      await sendAiMessage(text);
    } finally {
      setSending(false);
    }
  };

  const quickQuestions = scanResult?.issues?.length
    ? [
        '这些问题中最严重的是什么？',
        '我应该先修复哪个问题？',
        '这些问题可能有关联吗？',
      ]
    : [
        '我的电脑突然黑屏了怎么办？',
        '电脑运行越来越慢怎么优化？',
        '无法连接WiFi怎么办？',
      ];

  return (
    <div className="flex-col" style={{ height: '100%' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <button
          onClick={() => setState(scanResult ? 'results' : 'idle')}
          className="btn"
          style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <ArrowLeft size={16} /> 返回
        </button>
        <Bot size={20} style={{ color: 'var(--accent)' }} />
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, flex: 1 }}>AI 诊断助手</h2>
        {scanResult && (
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            基于 {scanResult.issues.length} 个检测结果
          </span>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px' }}>
        {messages.length === 0 && (
          <div style={{ marginTop: 40 }}>
            <div
              style={{
                display: 'flex',
                gap: 12,
                marginBottom: 24,
                padding: '12px 16px',
                background: 'var(--accent-muted)',
                borderRadius: 'var(--radius)',
              }}
            >
              <Bot size={20} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                  您好！我是PCHelper的AI诊断助手。
                  {scanResult
                    ? `我分析了您的扫描结果，发现了 ${scanResult.issues.length} 个潜在问题。请描述您遇到的具体症状，或者尝试以下常见问题:`
                    : '请描述您遇到的电脑问题，我会帮您分析并建议解决方案。您也可以先运行全面扫描来发现潜在问题。'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  className="btn"
                  style={{
                    fontSize: 12,
                    padding: '6px 14px',
                    borderRadius: 16,
                  }}
                  onClick={() => {
                    setInput(q);
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: 12,
              marginBottom: 16,
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {msg.role === 'user' ? (
                <User size={16} style={{ color: '#fff' }} />
              ) : (
                <Bot size={16} style={{ color: 'var(--accent)' }} />
              )}
            </div>
            <div
              style={{
                maxWidth: '75%',
                padding: '10px 14px',
                borderRadius: 'var(--radius)',
                background: msg.role === 'user' ? 'var(--accent-muted)' : 'var(--card-bg)',
                border: msg.role === 'assistant' ? '1px solid var(--border-color)' : 'none',
                fontSize: 13,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            className="input"
            placeholder="描述您的电脑问题..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            style={{ flex: 1 }}
          />
          <button
            onClick={handleSend}
            className="btn btn-primary"
            disabled={!input.trim() || sending}
            style={{
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              opacity: input.trim() && !sending ? 1 : 0.5,
            }}
          >
            <Send size={16} /> 发送
          </button>
        </div>
      </div>
    </div>
  );
}

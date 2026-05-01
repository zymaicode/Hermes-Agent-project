import { useEffect, useRef, useState } from 'react';
import { Send, Trash2, X, ChevronLeft, Sparkles } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { useAppStore } from '../../stores/appStore';

interface Props {
  standalone?: boolean;
}

export default function AIChatPanel({ standalone }: Props) {
  const messages = useChatStore((s) => s.messages);
  const inputText = useChatStore((s) => s.inputText);
  const loading = useChatStore((s) => s.loading);
  const setInputText = useChatStore((s) => s.setInputText);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const fetchHistory = useChatStore((s) => s.fetchHistory);
  const clearHistory = useChatStore((s) => s.clearHistory);
  const setEndpoint = useChatStore((s) => s.setEndpoint);
  const setModel = useChatStore((s) => s.setModel);
  const endpoint = useChatStore((s) => s.endpoint);
  const model = useChatStore((s) => s.model);

  const setChatPanelOpen = useAppStore((s) => s.setChatPanelOpen);

  const [collapsed, setCollapsed] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchHistory();
    window.pchelper.getAllSettings().then((settings) => {
      for (const s of settings) {
        if (s.key === 'ai_endpoint') setEndpoint(s.value);
        if (s.key === 'ai_model') setModel(s.value);
      }
    });
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function handleClose() {
    if (standalone) return;
    setChatPanelOpen(false);
  }

  if (collapsed && !standalone) {
    return (
      <div
        className="chat-panel"
        style={{
          width: 40,
          minWidth: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 12,
          cursor: 'pointer',
        }}
        onClick={() => setCollapsed(false)}
      >
        <ChevronLeft size={18} style={{ color: 'var(--text-secondary)' }} />
        <div
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            fontSize: 11,
            color: 'var(--text-secondary)',
            marginTop: 16,
            letterSpacing: '0.1em',
          }}
        >
          AI Chat
        </div>
      </div>
    );
  }

  return (
    <div
      className={standalone ? undefined : 'chat-panel'}
      style={
        standalone
          ? { flex: 1, display: 'flex', flexDirection: 'column', height: '100%', maxWidth: 800, margin: '0 auto' }
          : undefined
      }
    >
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div className="flex items-center" style={{ gap: 8 }}>
          <Sparkles size={16} style={{ color: 'var(--accent)' }} />
          <span style={{ fontSize: 14, fontWeight: 600 }}>AI Assistant</span>
          <span
            style={{
              fontSize: 10,
              color: 'var(--text-muted)',
              background: 'var(--bg-tertiary)',
              padding: '1px 6px',
              borderRadius: 4,
            }}
          >
            {model}
          </span>
        </div>
        <div className="flex items-center" style={{ gap: 4 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={clearHistory}
            title="Clear chat"
            style={{ padding: 4 }}
          >
            <Trash2 size={14} />
          </button>
          {standalone ? null : (
            <>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setCollapsed(true)}
                title="Collapse"
                style={{ padding: 4 }}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleClose}
                title="Close"
                style={{ padding: 4 }}
              >
                <X size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={listRef}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              textAlign: 'center',
              padding: 24,
            }}
          >
            <div>
              <Sparkles size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <div style={{ fontSize: 13 }}>Ask anything about your system</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Powered by DeepSeek V4 Pro
              </div>
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '85%',
                padding: '8px 14px',
                borderRadius: 12,
                fontSize: 13,
                lineHeight: 1.55,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                background:
                  msg.role === 'user'
                    ? 'var(--accent)'
                    : 'var(--bg-tertiary)',
                color:
                  msg.role === 'user'
                    ? '#fff'
                    : 'var(--text-primary)',
                borderBottomRightRadius: msg.role === 'user' ? 4 : undefined,
                borderBottomLeftRadius: msg.role === 'assistant' ? 4 : undefined,
              }}
            >
              {msg.content}
            </div>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start' }}>
            <div
              style={{
                padding: '8px 14px',
                borderRadius: 12,
                borderBottomLeftRadius: 4,
                background: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
                fontSize: 13,
              }}
            >
              <span className="text-mono" style={{ animation: 'pulse 1.5s infinite' }}>
                Thinking...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          gap: 8,
        }}
      >
        <input
          ref={inputRef}
          className="input"
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          style={{ flex: 1 }}
        />
        <button
          className="btn btn-primary"
          onClick={sendMessage}
          disabled={!inputText.trim() || loading}
          style={{ padding: '6px 12px' }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

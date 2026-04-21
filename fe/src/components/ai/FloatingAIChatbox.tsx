import { useState } from 'react';
import type { FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { Link } from 'react-router-dom';
import { Bot, MessageCircle, Send, Smartphone, X } from 'lucide-react';
import { aiApi } from '../../api/ai';
import type { RecommendedDeviceCard } from '../../types';
import { resolveDeviceImageUrl } from '../../utils/resolveDeviceImageUrl';

type ChatTurn = {
  id: string;
  userMessage: string;
  reply: string;
  devices: RecommendedDeviceCard[];
};

function getAiErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    const fieldError = error.response?.data?.errors?.[0]?.error;
    return message || fieldError || 'AI support is busy right now. Please try again later.';
  }

  return 'AI support is busy right now. Please try again later.';
}

export default function FloatingAIChatbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<ChatTurn[]>([]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const userMessage = message.trim();
    if (!userMessage || loading) return;

    setLoading(true);
    setError('');

    try {
      const { data } = await aiApi.chat({ message: userMessage, limit: 3 });
      const payload = data.data;
      if (!payload) {
        setError('Unable to load AI results right now. Please try again later.');
        return;
      }

      setHistory((prev) => [
        {
          id: `${Date.now()}-${Math.random()}`,
          userMessage,
          reply: payload.reply,
          devices: payload.devices || [],
        },
        ...prev,
      ]);
      setMessage('');
    } catch (error) {
      setError(getAiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen ? (
        <div className="w-[min(92vw,380px)] glass-strong rounded-2xl border border-border shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-light">
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-primary" />
              <p className="text-sm font-semibold text-text-primary">AI Chat Assistant</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/ai-advisor"
                className="text-xs text-primary hover:text-primary-light"
                title="Open AI advisor page"
              >
                Full page
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface"
                aria-label="Close chatbox"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-[52vh] overflow-y-auto p-3 space-y-3 bg-surface/70">
            {history.length === 0 ? (
              <p className="text-xs text-text-muted">Ask the AI for device recommendations.</p>
            ) : (
              history.map((turn) => (
                <div key={turn.id} className="rounded-xl border border-border bg-surface-light p-3 space-y-2">
                  <p className="text-[11px] uppercase tracking-wide text-primary">You asked</p>
                  <p className="text-sm text-text-primary">{turn.userMessage}</p>
                  <p className="text-[11px] uppercase tracking-wide text-primary pt-1">AI replied</p>
                  <p className="text-sm text-text-secondary">{turn.reply}</p>

                  {turn.devices.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {turn.devices.map((device) => {
                        const imageUrl = device.imageUrl || device.image_url;
                        return (
                          <Link
                            key={`${turn.id}-${device.id}`}
                            to={device.detail_url || `/devices/${device.id}`}
                            className="block rounded-lg border border-border bg-background/70 p-2 hover:border-primary/40"
                          >
                            <div className="flex gap-2">
                              <div className="w-12 h-12 rounded bg-surface flex items-center justify-center overflow-hidden shrink-0">
                                {imageUrl ? (
                                  <img
                                    src={resolveDeviceImageUrl(imageUrl)}
                                    alt={device.model_name}
                                    className="max-h-full w-auto object-contain"
                                  />
                                ) : (
                                  <Smartphone size={16} className="text-text-muted" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[11px] text-text-muted">{device.brand_name}</p>
                                <p className="text-xs font-semibold text-text-primary truncate">{device.model_name}</p>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t border-border bg-surface-light">
            <div className="flex gap-2">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Example: Android phone with a long battery life"
                disabled={loading}
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-sm text-text-primary focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="inline-flex items-center justify-center rounded-lg px-3 text-white btn-gradient disabled:opacity-60"
                aria-label="Send message"
              >
                <Send size={14} />
              </button>
            </div>
            {error && <p className="text-xs text-danger mt-2">{error}</p>}
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-full text-white btn-gradient shadow-xl"
          aria-label="Open AI chatbox"
        >
          <MessageCircle size={18} />
          <span className="text-sm font-medium">AI Chat</span>
        </button>
      )}
    </div>
  );
}


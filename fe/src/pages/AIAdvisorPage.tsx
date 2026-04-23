import { useState } from 'react';
import type { FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { Link } from 'react-router-dom';
import { Bot, Send, Smartphone } from 'lucide-react';
import { aiApi } from '../api/ai';
import type { RecommendedDeviceCard } from '../types';
import { resolveDeviceImageUrl } from '../utils/resolveDeviceImageUrl';
import {
  clearRecommendedDevices,
  getRecommendedDevices,
  pushRecommendedDevices,
} from '../utils/recommendedDevices';

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
    return message || fieldError || 'Unable to contact the AI service right now. Please try again later.';
  }

  return 'Unable to contact the AI service right now. Please try again later.';
}

export default function AIAdvisorPage() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [suggestedDevices, setSuggestedDevices] = useState<RecommendedDeviceCard[]>(() => getRecommendedDevices());

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const userMessage = message.trim();
    if (!userMessage) return;

    setLoading(true);
    setError('');

    try {
      const { data } = await aiApi.chat({ message: userMessage, limit: 4 });
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
      setSuggestedDevices(pushRecommendedDevices(payload.devices || []));
      setMessage('');
    } catch (error) {
      setError(getAiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="glass rounded-2xl p-5 sm:p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Bot className="text-primary" size={24} />
          <h1 className="text-2xl font-bold text-text-primary">AI Phone Advisor</h1>
        </div>
        <p className="text-sm text-text-muted mb-4">
          The AI only recommends devices from phoneExample.json and returns cards that link to the device detail page.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Example: I need an Android phone with great battery life under $400"
            className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-surface-light text-text-primary focus:outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white btn-gradient disabled:opacity-60"
          >
            <Send size={16} />
            {loading ? 'Thinking...' : 'Send'}
          </button>
        </form>

        {error && <p className="text-sm text-danger mt-3">{error}</p>}
      </div>

      <div className="space-y-4">
        {suggestedDevices.length > 0 && (
          <div className="glass rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Suggested Devices</h2>
              <button
                type="button"
                onClick={() => {
                  clearRecommendedDevices();
                  setSuggestedDevices([]);
                }}
                className="text-xs text-text-muted hover:text-text-primary"
              >
                Clear
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestedDevices.map((device) => {
                const imageUrl = device.imageUrl || device.image_url;
                return (
                  <Link
                    key={`saved-${device.id}`}
                    to={device.detail_url || `/devices/${device.id}`}
                    className="rounded-xl border border-border bg-surface-light p-3 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex gap-3">
                      <div className="w-20 h-20 rounded-lg bg-background flex items-center justify-center overflow-hidden shrink-0">
                        {imageUrl ? (
                          <img
                            src={resolveDeviceImageUrl(imageUrl)}
                            alt={device.model_name}
                            className="max-h-full w-auto object-contain"
                          />
                        ) : (
                          <Smartphone size={24} className="text-text-muted" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-text-muted">{device.brand_name || 'Brand not specified'}</p>
                        <h3 className="text-sm font-semibold text-text-primary truncate">{device.model_name}</h3>
                        <p className="text-xs text-text-muted mt-1 truncate">{device.os || 'OS not specified'}</p>
                        {device.price && <p className="text-xs text-primary mt-1">{device.price}</p>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {history.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-text-muted">
            Ask a question and the AI will suggest suitable devices.
          </div>
        ) : (
          history.map((turn) => (
            <div key={turn.id} className="glass rounded-2xl p-5 sm:p-6">
              <p className="text-xs uppercase tracking-wide text-primary mb-2">You asked</p>
              <p className="text-text-primary mb-4">{turn.userMessage}</p>

              <p className="text-xs uppercase tracking-wide text-primary mb-2">AI replied</p>
              <p className="text-text-secondary mb-4">{turn.reply}</p>

              {turn.devices.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {turn.devices.map((device) => {
                    const imageUrl = device.imageUrl || device.image_url;
                    return (
                      <Link
                        key={`${turn.id}-${device.id}`}
                        to={device.detail_url || `/devices/${device.id}`}
                        className="rounded-xl border border-border bg-surface-light p-3 hover:border-primary/40 transition-colors"
                      >
                        <div className="flex gap-3">
                          <div className="w-20 h-20 rounded-lg bg-background flex items-center justify-center overflow-hidden shrink-0">
                            {imageUrl ? (
                              <img
                                src={resolveDeviceImageUrl(imageUrl)}
                                alt={device.model_name}
                                className="max-h-full w-auto object-contain"
                              />
                            ) : (
                              <Smartphone size={24} className="text-text-muted" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-text-muted">{device.brand_name}</p>
                            <h3 className="text-sm font-semibold text-text-primary truncate">{device.model_name}</h3>
                            <p className="text-xs text-text-muted mt-1 truncate">{device.os || 'OS not specified'}</p>
                            {device.price && <p className="text-xs text-primary mt-1">{device.price}</p>}
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
    </div>
  );
}



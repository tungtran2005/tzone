import type { RecommendedDeviceCard } from '../types';

const RECOMMENDED_DEVICES_KEY = 'ai_recommended_devices';
const MAX_RECOMMENDED_DEVICES = 24;

const normalizeText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const normalizeRecommendedDevice = (value: unknown): RecommendedDeviceCard | null => {
  if (!value || typeof value !== 'object') return null;

  const candidate = value as Record<string, unknown>;
  const id = normalizeText(candidate.id);
  const modelName = normalizeText(candidate.model_name);
  const brandName = normalizeText(candidate.brand_name);

  if (!id || !modelName) return null;

  const detailUrl = normalizeText(candidate.detail_url) || `/devices/${id}`;
  const imageUrl = normalizeText(candidate.imageUrl);
  const imageUrlSnake = normalizeText(candidate.image_url);

  return {
    id,
    model_name: modelName,
    brand_name: brandName,
    detail_url: detailUrl,
    imageUrl: imageUrl || undefined,
    image_url: imageUrlSnake || undefined,
    os: normalizeText(candidate.os) || undefined,
    chipset: normalizeText(candidate.chipset) || undefined,
    memory: normalizeText(candidate.memory) || undefined,
    battery: normalizeText(candidate.battery) || undefined,
    price: normalizeText(candidate.price) || undefined,
  };
};

const normalizeRecommendedDevices = (value: unknown): RecommendedDeviceCard[] => {
  if (!Array.isArray(value)) return [];

  const unique = new Set<string>();
  const devices: RecommendedDeviceCard[] = [];

  value.forEach((item) => {
    const normalized = normalizeRecommendedDevice(item);
    if (!normalized || unique.has(normalized.id)) return;

    unique.add(normalized.id);
    devices.push(normalized);
  });

  return devices;
};

export const getRecommendedDevices = (): RecommendedDeviceCard[] => {
  try {
    const raw = localStorage.getItem(RECOMMENDED_DEVICES_KEY);
    if (!raw) return [];

    return normalizeRecommendedDevices(JSON.parse(raw));
  } catch {
    return [];
  }
};

export const pushRecommendedDevices = (incoming: RecommendedDeviceCard[]): RecommendedDeviceCard[] => {
  const latest = normalizeRecommendedDevices(incoming);
  if (latest.length === 0) {
    return getRecommendedDevices();
  }

  const current = getRecommendedDevices().filter((device) => !latest.some((item) => item.id === device.id));
  const next = [...latest, ...current].slice(0, MAX_RECOMMENDED_DEVICES);
  localStorage.setItem(RECOMMENDED_DEVICES_KEY, JSON.stringify(next));

  return next;
};

export const clearRecommendedDevices = () => {
  localStorage.removeItem(RECOMMENDED_DEVICES_KEY);
};


import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { devicesApi } from '../api/devices';
import type { Device } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { BarChart3, Plus, X, Smartphone, Search } from 'lucide-react';
import { resolveDeviceImageUrl } from '../utils/resolveDeviceImageUrl';

export default function ComparePage() {
  const [searchParams] = useSearchParams();
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [selected, setSelected] = useState<(Device | null)[]>([null, null]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [selectorOpen, setSelectorOpen] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<Device[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRequestIdRef = useRef(0);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const { data } = await devicesApi.getAll(1, 100);
        const devices = data.data?.devices || [];
        setAllDevices(devices);

        // Pre-select device from URL
        const preselected = searchParams.get('device');
        if (!preselected) return;

        const found = devices.find((d) => d.id === preselected);
        if (found) {
          setSelected([found, null]);
          return;
        }

        // Fallback when preselected device is not in the first page.
        const detailRes = await devicesApi.getById(preselected);
        if (detailRes.data.data) {
          setSelected([detailRes.data.data, null]);
        }
      } finally {
        setLoadingDevices(false);
      }
    };

    bootstrap();
  }, [searchParams]);

  useEffect(() => {
    if (selectorOpen === null) {
      setSearchLoading(false);
      setSearchResults([]);
      return;
    }

    const keyword = searchText.trim();
    if (keyword.length < 2) {
      setSearchLoading(false);
      setSearchResults([]);
      return;
    }

    const requestId = ++searchRequestIdRef.current;
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const { data } = await devicesApi.search(keyword, 1, 20);
        if (searchRequestIdRef.current !== requestId) return;
        setSearchResults(data.data?.devices || []);
      } catch {
        if (searchRequestIdRef.current !== requestId) return;
        setSearchResults([]);
      } finally {
        if (searchRequestIdRef.current === requestId) {
          setSearchLoading(false);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText, selectorOpen]);

  const handleSelect = (slotIdx: number, device: Device) => {
    setSelected((prev) => {
      const next = [...prev];
      next[slotIdx] = device;
      return next;
    });
    setSelectorOpen(null);
    setSearchText('');
    setSearchResults([]);
  };

  const handleRemove = (slotIdx: number) => {
    setSelected((prev) => {
      const next = [...prev];
      next[slotIdx] = null;
      return next;
    });
  };

  const handleAddSlot = () => {
    if (selected.length < 3) {
      setSelected((prev) => [...prev, null]);
    }
  };

  const dropdownDevices = searchText.trim().length >= 2 ? searchResults : allDevices;

  const activeDevices = selected.filter(Boolean) as Device[];

  // Spec comparison rows
  const specRows = [
    { label: 'Network', get: (d: Device) => d.specifications?.network?.technology },
    { label: 'Announced', get: (d: Device) => d.specifications?.launch?.announced },
    { label: 'Status', get: (d: Device) => d.specifications?.launch?.status },
    { label: 'Dimensions', get: (d: Device) => d.specifications?.body?.dimensions },
    { label: 'Weight', get: (d: Device) => d.specifications?.body?.weight },
    { label: 'Build', get: (d: Device) => d.specifications?.body?.build },
    { label: 'SIM', get: (d: Device) => d.specifications?.body?.sim },
    { label: 'IP Rating', get: (d: Device) => d.specifications?.body?.ip_rating },
    { label: 'Display Type', get: (d: Device) => d.specifications?.display?.type },
    { label: 'Display Size', get: (d: Device) => d.specifications?.display?.size },
    { label: 'Resolution', get: (d: Device) => d.specifications?.display?.resolution },
    { label: 'OS', get: (d: Device) => d.specifications?.platform?.os },
    { label: 'Chipset', get: (d: Device) => d.specifications?.platform?.chipset },
    { label: 'CPU', get: (d: Device) => d.specifications?.platform?.cpu },
    { label: 'GPU', get: (d: Device) => d.specifications?.platform?.gpu },
    { label: 'Memory', get: (d: Device) => d.specifications?.memory?.internal },
    { label: 'Card Slot', get: (d: Device) => d.specifications?.memory?.card_lot },
    { label: 'Main Camera', get: (d: Device) => d.specifications?.mainCamera?.triple || d.specifications?.mainCamera?.single },
    { label: 'Camera Features', get: (d: Device) => d.specifications?.mainCamera?.features },
    { label: 'Video', get: (d: Device) => d.specifications?.mainCamera?.video },
    { label: 'Selfie Camera', get: (d: Device) => d.specifications?.selfieCamera?.single },
    { label: 'Loudspeaker', get: (d: Device) => d.specifications?.sound?.loudspeaker },
    { label: '3.5mm Jack', get: (d: Device) => d.specifications?.sound?.['jack_3.5mm'] },
    { label: 'WLAN', get: (d: Device) => d.specifications?.comms?.wlan },
    { label: 'Bluetooth', get: (d: Device) => d.specifications?.comms?.bluetooth },
    { label: 'NFC', get: (d: Device) => d.specifications?.comms?.nfc },
    { label: 'USB', get: (d: Device) => d.specifications?.comms?.usb },
    { label: 'Sensors', get: (d: Device) => d.specifications?.features?.sensors },
    { label: 'Battery', get: (d: Device) => d.specifications?.battery?.type },
    { label: 'Charging', get: (d: Device) => d.specifications?.battery?.charging },
    { label: 'Colors', get: (d: Device) => d.specifications?.misc?.colors },
    { label: 'Price', get: (d: Device) => d.specifications?.misc?.price },
  ];

  if (loadingDevices) return <LoadingSpinner text="Loading devices..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 size={28} className="text-primary" />
          <h1 className="text-3xl font-bold text-text-primary">Compare Devices</h1>
        </div>
        <p className="text-text-muted">Select up to 3 devices to compare side by side</p>
      </div>

      {/* Device selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {selected.map((device, idx) => (
          <div key={idx} className="relative">
            {device ? (
              <div className="glass rounded-2xl p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-surface-light flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {device.imageUrl ? (
                    <img src={resolveDeviceImageUrl(device.imageUrl)} alt={device.model_name} className="max-h-full w-auto object-contain" />
                  ) : (
                    <Smartphone size={24} className="text-text-muted" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{device.model_name}</p>
                  <p className="text-xs text-text-muted truncate">
                    {device.specifications?.platform?.chipset?.split('(')[0].trim()}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(idx)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-surface-lighter/50 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setSearchText('');
                  setSearchResults([]);
                  setSelectorOpen(idx);
                }}
                className="w-full glass rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-text-muted hover:text-text-secondary hover:border-border-light transition-all min-h-[88px]"
              >
                <Plus size={20} />
                <span className="text-sm">Select device</span>
              </button>
            )}

            {/* Dropdown selector */}
            {selectorOpen === idx && (
              <div className="absolute top-full left-0 right-0 mt-2 glass rounded-xl shadow-2xl z-20 max-h-80 overflow-hidden animate-fadeIn">
                <div className="p-3 border-b border-border">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="text"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      placeholder="Search devices..."
                      autoFocus
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface-light border border-border text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>
                <div className="overflow-y-auto max-h-60">
                  {searchLoading ? (
                    <div className="px-4 py-3 text-sm text-text-muted">Searching devices...</div>
                  ) : dropdownDevices.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-text-muted">
                      {searchText.trim().length >= 2 ? 'No devices found' : 'No devices available'}
                    </div>
                  ) : (
                    dropdownDevices.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => handleSelect(idx, d)}
                        disabled={selected.some((s) => s?.id === d.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <div className="w-8 h-8 rounded-lg bg-surface-lighter flex items-center justify-center flex-shrink-0">
                          {d.imageUrl ? (
                            <img src={resolveDeviceImageUrl(d.imageUrl)} alt="" className="max-h-full w-auto object-contain" />
                          ) : (
                            <Smartphone size={14} className="text-text-muted" />
                          )}
                        </div>
                        <span className="text-sm text-text-primary truncate">{d.model_name}</span>
                      </button>
                    ))
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectorOpen(null);
                    setSearchText('');
                    setSearchResults([]);
                  }}
                  className="w-full px-4 py-2.5 text-xs text-text-muted hover:bg-surface-light border-t border-border transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}

        {selected.length < 3 && (
          <button
            onClick={handleAddSlot}
            className="glass rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-text-muted hover:text-text-secondary border-dashed border-2 border-border hover:border-border-light transition-all min-h-[88px]"
          >
            <Plus size={20} />
            <span className="text-sm">Add device</span>
          </button>
        )}
      </div>

      {/* Comparison table */}
      {activeDevices.length >= 2 ? (
        <div className="glass rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-4 text-xs font-semibold text-text-muted w-40">Specification</th>
                {activeDevices.map((d) => (
                  <th key={d.id} className="text-left px-5 py-4 text-xs font-semibold text-text-primary">
                    {d.model_name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {specRows.map((row, idx) => {
                const values = activeDevices.map((d) => row.get(d) || '—');
                const allSame = values.every((v) => v === values[0]);

                return (
                  <tr key={idx} className="border-b border-border last:border-0 hover:bg-surface-light/30 transition-colors">
                    <td className="px-5 py-3 text-xs font-medium text-text-muted whitespace-nowrap">{row.label}</td>
                    {values.map((val, vIdx) => (
                      <td
                        key={vIdx}
                        className={`px-5 py-3 text-xs leading-relaxed ${
                          !allSame && val !== '—' ? 'text-primary font-medium' : 'text-text-secondary'
                        }`}
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass rounded-2xl p-12 text-center">
          <BarChart3 size={48} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-secondary">Select at least 2 devices to compare</p>
        </div>
      )}
    </div>
  );
}

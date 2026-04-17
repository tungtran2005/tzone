import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Smartphone } from 'lucide-react';
import { devicesApi } from '../../api/devices';
import type { Device } from '../../types';
import { resolveDeviceImageUrl } from '../../utils/resolveDeviceImageUrl';

interface DeviceSearchBarProps {
  placeholder?: string;
  className?: string;
}

export function DeviceSearchBar({
  placeholder = 'Search devices...',
  className = '',
}: DeviceSearchBarProps) {
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const keyword = query.trim();
    if (keyword.length < 2) {
      setResults([]);
      setLoading(false);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setOpen(true);
      try {
        const { data } = await devicesApi.search(keyword, 1, 8);
        setResults(data.data?.devices || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectDevice = (deviceId?: string) => {
    if (!deviceId) return;
    setQuery('');
    setResults([]);
    setOpen(false);
    navigate(`/devices/${deviceId}`);
  };

  const showDropdown = open && query.trim().length >= 2;

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (query.trim().length >= 2) {
            setOpen(true);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results.length > 0) {
            handleSelectDevice(results[0].id);
          }
        }}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface-light border border-border text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-primary transition-all"
      />

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 glass rounded-xl border border-border shadow-2xl overflow-hidden z-50 animate-fadeIn">
          {loading ? (
            <div className="px-4 py-3 text-sm text-text-muted">Searching devices...</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-text-muted">No devices found</div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {results.map((device) => (
                <button
                  key={device.id}
                  onClick={() => handleSelectDevice(device.id)}
                  className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-surface-light transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-surface-lighter flex items-center justify-center overflow-hidden flex-shrink-0">
                    {device.imageUrl ? (
                      <img src={resolveDeviceImageUrl(device.imageUrl)} alt="" className="max-h-full w-auto object-contain" />
                    ) : (
                      <Smartphone size={15} className="text-text-muted" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-text-primary font-medium truncate">{device.model_name}</p>
                    <p className="text-xs text-text-muted truncate">
                      {device.specifications?.platform?.chipset?.split('(')[0].trim() || 'Device'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DeviceSearchBar;




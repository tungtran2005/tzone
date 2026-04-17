import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { brandsApi } from '../api/brands';
import { devicesApi } from '../api/devices';
import type { Brand, Device } from '../types';
import { ArrowRight, Smartphone, Layers, BarChart3, Zap, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { resolveDeviceImageUrl } from '../utils/resolveDeviceImageUrl';

export default function HomePage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsRes, devicesRes] = await Promise.all([
          brandsApi.getAll(1, 8),
          devicesApi.getAll(1, 8),
        ]);
        setBrands(brandsRes.data.data?.brands || []);
        setDevices(devicesRes.data.data?.devices || []);
      } catch (err) {
        console.error('Failed to fetch homepage data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-primary mb-6 animate-fadeIn">
              <Zap size={14} />
              Compare smartphones like a pro
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight animate-fadeIn stagger-1" style={{ opacity: 0 }}>
              Find Your Perfect{' '}
              <span className="gradient-text">Smartphone</span>
            </h1>
            <p className="mt-6 text-lg text-text-secondary max-w-2xl mx-auto animate-fadeIn stagger-2" style={{ opacity: 0 }}>
              Compare detailed specifications across hundreds of devices. Make informed decisions with side-by-side comparisons of display, camera, battery, and more.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center animate-fadeIn stagger-3" style={{ opacity: 0 }}>
              <Link
                to="/brands"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white btn-gradient"
              >
                Browse Brands
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/compare"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-text-primary border border-border hover:bg-surface-light transition-all"
              >
                <BarChart3 size={18} />
                Compare Devices
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Smartphone,
              title: 'Detailed Specs',
              desc: 'Access over 15 specification categories for each device, from network bands to sensor data.',
              color: 'from-primary/20 to-primary/5',
            },
            {
              icon: BarChart3,
              title: 'Side-by-Side',
              desc: 'Compare up to 3 devices simultaneously with highlighted differences for quick analysis.',
              color: 'from-accent/20 to-accent/5',
            },
            {
              icon: Layers,
              title: 'All Major Brands',
              desc: 'Browse devices from all leading manufacturers, organized by brand for easy navigation.',
              color: 'from-success/20 to-success/5',
            },
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="glass rounded-2xl p-6 card-hover"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-4`}>
                  <Icon size={22} className="text-text-primary" />
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-2">{feat.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Brands Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Popular Brands</h2>
            <p className="text-sm text-text-muted mt-1">Explore devices from top manufacturers</p>
          </div>
          <Link
            to="/brands"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-light transition-colors"
          >
            View all <ChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading brands..." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                to={`/brands/${brand.id}`}
                className="glass rounded-xl p-5 text-center card-hover group"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-surface-lighter to-surface-light flex items-center justify-center mb-3 group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300">
                  <span className="text-xl font-bold gradient-text">
                    {brand.brand_name?.[0]?.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-text-primary">{brand.brand_name}</h3>
                {/*<p className="text-xs text-text-muted mt-1">*/}
                {/*  {brand.devices?.length || 0} devices*/}
                {/*</p>*/}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Latest Devices */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Latest Devices</h2>
            <p className="text-sm text-text-muted mt-1">Recently added smartphones</p>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading devices..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {devices.map((device) => (
              <Link
                key={device.id}
                to={`/devices/${device.id}`}
                className="glass rounded-2xl overflow-hidden card-hover group"
              >
                <div className="aspect-square bg-gradient-to-br from-surface-lighter/50 to-surface-light flex items-center justify-center p-6 overflow-hidden">
                  {device.imageUrl ? (
                    <img
                      src={resolveDeviceImageUrl(device.imageUrl)}
                      alt={device.model_name}
                      className="max-h-full w-auto object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <Smartphone size={48} className="text-text-muted" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-text-primary truncate">
                    {device.model_name}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {device.specifications?.platform?.chipset && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium truncate max-w-full">
                        {device.specifications.platform.chipset.split('(')[0].trim()}
                      </span>
                    )}
                    {device.specifications?.display?.size && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                        {device.specifications.display.size.split('(')[0].trim()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

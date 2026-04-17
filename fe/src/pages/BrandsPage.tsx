import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { brandsApi } from '../api/brands';
import type { Brand, PaginationMeta } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Pagination from '../components/ui/Pagination';
import { SearchInput } from '../components/ui/SearchInput';
import { Tag } from 'lucide-react';

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchBrands(page, search);
  }, [page, search]);

  const fetchBrands = async (p: number, q: string) => {
    setLoading(true);
    try {
      const request = q.trim() ? brandsApi.search(q.trim(), p, 12) : brandsApi.getAll(p, 12);
      const { data } = await request;
      setBrands(data.data?.brands || []);
      setPagination(data.data?.pagination || null);
    } catch (err) {
      console.error('Failed to fetch brands', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">All Brands</h1>
        <p className="text-text-muted mt-1">Browse devices organized by manufacturer</p>
      </div>

      {/* Search */}
      <SearchInput
        value={search}
        onChange={(value) => {
          setPage(1);
          setSearch(value);
        }}
        placeholder="Search brands..."
        className="max-w-md mb-8"
      />

      {loading ? (
        <LoadingSpinner text="Loading brands..." />
      ) : brands.length === 0 ? (
        <div className="text-center py-20">
          <Tag size={48} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-secondary">No brands found{search ? ` for "${search}"` : ''}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {brands.map((brand, i) => (
              <Link
                key={brand.id}
                to={`/brands/${brand.id}`}
                className="glass rounded-xl p-5 text-center card-hover group animate-fadeIn"
                style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-surface-lighter to-surface-light flex items-center justify-center mb-3 group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300">
                  <span className="text-2xl font-bold gradient-text">
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

          {pagination && (
            <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
          )}
        </>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { brandsApi } from '../../api/brands';
import type { Brand, PaginationMeta } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { SearchInput } from '../../components/ui/SearchInput';
import { Plus, Pencil, Trash2, X, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BrandManagePage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandName, setBrandName] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchBrands(page, search);
  }, [page, search]);

  const fetchBrands = async (p: number, q: string) => {
    setLoading(true);
    try {
      const request = q.trim() ? brandsApi.search(q.trim(), p, 10) : brandsApi.getAll(p, 10);
      const { data } = await request;
      setBrands(data.data?.brands || []);
      setPagination(data.data?.pagination || null);
    } catch {
      toast.error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingBrand(null);
    setBrandName('');
    setModalOpen(true);
  };

  const openEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setBrandName(brand.brand_name || '');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!brandName.trim()) {
      toast.error('Brand name is required');
      return;
    }
    setSaving(true);
    try {
      if (editingBrand) {
        await brandsApi.update(editingBrand.id!, { brand_name: brandName.trim() });
        toast.success('Brand updated');
      } else {
        await brandsApi.create({ brand_name: brandName.trim() });
        toast.success('Brand created');
      }
      setModalOpen(false);
      fetchBrands(page, search);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    try {
      await brandsApi.delete(deleteTarget.id);
      toast.success('Brand deleted');
      setDeleteTarget(null);
      fetchBrands(page, search);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Manage Brands</h1>
          <p className="text-sm text-text-muted mt-1">Create, edit, and delete brands</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white btn-gradient"
        >
          <Plus size={16} /> Add Brand
        </button>
      </div>

      <SearchInput
        value={search}
        onChange={(value) => {
          setPage(1);
          setSearch(value);
        }}
        placeholder="Search brands..."
        className="max-w-md mb-6"
      />

      {loading ? (
        <LoadingSpinner text="Loading brands..." />
      ) : brands.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Tag size={48} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-secondary">No brands found{search ? ` for "${search}"` : ''}</p>
          <button onClick={openCreate} className="mt-4 text-sm text-primary hover:text-primary-light font-medium">
            Create your first brand
          </button>
        </div>
      ) : (
        <>
          <div className="glass rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-light/30">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted">#</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted">Brand Name</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted">Devices</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((brand, idx) => (
                  <tr key={brand.id} className="border-b border-border last:border-0 hover:bg-surface-light/30 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-text-muted">
                      {((pagination?.page || 1) - 1) * (pagination?.limit || 10) + idx + 1}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <span className="text-xs font-bold gradient-text">{brand.brand_name?.[0]?.toUpperCase()}</span>
                        </div>
                        <span className="text-sm font-medium text-text-primary">{brand.brand_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-text-secondary">
                      {brand.devices?.length || 0}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(brand)}
                          className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(brand)}
                          className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && (
            <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative glass rounded-2xl p-6 w-full max-w-md animate-fadeIn shadow-2xl">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-lighter/50 transition-colors"
            >
              <X size={18} />
            </button>
            <h2 className="text-lg font-semibold text-text-primary mb-5">
              {editingBrand ? 'Edit Brand' : 'New Brand'}
            </h2>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Brand Name</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Apple, Samsung..."
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl bg-surface-light border border-border text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary border border-border hover:bg-surface-light transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white btn-gradient disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingBrand ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Brand"
        message={`Are you sure you want to delete "${deleteTarget?.brand_name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { devicesApi } from '../../api/devices';
import { brandsApi } from '../../api/brands';
import type { Device, Brand, PaginationMeta, Specifications } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { SearchInput } from '../../components/ui/SearchInput';
import { resolveDeviceImageUrl } from '../../utils/resolveDeviceImageUrl';
import { Plus, Pencil, Trash2, X, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

const emptySpecs: Specifications = {
  network: { technology: '', bands_2g: '', bands_3g: '', bands_4g: '', bands_5g: '', speed: '' },
  launch: { announced: '', status: '' },
  body: { dimensions: '', weight: '', build: '', sim: '', ip_rating: '' },
  display: { type: '', size: '', resolution: '' },
  platform: { os: '', chipset: '', cpu: '', gpu: '' },
  memory: { card_lot: '', internal: '' },
  mainCamera: { triple: '', single: '', features: '', video: '' },
  selfieCamera: { single: '', video: '' },
  sound: { loudspeaker: '', 'jack_3.5mm': '' },
  comms: { wlan: '', bluetooth: '', positioning: '', nfc: '', radio: '', usb: '' },
  features: { sensors: '' },
  battery: { type: '', charging: '' },
  misc: { colors: '', models: '', price: '' },
};

export default function DeviceManagePage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Device | null>(null);
  const [form, setForm] = useState({ brandId: '', modelName: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [specs, setSpecs] = useState<Specifications>(emptySpecs);
  const [saving, setSaving] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Device | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    brandsApi.getAll(1, 100).then(({ data }) => setBrands(data.data?.brands || []));
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    fetchDevices(page, search);
  }, [page, search]);

  const fetchDevices = async (p: number, q: string) => {
    setLoading(true);
    try {
      const request = q.trim() ? devicesApi.search(q.trim(), p, 10) : devicesApi.getAll(p, 10);
      const { data } = await request;
      setDevices(data.data?.devices || []);
      setPagination(data.data?.pagination || null);
    } catch {
      toast.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ brandId: '', modelName: '' });
    setImageFile(null);
    setImagePreview('');
    setSpecs(JSON.parse(JSON.stringify(emptySpecs)));
    setModalOpen(true);
  };

  const openEdit = (device: Device) => {
    setEditing(device);
    setForm({
      brandId: device.brand_id || '',
      modelName: device.model_name || '',
    });
    setImageFile(null);
    setImagePreview(resolveDeviceImageUrl(device.imageUrl));
    setSpecs(device.specifications || JSON.parse(JSON.stringify(emptySpecs)));
    setModalOpen(true);
  };

  const handleImageChange = (file?: File) => {
    if (imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    if (!file) {
      setImageFile(null);
      setImagePreview(editing ? resolveDeviceImageUrl(editing.imageUrl) : '');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const updateSpec = (section: string, field: string, value: string) => {
    setSpecs((prev) => ({
      ...prev,
      [section]: {
        ...(prev as any)[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!form.brandId || !form.modelName) {
      toast.error('Brand and model name are required');
      return;
    }
    if (!editing && !imageFile) {
      toast.error('Image is required when creating a device');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await devicesApi.update(editing.id!, {
          brand_id: form.brandId,
          model_name: form.modelName,
          image: imageFile || undefined,
          specifications: specs,
        });
        toast.success('Device updated');
      } else {
        await devicesApi.create({
          brand_id: form.brandId,
          model_name: form.modelName,
          image: imageFile!,
          specifications: specs,
        });
        toast.success('Device created');
      }
      setModalOpen(false);
      fetchDevices(page, search);
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
      await devicesApi.delete(deleteTarget.id);
      toast.success('Device deleted');
      setDeleteTarget(null);
      fetchDevices(page, search);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const specSections = [
    {
      key: 'network', title: 'Network',
      fields: [
        { key: 'technology', label: 'Technology' },
        { key: 'bands_2g', label: '2G Bands' },
        { key: 'bands_3g', label: '3G Bands' },
        { key: 'bands_4g', label: '4G Bands' },
        { key: 'bands_5g', label: '5G Bands' },
        { key: 'speed', label: 'Speed' },
      ],
    },
    {
      key: 'launch', title: 'Launch',
      fields: [
        { key: 'announced', label: 'Announced' },
        { key: 'status', label: 'Status' },
      ],
    },
    {
      key: 'body', title: 'Body',
      fields: [
        { key: 'dimensions', label: 'Dimensions' },
        { key: 'weight', label: 'Weight' },
        { key: 'build', label: 'Build' },
        { key: 'sim', label: 'SIM' },
        { key: 'ip_rating', label: 'IP Rating' },
      ],
    },
    {
      key: 'display', title: 'Display',
      fields: [
        { key: 'type', label: 'Type' },
        { key: 'size', label: 'Size' },
        { key: 'resolution', label: 'Resolution' },
      ],
    },
    {
      key: 'platform', title: 'Platform',
      fields: [
        { key: 'os', label: 'OS' },
        { key: 'chipset', label: 'Chipset' },
        { key: 'cpu', label: 'CPU' },
        { key: 'gpu', label: 'GPU' },
      ],
    },
    {
      key: 'memory', title: 'Memory',
      fields: [
        { key: 'card_lot', label: 'Card Slot' },
        { key: 'internal', label: 'Internal' },
      ],
    },
    {
      key: 'mainCamera', title: 'Main Camera',
      fields: [
        { key: 'triple', label: 'Triple' },
        { key: 'single', label: 'Single' },
        { key: 'features', label: 'Features' },
        { key: 'video', label: 'Video' },
      ],
    },
    {
      key: 'selfieCamera', title: 'Selfie Camera',
      fields: [
        { key: 'single', label: 'Single' },
        { key: 'video', label: 'Video' },
      ],
    },
    {
      key: 'sound', title: 'Sound',
      fields: [
        { key: 'loudspeaker', label: 'Loudspeaker' },
        { key: 'jack_3.5mm', label: '3.5mm Jack' },
      ],
    },
    {
      key: 'comms', title: 'Comms',
      fields: [
        { key: 'wlan', label: 'WLAN' },
        { key: 'bluetooth', label: 'Bluetooth' },
        { key: 'positioning', label: 'Positioning' },
        { key: 'nfc', label: 'NFC' },
        { key: 'radio', label: 'Radio' },
        { key: 'usb', label: 'USB' },
      ],
    },
    {
      key: 'features', title: 'Features',
      fields: [
        { key: 'sensors', label: 'Sensors' },
      ],
    },
    {
      key: 'battery', title: 'Battery',
      fields: [
        { key: 'type', label: 'Type' },
        { key: 'charging', label: 'Charging' },
      ],
    },
    {
      key: 'misc', title: 'Misc',
      fields: [
        { key: 'colors', label: 'Colors' },
        { key: 'models', label: 'Models' },
        { key: 'price', label: 'Price' },
      ],
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Manage Devices</h1>
          <p className="text-sm text-text-muted mt-1">Create, edit, and delete devices</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white btn-gradient"
        >
          <Plus size={16} /> Add Device
        </button>
      </div>

      <SearchInput
        value={search}
        onChange={(value) => {
          setPage(1);
          setSearch(value);
        }}
        placeholder="Search devices..."
        className="max-w-md mb-6"
      />

      {loading ? (
        <LoadingSpinner text="Loading devices..." />
      ) : devices.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Smartphone size={48} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-secondary">No devices found{search ? ` for "${search}"` : ''}</p>
          <button onClick={openCreate} className="mt-4 text-sm text-primary hover:text-primary-light font-medium">
            Create your first device
          </button>
        </div>
      ) : (
        <>
          <div className="glass rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-light/30">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted">#</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted">Device</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted hidden sm:table-cell">Chipset</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted hidden md:table-cell">Display</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device, idx) => (
                  <tr key={device.id} className="border-b border-border last:border-0 hover:bg-surface-light/30 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-text-muted">
                      {((pagination?.page || 1) - 1) * (pagination?.limit || 10) + idx + 1}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-lighter flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {device.imageUrl ? (
                            <img src={resolveDeviceImageUrl(device.imageUrl)} alt="" className="max-h-full w-auto object-contain" />
                          ) : (
                            <Smartphone size={16} className="text-text-muted" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-text-primary truncate max-w-[200px]">
                          {device.model_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-text-secondary hidden sm:table-cell truncate max-w-[180px]">
                      {device.specifications?.platform?.chipset?.split('(')[0].trim() || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-text-secondary hidden md:table-cell">
                      {device.specifications?.display?.size?.split('(')[0].trim() || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(device)}
                          className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(device)}
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
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative glass rounded-2xl p-6 w-full max-w-3xl animate-fadeIn shadow-2xl mb-10">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-lighter/50 transition-colors"
            >
              <X size={18} />
            </button>
            <h2 className="text-lg font-semibold text-text-primary mb-6">
              {editing ? 'Edit Device' : 'New Device'}
            </h2>

            {/* Basic info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Brand</label>
                <select
                  value={form.brandId}
                  onChange={(e) => setForm({ ...form, brandId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-light border border-border text-text-primary text-sm focus:outline-none focus:border-primary transition-all"
                >
                  <option value="">Select brand...</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.brand_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Model Name</label>
                <input
                  type="text"
                  value={form.modelName}
                  onChange={(e) => setForm({ ...form, modelName: e.target.value })}
                  placeholder="e.g. iPhone 15 Pro"
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-light border border-border text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-primary transition-all"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Device Image {editing ? '(optional when updating)' : ''}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e.target.files?.[0])}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-light border border-border text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-primary transition-all"
                />
                {imagePreview && (
                  <div className="mt-3 w-28 h-28 rounded-xl bg-surface-lighter border border-border overflow-hidden flex items-center justify-center">
                    <img src={imagePreview} alt="Preview" className="max-h-full w-auto object-contain" />
                  </div>
                )}
              </div>
            </div>

            {/* Specifications */}
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
              {specSections.map((section) => (
                <div key={section.key} className="rounded-xl border border-border overflow-hidden">
                  <div className="px-4 py-2.5 bg-surface-light/30 border-b border-border">
                    <h3 className="text-xs font-semibold text-text-primary">{section.title}</h3>
                  </div>
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {section.fields.map((field) => (
                      <div key={field.key}>
                        <label className="block text-[11px] font-medium text-text-muted mb-1">{field.label}</label>
                        <input
                          type="text"
                          value={(specs as any)?.[section.key]?.[field.key] || ''}
                          onChange={(e) => updateSpec(section.key, field.key, e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-surface border border-border text-text-primary text-xs placeholder:text-text-muted focus:outline-none focus:border-primary transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
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
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Device"
        message={`Are you sure you want to delete "${deleteTarget?.model_name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

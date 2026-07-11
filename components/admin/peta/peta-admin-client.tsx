"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { FasilitasRow } from "@/types";
import {
  Edit,
  MapPin,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

interface PetaAdminClientProps {
  initialFasilitas: FasilitasRow[];
}

const DEFAULT_CATEGORIES = [
  "Masjid",
  "Musholla",
  "Posyandu",
  "Wisata",
  "Jalan",
  "Sekolah / Pendidikan",
];

interface FasilitasFormData {
  nama_fasum: string;
  kategori_ikon: string;
  latitude: string;
  longitude: string;
  deskripsi: string;
  url_foto: string;
}

const emptyForm: FasilitasFormData = {
  nama_fasum: "",
  kategori_ikon: "",
  latitude: "",
  longitude: "",
  deskripsi: "",
  url_foto: "",
};

export function PetaAdminClient({ initialFasilitas }: PetaAdminClientProps) {
  const [fasilitas, setFasilitas] = useState(initialFasilitas);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FasilitasFormData>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [newCategoryInput, setNewCategoryInput] = useState("");

  const allCategories = useMemo(() => {
    const fromData = fasilitas.map((f) => f.kategori_ikon).filter(Boolean);
    const merged = new Set([...DEFAULT_CATEGORIES, ...fromData, ...customCategories]);
    return Array.from(merged).sort((a, b) => a.localeCompare(b, "id"));
  }, [fasilitas, customCategories]);

  const filtered = useMemo(() => {
    let items = fasilitas;
    if (filterCategory !== "all") {
      items = items.filter((f) => f.kategori_ikon === filterCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (f) =>
          f.nama_fasum.toLowerCase().includes(q) ||
          f.deskripsi.toLowerCase().includes(q)
      );
    }
    return items;
  }, [fasilitas, filterCategory, searchQuery]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    fasilitas.forEach((f) => {
      stats[f.kategori_ikon] = (stats[f.kategori_ikon] || 0) + 1;
    });
    return stats;
  }, [fasilitas]);

  const openCreateModal = useCallback(() => {
    setEditingId(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((item: FasilitasRow) => {
    setEditingId(item.id);
    setFormData({
      nama_fasum: item.nama_fasum,
      kategori_ikon: item.kategori_ikon,
      latitude: item.latitude,
      longitude: item.longitude,
      deskripsi: item.deskripsi,
      url_foto: item.url_foto,
    });
    setIsModalOpen(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_fasum || !formData.kategori_ikon || !formData.latitude || !formData.longitude) {
      toast.error("Nama, kategori, latitude, dan longitude wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingId ? `/api/fasilitas/${editingId}` : "/api/fasilitas";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || "Gagal menyimpan data.");
        return;
      }

      toast.success(data.message);
      setIsModalOpen(false);

      // Refresh data
      const refreshRes = await fetch("/api/fasilitas/refresh");
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (refreshData.data) setFasilitas(refreshData.data);
      } else {
        // Fallback: reload
        window.location.reload();
      }
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/fasilitas/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || "Gagal menghapus fasilitas.");
        return;
      }

      toast.success(data.message);
      setFasilitas((prev) => prev.filter((f) => f.id !== id));
      setDeleteConfirmId(null);
    } catch {
      toast.error("Terjadi kesalahan saat menghapus data.");
    }
  };

  const handleAddCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    if (allCategories.includes(trimmed)) {
      toast.error("Kategori sudah ada.");
      return;
    }
    setCustomCategories((prev) => [...prev, trimmed]);
    setNewCategoryInput("");
    toast.success(`Kategori "${trimmed}" berhasil ditambahkan.`);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col tablet:flex-row tablet:items-center tablet:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Peta & GIS</h1>
          <p className="text-gray-500 mt-2">
            Kelola data fasilitas yang ditampilkan di peta interaktif.
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2 shadow-sm w-fit">
          <Plus className="h-4 w-4" />
          Tambah Fasilitas
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 mobile:grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4">
        <Card className="bg-transparent rounded-md">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Fasilitas</p>
                <p className="text-2xl font-bold mt-1">{fasilitas.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-primary/40" />
            </div>
          </CardContent>
        </Card>
        {Object.entries(categoryStats)
          .sort(([a], [b]) => a.localeCompare(b, "id"))
          .slice(0, 3)
          .map(([cat, count]) => (
            <Card key={cat} className="bg-transparent rounded-md">
              <CardContent className="pt-5">
                <p className="text-sm text-muted-foreground">{cat}</p>
                <p className="text-2xl font-bold mt-1">{count}</p>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Category Management */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Manajemen Kategori</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {allCategories.map((cat) => (
            <span
              key={cat}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-600"
            >
              {cat}
              <span className="ml-1.5 text-slate-400">({categoryStats[cat] || 0})</span>
            </span>
          ))}
        </div>
        <div className="flex gap-2 max-w-md">
          <input
            type="text"
            placeholder="Nama kategori baru..."
            value={newCategoryInput}
            onChange={(e) => setNewCategoryInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
            className="flex-1 h-9 px-3 rounded-lg bg-white border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-primary/50"
          />
          <Button size="sm" onClick={handleAddCategory} variant="outline" className="h-9">
            <Plus className="h-4 w-4 mr-1" />
            Tambah
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col tablet:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari fasilitas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-white border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="h-10 px-3 rounded-lg bg-white border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-primary/50 min-w-[160px]"
        >
          <option value="all">Semua Kategori</option>
          {allCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-slate-600">Nama Fasilitas</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600">Kategori</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 hidden tablet:table-cell">Koordinat</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-400">
                    <MapPin className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="font-medium">Tidak ada fasilitas</p>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-slate-900">{item.nama_fasum}</p>
                        {item.deskripsi && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                            {item.deskripsi}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {item.kategori_ikon}
                      </span>
                    </td>
                    <td className="py-3 px-4 hidden tablet:table-cell">
                      <code className="text-xs text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">
                        {parseFloat(item.latitude).toFixed(6)}, {parseFloat(item.longitude).toFixed(6)}
                      </code>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(item)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4 text-slate-500" />
                        </Button>
                        {deleteConfirmId === item.id ? (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                              className="h-8 text-xs"
                            >
                              Hapus
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirmId(null)}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
              <h3 className="text-lg font-bold text-slate-900">
                {editingId ? "Edit Fasilitas" : "Tambah Fasilitas"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">
                  Nama Fasilitas <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nama_fasum}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nama_fasum: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="contoh: Masjid Al-Ikhlas"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.kategori_ikon}
                  onChange={(e) => setFormData((prev) => ({ ...prev, kategori_ikon: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  required
                >
                  <option value="">Pilih kategori...</option>
                  {allCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">
                    Latitude <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.latitude}
                    onChange={(e) => setFormData((prev) => ({ ...prev, latitude: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="0.4561"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">
                    Longitude <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.longitude}
                    onChange={(e) => setFormData((prev) => ({ ...prev, longitude: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="117.5132"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Deskripsi</label>
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) => setFormData((prev) => ({ ...prev, deskripsi: e.target.value }))}
                  className="w-full h-24 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  placeholder="Deskripsi singkat tentang fasilitas ini..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">URL Foto</label>
                <input
                  type="url"
                  value={formData.url_foto}
                  onChange={(e) => setFormData((prev) => ({ ...prev, url_foto: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="https://..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Menyimpan...
                    </>
                  ) : editingId ? (
                    "Simpan Perubahan"
                  ) : (
                    "Tambah Fasilitas"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

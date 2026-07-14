"use client";

import { Button } from "@/components/ui/button";
import type { FasilitasRow } from "@/types";
import {
  Check,
  ChevronsUpDown,
  Image as ImageIcon,
  Loader2,
  Plus,
  X
} from "lucide-react";
import Image from "next/image";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { usePetaForm } from "@/hooks/admin/use-peta-form";
import { PetaLocationPickerDynamic } from "./peta-location-picker-dynamic";

interface PetaFormFieldsProps {
  existingCategories: string[];
  initialData?: FasilitasRow;
  onSuccess?: () => void;
}

export function PetaFormFields({
  existingCategories,
  initialData,
  onSuccess,
}: PetaFormFieldsProps) {
  const {
    form,
    isLoading,
    comboboxOpen,
    setComboboxOpen,
    isDragging,
    search,
    setSearch,
    customCategories,
    setCustomCategories,
    mode,
    selectedPreview,
    allCategories,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleRemovePhoto,
    handleCancel,
    onSubmit,
  } = usePetaForm({ existingCategories, initialData, onSuccess });

  const kategori = form.watch("kategori_ikon");

  const latitude = form.watch("latitude");
  const longitude = form.watch("longitude");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-3xl space-y-10 pb-20"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Foto Fasilitas */}
          <div className="space-y-2 md:col-span-2">
            <Label className="text-sm font-semibold">
              Foto Fasilitas (Opsional)
            </Label>
            <div className="relative group mt-1">
              <label
                htmlFor="dropzone-file"
                className={cn(
                  "flex flex-col items-center justify-center w-full h-40 border border-dashed rounded-md cursor-pointer overflow-hidden transition-all relative",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-slate-300 bg-transparent hover:border-slate-400/80 hover:bg-slate-50",
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {selectedPreview ? (
                  <>
                    <Image
                      src={selectedPreview}
                      alt="Preview foto fasilitas"
                      fill
                      className="object-cover opacity-40 group-hover:opacity-20 transition-opacity"
                      unoptimized={selectedPreview.startsWith("blob:")}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
                      <ImageIcon className="w-6 h-6 text-foreground mb-2" />
                      <p className="text-sm text-foreground font-semibold">
                        Ganti Gambar
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center z-10 relative">
                    <div className="flex gap-4 items-center mb-3 text-slate-500">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <p className="text-[13px] text-slate-500">
                      Geser & Lepas berkas disini
                    </p>
                  </div>
                )}
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
              {selectedPreview && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 z-20 h-8 w-8 rounded-full shadow-md"
                  onClick={handleRemovePhoto}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Nama Fasilitas */}
          <div className="space-y-2 md:col-span-2">
            <FormField
              control={form.control}
              name="nama_fasum"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">
                    Nama Fasilitas <span className="text-red-500 ml-0.5">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Masjid Al-Ikhlas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Kategori */}
          <div className="space-y-2 md:col-span-2">
            <FormField
              control={form.control}
              name="kategori_ikon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">
                    Kategori <span className="text-red-500 ml-0.5">*</span>
                  </FormLabel>
                  <FormControl>
                    <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                      <PopoverTrigger
                        render={
                          <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            aria-expanded={comboboxOpen}
                            className={cn(
                              "w-full justify-between h-14 font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          />
                        }
                      >
                        {field.value
                          ? field.value
                          : "Pilih atau ketik kategori..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-(--anchor-width) p-0"
                        align="start"
                      >
                        <Command>
                          <CommandInput
                            placeholder="Cari kategori..."
                            value={search}
                            onValueChange={(val) =>
                              setSearch(val.charAt(0).toUpperCase() + val.slice(1)) // Capitalize First Letter
                            }
                          />
                          <CommandList>
                            <CommandEmpty>
                              <Button
                                type="button"
                                variant="ghost"
                                className="w-full justify-start text-sm"
                                onPointerDown={(event) => {
                                  event.preventDefault();
                                  const newCat = search.trim();
                                  if (
                                    !customCategories.includes(newCat) &&
                                    !existingCategories.includes(newCat)
                                  ) {
                                    setCustomCategories([
                                      ...customCategories,
                                      newCat,
                                    ]);
                                  }
                                  field.onChange(newCat);
                                  setComboboxOpen(false);
                                  setSearch("");
                                }}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Buat &quot;{search.trim()}&quot;
                              </Button>
                            </CommandEmpty>
                            <CommandGroup>
                              {allCategories.map((cat) => (
                                <CommandItem
                                  key={cat}
                                  value={cat}
                                  onSelect={() => {
                                    field.onChange(
                                      field.value === cat ? "" : cat,
                                    );
                                    setComboboxOpen(false);
                                    setSearch("");
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value?.toLowerCase() ===
                                        cat.toLowerCase()
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  {cat}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Koordinat */}
          <div className="space-y-4 md:col-span-2">
            <div>
              <Label className="text-sm font-semibold">
                Koordinat Lokasi <span className="text-red-500 ml-0.5">*</span>
              </Label>
              <div className="mt-2 mb-4">
                <PetaLocationPickerDynamic
                  latitude={latitude}
                  longitude={longitude}
                  onChange={(lat, lng) => {
                    form.setValue("latitude", lat, { shouldValidate: true });
                    form.setValue("longitude", lng, { shouldValidate: true });
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Latitude */}
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">
                        Latitude <span className="text-red-500 ml-0.5">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Contoh: 0.45612"
                          {...field}
                          onChange={(e) => {
                            const val = e.target.value.replace(/,/g, ".");
                            const sanitizedValue = val.replace(/[^\d.-]/g, "");
                            field.onChange(sanitizedValue);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Longitude */}
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">
                        Longitude <span className="text-red-500 ml-0.5">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Contoh: 117.51320"
                          {...field}
                          onChange={(e) => {
                            const val = e.target.value.replace(/,/g, ".");
                            const sanitizedValue = val.replace(/[^\d.-]/g, "");
                            field.onChange(sanitizedValue);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Deskripsi */}
          <div className="space-y-2 md:col-span-2">
            <FormField
              control={form.control}
              name="deskripsi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">
                    Deskripsi (Opsional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tulis deskripsi singkat fasilitas..."
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 md:col-span-2">
          <Button
            type="button"
            variant="destructive"
            disabled={isLoading}
            className="w-full sm:w-auto text-base h-14 order-2 sm:order-1"
            onClick={handleCancel}
          >Batal
          </Button>

          <Button
            type="submit"
            className="w-full sm:flex-1 text-base h-14 order-1 sm:order-2"
            disabled={isLoading || !kategori}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : null}
            {isLoading
              ? "Menyimpan..."
              : mode === "edit"
                ? "Simpan Perubahan"
                : "Simpan Fasilitas"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

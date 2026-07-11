export default function PetaLoading() {
  return (
    <div className="flex h-[calc(100vh-5rem)] w-full items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Memuat peta...</p>
      </div>
    </div>
  );
}

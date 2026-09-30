import { useEffect, useId, useState } from "react";
import { Camera, FileText, Paperclip, X } from "lucide-react";
import { cn } from "@/utils/cn";

export interface PickedFile {
  name: string;
  size: number;
}

interface FilePickerProps {
  value: PickedFile | null;
  onChange: (file: PickedFile | null) => void;
  label: string;
  hint: string;
  /** e.g. "image/*,application/pdf" */
  accept: string;
  maxMb?: number;
  /** Shows a camera icon; phones offer camera, gallery and files in their picker. */
  camera?: boolean;
}

const formatSize = (bytes: number) => (bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1000))} KB`);

/** Real file selection with type and size checks. Only the file name and size are kept. */
export function FilePicker({ value, onChange, label, hint, accept, maxMb = 5, camera }: FilePickerProps) {
  const id = useId();
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const pick = (file: File | undefined) => {
    setError(null);
    if (!file) return;
    const allowed = accept.split(",").some((rule) => {
      const r = rule.trim();
      return r.endsWith("/*") ? file.type.startsWith(r.slice(0, -1)) : file.type === r;
    });
    if (!allowed) return setError("This file type is not supported. Use a photo or PDF.");
    if (file.size > maxMb * 1_000_000) return setError(`File is ${formatSize(file.size)}. The limit is ${maxMb} MB.`);
    setPreview(file.type.startsWith("image/") ? URL.createObjectURL(file) : null);
    onChange({ name: file.name, size: file.size });
  };

  const clear = () => {
    setPreview(null);
    onChange(null);
  };

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-success/40 bg-success-soft px-3 py-3">
        {preview ? (
          <img src={preview} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-success-dark">
            <FileText className="h-5 w-5" />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-semibold text-ink">{value.name}</span>
          <span className="block text-[12px] text-success-dark">{formatSize(value.size)}</span>
        </span>
        <button type="button" onClick={clear} aria-label="Remove file" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-white">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <label
        htmlFor={id}
        className={cn(
          "flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed px-4 py-3.5 transition hover:bg-navy-50/60",
          error ? "border-danger bg-danger-soft/40" : "border-navy-200",
        )}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
          {camera ? <Camera className="h-5 w-5" /> : <Paperclip className="h-5 w-5" />}
        </span>
        <span className="min-w-0">
          <span className="block text-[13.5px] font-semibold text-ink">{label}</span>
          <span className="block text-[12px] text-ink-muted">{hint}</span>
        </span>
        <input
          id={id}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => {
            pick(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </label>
      {error && <p className="mt-1.5 text-[12px] text-danger">{error}</p>}
    </div>
  );
}

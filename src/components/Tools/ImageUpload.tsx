import { useState } from "react";
import { uploadMethodImage } from "../../services/storage";

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
}

export default function ImageUpload({
  onImageUploaded,
  currentImageUrl,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(
    currentImageUrl || null
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Show preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Upload to Supabase
      const imageUrl = await uploadMethodImage(file);
      onImageUploaded(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
      setPreview(currentImageUrl || null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text">Method Image</span>
      </label>

      <div className="flex flex-col gap-4">
        {preview && (
          <div className="avatar">
            <div className="w-32 h-32 rounded-box">
              <img src={preview} alt="Preview" />
            </div>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          className="file-input file-input-bordered w-full"
          onChange={handleFileSelect}
          disabled={uploading}
        />

        {uploading && (
          <div className="flex items-center gap-2">
            <span className="loading loading-spinner loading-sm"></span>
            <span className="text-sm">Uploading...</span>
          </div>
        )}

        {error && <div className="alert alert-error text-sm">{error}</div>}

        <div className="label">
          <span className="label-text-alt">Max size: 5MB. PNG, JPG, WebP</span>
        </div>
      </div>
    </div>
  );
}

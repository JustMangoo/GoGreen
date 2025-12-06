import { useState } from "react";
import { createMethod } from "../../services/methods";
import ImageUpload from "./ImageUpload";
import { X } from "lucide-react";

interface AddMethodFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AddMethodForm({
  onSuccess,
  onCancel,
}: AddMethodFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    duration: "",
    image_url: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (
      !formData.title ||
      !formData.description ||
      !formData.category ||
      !formData.duration
    ) {
      setError("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    try {
      await createMethod(formData);
      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        duration: "",
        image_url: "",
      });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create method");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <h2 className="card-title">Add New Method</h2>
          {onCancel && (
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-circle"
              onClick={onCancel}
            >
              <X size={20} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-control">
            <label className="label">
              <span className="label-text">Title *</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Quick Pickle Vegetables"
              className="input input-bordered"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Description *</span>
            </label>
            <textarea
              placeholder="Describe the preservation method..."
              className="textarea textarea-bordered h-24"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Category *</span>
            </label>
            <select
              className="select select-bordered"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
            >
              <option value="">Select a category</option>
              <option value="Canning">Canning</option>
              <option value="Pickling">Pickling</option>
              <option value="Drying">Drying</option>
              <option value="Fermenting">Fermenting</option>
              <option value="Freezing">Freezing</option>
              <option value="Smoking">Smoking</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Duration *</span>
            </label>
            <input
              type="text"
              placeholder="e.g., 30 min, 2-4 hours, 1-2 weeks"
              className="input input-bordered"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: e.target.value })
              }
              required
            />
          </div>

          <ImageUpload
            onImageUploaded={(url: string) =>
              setFormData({ ...formData, image_url: url })
            }
            currentImageUrl={formData.image_url}
          />

          <div className="card-actions justify-end gap-2">
            {onCancel && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onCancel}
                disabled={submitting}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Creating...
                </>
              ) : (
                "Add Method"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

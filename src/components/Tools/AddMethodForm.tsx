import { useState, useEffect } from "react";
import { createMethod } from "../../services/methods";
import type { Step } from "../../services/methods";
import ImageUpload from "./ImageUpload";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import Popup from "./Popup";

interface AddMethodFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

export default function AddMethodForm({
  isOpen,
  onClose,
  onSuccess,
}: AddMethodFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    duration: "",
    image_url: "",
  });
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState<Partial<Step>>({
    order: 1,
    title: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuthorization = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user?.email === ADMIN_EMAIL) {
        setIsAuthorized(true);
      } else {
        setError("Only authorized users can add methods");
        setIsAuthorized(false);
      }
    };
    checkAuthorization();
  }, []);

  const handleAddStep = () => {
    if (!currentStep.title || !currentStep.description) {
      setError("Please fill in step title and description");
      return;
    }

    const newStep: Step = {
      order: steps.length + 1,
      title: currentStep.title,
      description: currentStep.description,
    };

    setSteps([...steps, newStep]);
    setCurrentStep({
      order: steps.length + 2,
      title: "",
      description: "",
    });
    setError(null);
  };

  const handleRemoveStep = (index: number) => {
    const updated = steps.filter((_, i) => i !== index);
    // Reorder steps
    const reordered = updated.map((step, i) => ({
      ...step,
      order: i + 1,
    }));
    setSteps(reordered);
  };

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
      await createMethod({
        ...formData,
        steps: steps.length > 0 ? steps : undefined,
      });
      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        duration: "",
        image_url: "",
      });
      setSteps([]);
      setCurrentStep({
        order: 1,
        title: "",
        description: "",
      });
      onClose();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create method");
    } finally {
      setSubmitting(false);
    }
  };

  const formContent = (
    <div className="flex flex-col gap-4 max-h-96 overflow-y-auto">
      {error && <div className="alert alert-error text-sm">{error}</div>}

      <div className="form-control">
        <label className="label">
          <span className="label-text text-sm">Title *</span>
        </label>
        <input
          type="text"
          placeholder="e.g., Quick Pickle Vegetables"
          className="input input-bordered input-sm"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text text-sm">Description *</span>
        </label>
        <textarea
          placeholder="Describe the preservation method..."
          className="textarea textarea-bordered textarea-sm h-20"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text text-sm">Category *</span>
        </label>
        <select
          className="select select-bordered select-sm"
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
          <span className="label-text text-sm">Duration *</span>
        </label>
        <input
          type="text"
          placeholder="e.g., 30 min, 2-4 hours, 1-2 weeks"
          className="input input-bordered input-sm"
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

      {/* Steps Section */}
      <div className="divider my-0">Steps (Optional)</div>

      {/* Display added steps */}
      {steps.length > 0 && (
        <div className="space-y-2">
          <label className="label">
            <span className="label-text font-semibold text-xs">
              Added Steps ({steps.length})
            </span>
          </label>
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-base-200 rounded p-2 flex justify-between items-start gap-2"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs">
                  Step {step.order}: {step.title}
                </p>
                <p className="text-xs text-base-content/70 word-break">
                  {step.description}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-circle shrink-0"
                onClick={() => handleRemoveStep(index)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add step input */}
      <div className="form-control gap-2">
        <label className="label">
          <span className="label-text text-sm">Step Title</span>
        </label>
        <input
          type="text"
          placeholder="e.g., Prepare vegetables"
          className="input input-bordered input-sm"
          value={currentStep.title || ""}
          onChange={(e) =>
            setCurrentStep({ ...currentStep, title: e.target.value })
          }
        />

        <label className="label">
          <span className="label-text text-sm">Step Description</span>
        </label>
        <textarea
          placeholder="e.g., Wash and slice the vegetables into uniform pieces"
          className="textarea textarea-bordered textarea-sm h-16"
          value={currentStep.description || ""}
          onChange={(e) =>
            setCurrentStep({
              ...currentStep,
              description: e.target.value,
            })
          }
        />

        <button
          type="button"
          className="btn btn-sm btn-outline gap-2"
          onClick={handleAddStep}
        >
          <Plus size={14} />
          Add Step
        </button>
      </div>
    </div>
  );

  if (!isAuthorized) {
    return (
      <Popup
        isOpen={isOpen}
        onClose={onClose}
        heading="Not Authorized"
        body="Only authorized users can add methods"
        primaryAction={{
          label: "Close",
          onClick: onClose,
        }}
        secondaryAction={{
          label: "Close",
          onClick: onClose,
        }}
        primaryButtonClass="btn-error"
      />
    );
  }

  return (
    <div className={isOpen ? "block" : "hidden"}>
      <form onSubmit={handleSubmit}>
        <Popup
          isOpen={isOpen}
          onClose={onClose}
          heading="Add New Method"
          body={formContent as any}
          primaryAction={{
            label: submitting ? "Creating..." : "Add Method",
            onClick: () => {},
          }}
          primaryButtonType="submit"
          secondaryAction={{
            label: "Cancel",
            onClick: onClose,
          }}
          primaryButtonClass="btn-primary"
        />
      </form>
    </div>
  );
}

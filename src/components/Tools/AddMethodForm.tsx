import { useState, useEffect } from "react";
import { createMethod, updateMethod } from "../../services/methods";
import type { Step, Method, Ingredient } from "../../services/methods";
import ImageUpload from "./ImageUpload";
import { Plus, Trash2, Link2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import Popup from "./Popup";

interface AddMethodFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  method?: Method;
}

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

export default function AddMethodForm({
  isOpen,
  onClose,
  onSuccess,
  method,
}: AddMethodFormProps) {
  const isEditMode = !!method;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    duration: "",
    image_url: "",
    base_yield: "" as number | "",
    yield_unit: "",
    servings: "" as number | "",
  });
  const [steps, setSteps] = useState<Step[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [newIngredient, setNewIngredient] = useState<{
    name: string;
    quantity: string;
    unit: string;
  }>({ name: "", quantity: "", unit: "" });
  const [currentStep, setCurrentStep] = useState<Partial<Step>>({
    order: 1,
    title: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<"upload" | "url">(
    "upload"
  );

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

  // Pre-populate form when editing
  useEffect(() => {
    if (method && isEditMode) {
      setFormData({
        title: method.title,
        description: method.description,
        category: method.category,
        duration: method.duration,
        image_url: method.image_url || "",
        base_yield:
          (method as any).base_yield !== undefined && (method as any).base_yield !== null
            ? Number((method as any).base_yield)
            : (method as any).servings !== undefined && (method as any).servings !== null
            ? Number((method as any).servings)
            : ("" as any),
        yield_unit:
          (method as any).yield_unit || ((method as any).servings ? "servings" : ""),
        servings:
          (method as any).servings !== undefined && (method as any).servings !== null
            ? Number((method as any).servings)
            : ("" as any),
      });
      setSteps(method.steps || []);
      setIngredients(((method as any)?.ingredients as Ingredient[]) || []);
      // Determine if image is a URL or uploaded
      if (method.image_url && method.image_url.startsWith("http")) {
        setImageInputMode("url");
      } else {
        setImageInputMode("upload");
      }
      setCurrentStep({
        order: (method.steps?.length || 0) + 1,
        title: "",
        description: "",
      });
    }
  }, [method, isEditMode, isOpen]);

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
      if (isEditMode && method) {
        // Update existing method
        await updateMethod(method.id, {
          ...formData,
          steps: steps.length > 0 ? steps : undefined,
          ingredients: ingredients.length > 0 ? ingredients : undefined,
          // normalize numbers or unset when blank
          base_yield:
            formData.base_yield === "" ? undefined : Number(formData.base_yield),
          yield_unit: formData.yield_unit || undefined,
          // keep backwards compatibility if using servings instead of base_yield/yield_unit
          servings: formData.servings === "" ? undefined : Number(formData.servings),
        });
      } else {
        // Create new method
        await createMethod({
          ...formData,
          steps: steps.length > 0 ? steps : undefined,
          ingredients: ingredients.length > 0 ? ingredients : undefined,
          base_yield:
            formData.base_yield === "" ? undefined : Number(formData.base_yield),
          yield_unit: formData.yield_unit || undefined,
          servings: formData.servings === "" ? undefined : Number(formData.servings),
        });
      }

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        duration: "",
        image_url: "",
        base_yield: "",
        yield_unit: "",
        servings: "",
      });
      setSteps([]);
      setIngredients([]);
      setNewIngredient({ name: "", quantity: "", unit: "" });
      setCurrentStep({
        order: 1,
        title: "",
        description: "",
      });
      setImageInputMode("upload");
      onClose();
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEditMode
          ? "Failed to update method"
          : "Failed to create method"
      );
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

      {/* Yield (optional) */}
      <div className="grid grid-cols-2 gap-2">
        <div className="form-control">
          <label className="label">
            <span className="label-text text-sm">Base Yield</span>
          </label>
          <input
            type="number"
            min={0}
            step="any"
            placeholder="e.g., 1"
            className="input input-bordered input-sm"
            value={formData.base_yield}
            onChange={(e) =>
              setFormData({ ...formData, base_yield: e.target.value === "" ? "" : Number(e.target.value) })
            }
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text text-sm">Yield Unit</span>
          </label>
          <input
            type="text"
            placeholder="e.g., servings, jars, liters"
            className="input input-bordered input-sm"
            value={formData.yield_unit}
            onChange={(e) =>
              setFormData({ ...formData, yield_unit: e.target.value })
            }
          />
        </div>
      </div>

      {/* Legacy Servings (optional) */}
      <div className="form-control">
        <label className="label">
          <span className="label-text text-sm">Servings (legacy)</span>
        </label>
        <input
          type="number"
          min={0}
          step="1"
          placeholder="e.g., 4"
          className="input input-bordered input-sm"
          value={formData.servings}
          onChange={(e) =>
            setFormData({ ...formData, servings: e.target.value === "" ? "" : Number(e.target.value) })
          }
        />
        <span className="text-xs text-base-content/60 mt-1">
          Optional: used if base yield/unit not provided
        </span>
      </div>

      {/* Image Input Toggle */}
      <div className="form-control">
        <label className="label">
          <span className="label-text text-sm">Image</span>
        </label>
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            className={`btn btn-xs flex-1 ${
              imageInputMode === "upload" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setImageInputMode("upload")}
          >
            Upload
          </button>
          <button
            type="button"
            className={`btn btn-xs flex-1 gap-1 ${
              imageInputMode === "url" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setImageInputMode("url")}
          >
            <Link2 size={12} />
            URL
          </button>
        </div>

        {imageInputMode === "upload" ? (
          <ImageUpload
            onImageUploaded={(url: string) =>
              setFormData({ ...formData, image_url: url })
            }
            currentImageUrl={formData.image_url}
          />
        ) : (
          <input
            type="url"
            placeholder="e.g., https://example.com/image.jpg"
            className="input input-bordered input-sm"
            value={formData.image_url}
            onChange={(e) =>
              setFormData({ ...formData, image_url: e.target.value })
            }
          />
        )}
      </div>

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

      {/* Ingredients Section */}
      <div className="divider my-0">Ingredients (Optional)</div>

      {ingredients.length > 0 && (
        <div className="space-y-2">
          <label className="label">
            <span className="label-text font-semibold text-xs">
              Added Ingredients ({ingredients.length})
            </span>
          </label>
          {ingredients.map((ing, idx) => (
            <div key={idx} className="bg-base-200 rounded p-2 flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs">
                  <span className="font-semibold">{ing.name}</span>{" "}
                  <span className="text-base-content/70">
                    — {ing.quantity}{ing.unit ? ` ${ing.unit}` : ""}
                  </span>
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-circle shrink-0"
                onClick={() => setIngredients(ingredients.filter((_, i) => i !== idx))}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-5 gap-2 items-end">
        <div className="col-span-3 form-control">
          <label className="label">
            <span className="label-text text-sm">Ingredient Name</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Cucumbers"
            className="input input-bordered input-sm"
            value={newIngredient.name}
            onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
          />
        </div>
        <div className="col-span-1 form-control">
          <label className="label">
            <span className="label-text text-sm">Qty</span>
          </label>
          <input
            type="number"
            min={0}
            step="any"
            placeholder="e.g., 1"
            className="input input-bordered input-sm"
            value={newIngredient.quantity}
            onChange={(e) => setNewIngredient({ ...newIngredient, quantity: e.target.value })}
          />
        </div>
        <div className="col-span-1 form-control">
          <label className="label">
            <span className="label-text text-sm">Unit</span>
          </label>
          <input
            type="text"
            placeholder="e.g., kg, g, cup"
            className="input input-bordered input-sm"
            value={newIngredient.unit}
            onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
          />
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline gap-2"
          onClick={() => {
            if (!newIngredient.name || newIngredient.quantity === "") return;
            const ing: Ingredient = {
              name: newIngredient.name,
              quantity: Number(newIngredient.quantity),
              unit: newIngredient.unit || undefined,
            };
            setIngredients([...ingredients, ing]);
            setNewIngredient({ name: "", quantity: "", unit: "" });
          }}
        >
          <Plus size={14} />
          Add Ingredient
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
          heading={isEditMode ? "Edit Method" : "Add New Method"}
          body={formContent as any}
          primaryAction={{
            label: submitting
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
              ? "Update Method"
              : "Add Method",
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

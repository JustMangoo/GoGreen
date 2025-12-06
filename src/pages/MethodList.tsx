import { Search, BookOpen, Heart } from "lucide-react";
import { listMethods } from "../services/methods";
import { useEffect, useState, useMemo } from "react";
import type { Method } from "../services/methods";
import AddMethodForm from "../components/Tools/AddMethodForm";
import { supabase } from "../lib/supabaseClient";

export default function MethodList() {
  const [methods, setMethods] = useState<Method[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let abort = false;

    setLoading(true);
    setError(null);

    listMethods()
      .then((items) => {
        if (abort) return;
        setMethods(items);
      })
      .catch((fetchError) => {
        if (!abort) setError(fetchError.message);
      })
      .finally(() => {
        if (!abort) setLoading(false);
      });

    return () => {
      abort = true;
    };
  }, []);

  useEffect(() => {
    let abort = false;

    const loadSavedMethods = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user || abort) return;

      const { data, error: savedError } = await supabase
        .from("saved_methods")
        .select("method_id");

      if (savedError || abort) return;

      setSavedIds(new Set((data || []).map((row) => String(row.method_id))));
    };

    loadSavedMethods();

    return () => {
      abort = true;
    };
  }, []);

  const filteredMethods = useMemo(() => {
    return methods.filter((method) => {
      const matchesSearch =
        searchTerm === "" ||
        method.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        method.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategories.size === 0 ||
        selectedCategories.has(method.category);

      return matchesSearch && matchesCategory;
    });
  }, [methods, searchTerm, selectedCategories]);

  const hasMethods = useMemo(
    () => filteredMethods.length > 0,
    [filteredMethods]
  );

  const toggleCategory = (category: string) => {
    const newCategories = new Set(selectedCategories);
    if (newCategories.has(category)) {
      newCategories.delete(category);
    } else {
      newCategories.add(category);
    }
    setSelectedCategories(newCategories);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategories(new Set());
  };

  const handleToggleSave = async (methodId: string) => {
    setSavingId(methodId);
    setError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("You must be logged in to save methods.");
        return;
      }

      const methodIdValue = Number(methodId);

      if (Number.isNaN(methodIdValue)) {
        setError("Invalid method id");
        return;
      }

      if (savedIds.has(methodId)) {
        const { error: deleteError } = await supabase
          .from("saved_methods")
          .delete()
          .eq("user_id", user.id)
          .eq("method_id", methodIdValue);

        if (deleteError) throw deleteError;

        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(methodId);
          return next;
        });
      } else {
        const { error: insertError } = await supabase
          .from("saved_methods")
          .insert([{ user_id: user.id, method_id: methodId }]);

        if (insertError) throw insertError;

        setSavedIds((prev) => new Set(prev).add(methodId));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update saved methods"
      );
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center justify-start min-h-screen bg-base-100 p-4 mb-16">
      <div className="w-full flex items-center gap-2">
        <label className="input flex-1">
          <Search className="input-icon" size={16} />
          <input
            type="search"
            placeholder="Search preserving methods"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </label>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => setShowForm((s) => !s)}
        >
          {showForm ? "Close" : "Add"}
        </button>
      </div>

      {showForm && (
        <AddMethodForm
          onSuccess={() => {
            setShowForm(false);
            setLoading(true);
            listMethods()
              .then(setMethods)
              .catch((fetchError) => setError(fetchError.message))
              .finally(() => setLoading(false));
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <form className="gap-2 flex flex-wrap w-full btn-group">
        <div className="flex flex-1 flex-row gap-2">
          <input
            className={`btn flex-1 ${
              selectedCategories.has("Fermenting") ? "btn-active" : ""
            }`}
            type="checkbox"
            name="fermenting"
            aria-label="Fermenting"
            checked={selectedCategories.has("Fermenting")}
            onChange={() => toggleCategory("Fermenting")}
          />
          <input
            className={`btn flex-1 ${
              selectedCategories.has("Canning") ? "btn-active" : ""
            }`}
            type="checkbox"
            name="canning"
            aria-label="Canning"
            checked={selectedCategories.has("Canning")}
            onChange={() => toggleCategory("Canning")}
          />
        </div>
        <div className="flex flex-1 flex-row gap-2">
          <input
            className={`btn flex-1 ${
              selectedCategories.has("Smoking") ? "btn-active" : ""
            }`}
            type="checkbox"
            name="smoking"
            aria-label="Smoking"
            checked={selectedCategories.has("Smoking")}
            onChange={() => toggleCategory("Smoking")}
          />
          <input
            className={`btn flex-1 ${
              selectedCategories.has("Freezing") ? "btn-active" : ""
            }`}
            type="checkbox"
            name="freezing"
            aria-label="Freezing"
            checked={selectedCategories.has("Freezing")}
            onChange={() => toggleCategory("Freezing")}
          />
        </div>
        <div className="flex flex-1 flex-row gap-2">
          <input
            className={`btn flex-1 ${
              selectedCategories.has("Pickling") ? "btn-active" : ""
            }`}
            type="checkbox"
            name="pickling"
            aria-label="Pickling"
            checked={selectedCategories.has("Pickling")}
            onChange={() => toggleCategory("Pickling")}
          />
          <input
            className={`btn flex-1 ${
              selectedCategories.has("Drying") ? "btn-active" : ""
            }`}
            type="checkbox"
            name="drying"
            aria-label="Drying"
            checked={selectedCategories.has("Drying")}
            onChange={() => toggleCategory("Drying")}
          />
          <button
            className="btn btn-square"
            type="button"
            onClick={clearFilters}
          >
            ×
          </button>
        </div>
      </form>

      {loading && <div className="loading loading-spinner loading-lg"></div>}
      {error && <div className="alert alert-error">{error}</div>}
      {!loading && !hasMethods && (
        <div className="text-center text-lg opacity-60">
          {methods.length === 0
            ? "No methods found"
            : "No methods match your filters"}
        </div>
      )}

      <ul className="grid grid-cols-2 gap-3 p-0 bg-base-100 rounded-box w-full">
        {filteredMethods.map((method) => (
          <li key={method.id} className="p-0">
            <div className="card bg-base-100 image-full shadow-sm h-48">
              <figure>
                <img
                  src={method.image_url || "https://placehold.co/400x300"}
                  alt={method.title}
                  className="w-full h-full object-cover"
                />
              </figure>
              <div className="card-body p-3">
                <h2 className="card-title text-sm line-clamp-2">
                  {method.title}
                </h2>
                <div className="text-xs opacity-80">{method.duration}</div>
                <div className="card-actions items-baseline justify-between mt-auto">
                  <div className="bg-base-200 rounded-box px-2 py-1 w-fit">
                    <p className="text-xs text-neutral">{method.category}</p>
                  </div>
                  <button
                    className={`btn btn-sm btn-circle ${
                      savedIds.has(method.id)
                        ? "btn-error text-white"
                        : "btn-ghost"
                    }`}
                    disabled={savingId === method.id}
                    onClick={() => handleToggleSave(method.id)}
                  >
                    <Heart
                      size={18}
                      className={savedIds.has(method.id) ? "fill-current" : ""}
                    />
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

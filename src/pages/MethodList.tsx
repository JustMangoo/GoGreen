import { Search, BookOpen, Heart } from "lucide-react";
import { listMethods } from "../services/methods";
import { useEffect, useState, useMemo } from "react";
import type { Method } from "../services/methods";

export default function MethodList() {
  const [methods, setMethods] = useState<Method[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const hasMethods = useMemo(() => methods.length > 0, [methods]);

  return (
    <div className="flex flex-col gap-4 items-center justify-start min-h-screen bg-base-100 p-4 mb-16">
      <label className="input w-full">
        <Search className="input-icon" size={16} />
        <input type="search" required placeholder="Search preserving methods" />
      </label>

      <form className="gap-2 flex flex-wrap w-full btn-group">
        <div className="flex flex-1 flex-row gap-2">
          <input
            className="btn flex-1 "
            type="checkbox"
            name="frameworks"
            aria-label="Ferment"
          />
          <input
            className="btn flex-1 "
            type="checkbox"
            name="frameworks"
            aria-label="Canning"
          />
        </div>
        <div className="flex flex-1 flex-row gap-2">
          <input
            className="btn flex-1"
            type="checkbox"
            name="frameworks"
            aria-label="Pickling"
          />
          <input
            className="btn flex-1"
            type="checkbox"
            name="frameworks"
            aria-label="Drying"
          />
        </div>
      </form>

      {loading && <div className="loading loading-spinner loading-lg"></div>}
      {error && <div className="alert alert-error">{error}</div>}
      {!loading && !hasMethods && (
        <div className="text-center text-lg opacity-60">No methods found</div>
      )}

      <ul className="list gap-2 p-0 bg-base-100 rounded-box w-full">
        {methods.map((method) => (
          <li key={method.id} className="list-row p-0">
            <div>
              <div className="figure w-32 h-32 rounded-box overflow-hidden bg-base-300">
                <img
                  src={method.image_url || "https://via.placeholder.com/128"}
                  alt={method.title}
                />
              </div>
            </div>
            <div>
              <div className="line-clamp-1">{method.title}</div>
              <div className="text-xs uppercase font-semibold opacity-60">
                {method.category} • {method.duration}
              </div>
              <p className="list-col-wrap text-xs line-clamp-2">
                {method.description}
              </p>
            </div>

            <button className="btn btn-square btn-ghost">
              <BookOpen size={20} />
            </button>
            <button className="btn btn-square btn-ghost">
              <Heart size={20} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

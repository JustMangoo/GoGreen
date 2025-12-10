import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { listMethods } from "../services/methods";

export default function MethodCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<
    Array<{ name: string; count: number }>
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let abort = false;

    const loadCategories = async () => {
      setLoading(true);
      try {
        const methods = await listMethods();
        if (abort) return;

        // Extract unique categories and count methods in each
        const categoryMap = new Map<string, number>();
        methods.forEach((method) => {
          const count = categoryMap.get(method.category) || 0;
          categoryMap.set(method.category, count + 1);
        });

        // Convert to array and sort
        const categoryList = Array.from(categoryMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setCategories(categoryList);
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();

    return () => {
      abort = true;
    };
  }, []);

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/methods-list?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className=" flex flex-col items-center justify-start bg-base-100 p-4 mb-16">
      {loading && <div className="loading loading-spinner loading-lg"></div>}

      {!loading && categories.length === 0 && (
        <p className="text-center opacity-60">No categories found</p>
      )}

      {!loading && categories.length > 0 && (
        <div className="grid grid-cols-1 gap-3 w-full max-w-2xl">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => handleCategoryClick(category.name)}
              className="card items-center justify-center min-h-[175px] bg-base-200 card-border border-base-300 cursor-pointer"
            >
              <div className="card-body grow-0 items-center justify-center text-center p-6 gap-4">
                <h2 className="card-title text-xl">{category.name}</h2>
                <p className="text-sm opacity-70 h-fit">
                  {category.count} method{category.count !== 1 ? "s" : ""}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

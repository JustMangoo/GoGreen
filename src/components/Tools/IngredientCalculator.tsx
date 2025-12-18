import { useMemo, useState } from "react";

type Ingredient = {
  name: string;
  quantity: number;
  unit?: string;
};

type IngredientCalculatorProps = {
  ingredients: Ingredient[];
  baseYield: number;
  yieldUnit?: string;
  initialTarget?: number;
  className?: string;
};

export default function IngredientCalculator({
  ingredients,
  baseYield,
  yieldUnit = "servings",
  initialTarget,
  className,
}: IngredientCalculatorProps) {
  const safeBase = baseYield > 0 ? baseYield : 1;
  const [targetYield, setTargetYield] = useState<number>(
    initialTarget && initialTarget > 0 ? initialTarget : safeBase
  );

  const scale = useMemo(() => targetYield / safeBase, [targetYield, safeBase]);

  const scaled = useMemo(() => {
    return ingredients.map((ing) => ({
      ...ing,
      scaled: Number((ing.quantity * scale).toFixed(2)),
    }));
  }, [ingredients, scale]);

  return (
    <div className={["card card-border border-base-300 bg-base-200 p-4 gap-4", className || ""].join(" ")}> 
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-baseline gap-2">
          <h3 className="font-semibold text-lg">Ingredient Calculator</h3>
          <p className="text-sm text-base-content/60">for {targetYield} {yieldUnit}</p>
        </div>
        <div className="join">
          <button
            type="button"
            aria-label="Decrease target"
            className="btn btn-sm join-item"
            onClick={() => setTargetYield((v) => Math.max(0.25, Number((v - 1).toFixed(2))))}
          >
            -
          </button>
          <input
            type="number"
            className="input input-sm input-bordered join-item w-24 text-right"
            min={0.25}
            step={0.25}
            value={targetYield}
            onChange={(e) => setTargetYield(Math.max(0.25, Number(e.target.value)))}
            aria-label="Target yield"
          />
          <button
            type="button"
            aria-label="Increase target"
            className="btn btn-sm join-item"
            onClick={() => setTargetYield((v) => Number((v + 1).toFixed(2)))}
          >
            +
          </button>
        </div>
      </div>

      <ul className="divide-y divide-base-300">
        {scaled.map((ing, i) => (
          <li key={`${ing.name}-${i}`} className="py-2 flex items-baseline justify-between gap-3">
            <span className="font-medium">{ing.name}</span>
            <span className="text-sm text-base-content/80">
              {ing.scaled} {ing.unit || ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { Search } from "lucide-react";

export default function MethodList() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-base-200 p-4">
      <label className="input w-full">
        <Search className="input-icon" size={16} />
        <input type="search" required placeholder="Search" />
      </label>
      <form className="btn-group mt-4">
        <input
          className="btn"
          type="checkbox"
          name="frameworks"
          aria-label="Svelte"
        />
        <input
          className="btn"
          type="checkbox"
          name="frameworks"
          aria-label="Vue"
        />
        <input
          className="btn"
          type="checkbox"
          name="frameworks"
          aria-label="Reactt"
        />
        <input className="btn btn-square" type="reset" value="×" />
      </form>
      <p>MethodList</p>
    </div>
  );
}

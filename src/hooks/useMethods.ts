import { useState, useEffect } from "react";
import { listMethods, type Method } from "../services/methods";

export function useMethods() {
  const [methods, setMethods] = useState<Method[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let abort = false;

    listMethods()
      .then((data) => {
        if (!abort) setMethods(data);
      })
      .catch((err) => {
        if (!abort) setError(err.message);
      })
      .finally(() => {
        if (!abort) setLoading(false);
      });

    return () => {
      abort = true;
    };
  }, []);

  return { methods, loading, error };
}

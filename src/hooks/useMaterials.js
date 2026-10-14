import { useState, useEffect, useCallback } from "react";
import { materialService } from "../lib/services";

export function useMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await materialService.getAll();
      // الرد: { data: [...] }
      setMaterials(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
  }, [fetchAll]);

  return {
    materials,
    loading,
    error,
    refetch: fetchAll,
    setMaterials,
  };
}

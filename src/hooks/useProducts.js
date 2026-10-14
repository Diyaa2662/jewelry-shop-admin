import { useState, useEffect, useCallback } from "react";
import { productService } from "../lib/services";

// يحول الحقول الرقمية من string لـ number
function normalizeProduct(p) {
  return {
    ...p,
    weight: parseFloat(p.weight) || 0,
    tax: parseFloat(p.tax) || 0,
    rating: parseFloat(p.rating) || 0,
    // تحويل null إلى false للـ flags
    status: p.status ?? false,
    featured: p.featured ?? false,
    most_sold: p.most_sold ?? false,
    newly_arrived: p.newly_arrived ?? false,
  };
}

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productService.getAll();
      const list = (res.data || []).map(normalizeProduct);
      setProducts(list);
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
    products,
    loading,
    error,
    refetch: fetchAll,
    setProducts,
  };
}

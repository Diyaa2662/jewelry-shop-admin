import { useState, useEffect } from "react";
import { categoryService, materialService } from "../lib/services";

export function useCategoriesLookup() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryService
      .getAll()
      .then((res) => setCategories(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}

export function useMaterialsLookup() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    materialService
      .getAll()
      .then((res) => setMaterials(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { materials, loading };
}

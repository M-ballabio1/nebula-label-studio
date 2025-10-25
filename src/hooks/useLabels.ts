import { useState, useEffect } from "react";
import { Label } from "@/types/annotation";
import { labelService, CreateLabelDto, UpdateLabelDto } from "@/services/labelService";
import { toast } from "sonner";

export const useLabels = () => {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLabels = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await labelService.getLabels();
      setLabels(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch labels");
      setError(error);
      toast.error("Failed to load labels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabels();
  }, []);

  const createLabel = async (data: CreateLabelDto): Promise<Label | null> => {
    try {
      const newLabel = await labelService.createLabel(data);
      setLabels((prev) => [...prev, newLabel]);
      toast.success(`Label "${data.name}" added`);
      return newLabel;
    } catch (err) {
      toast.error("Failed to create label");
      return null;
    }
  };

  const updateLabel = async (
    id: string,
    data: UpdateLabelDto
  ): Promise<boolean> => {
    try {
      const updated = await labelService.updateLabel(id, data);
      setLabels((prev) => prev.map((l) => (l.id === id ? updated : l)));
      toast.success("Label updated");
      return true;
    } catch (err) {
      toast.error("Failed to update label");
      return false;
    }
  };

  const deleteLabel = async (id: string): Promise<boolean> => {
    try {
      await labelService.deleteLabel(id);
      setLabels((prev) => prev.filter((l) => l.id !== id));
      toast.success("Label deleted");
      return true;
    } catch (err) {
      toast.error("Failed to delete label");
      return false;
    }
  };

  return {
    labels,
    setLabels,
    loading,
    error,
    createLabel,
    updateLabel,
    deleteLabel,
    refetch: fetchLabels,
  };
};

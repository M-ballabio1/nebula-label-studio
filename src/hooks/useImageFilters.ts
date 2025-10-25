import { useMemo } from "react";
import { ImageItem } from "@/types/annotation";

interface Filters {
  annotated: boolean | null;
  labelIds: string[];
}

export const useImageFilters = (images: ImageItem[], filters: Filters) => {
  const filteredImages = useMemo(() => {
    return images.filter((img) => {
      // Filter by annotation status
      if (filters.annotated !== null) {
        const hasAnnotations =
          (img.annotations.boxes && img.annotations.boxes.length > 0) ||
          (img.annotations.polygons && img.annotations.polygons.length > 0) ||
          (img.annotations.tags && img.annotations.tags.length > 0);
        if (filters.annotated !== hasAnnotations) return false;
      }

      // Filter by label
      if (filters.labelIds.length > 0) {
        const hasLabel = filters.labelIds.some((labelId) =>
          [
            ...(img.annotations.boxes || []),
            ...(img.annotations.polygons || []),
            ...(img.annotations.tags || []),
          ].some((ann: any) => ann.labelId === labelId)
        );
        if (!hasLabel) return false;
      }

      return true;
    });
  }, [images, filters]);

  return filteredImages;
};

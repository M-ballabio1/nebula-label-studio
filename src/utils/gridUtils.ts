import { GridMode, isMultiGrid } from "@/types/gridMode";
import { ImageItem } from "@/types/annotation";

export const getGridClass = (gridMode: GridMode): string => {
  if (!isMultiGrid(gridMode)) {
    return "";
  }
  
  return `grid grid-cols-${gridMode.columns} gap-3`;
};

export const getDisplayImages = (
  gridMode: GridMode,
  selectedImage: ImageItem | undefined,
  filteredImages: ImageItem[]
): ImageItem[] => {
  if (!isMultiGrid(gridMode)) {
    return selectedImage ? [selectedImage] : [];
  }

  return filteredImages.slice(0, gridMode.maxImages);
};

export const getGridImageHeight = (gridMode: GridMode): string => {
  if (!isMultiGrid(gridMode)) {
    return "400px";
  }
  
  // Calculate based on columns
  if (gridMode.columns === 4) {
    return "300px";
  } else if (gridMode.columns === 3) {
    return "350px";
  }
  return "400px";
};

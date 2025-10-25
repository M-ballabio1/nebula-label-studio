import { GridMode } from "@/types/gridMode";
import { ImageItem } from "@/types/annotation";

export const getGridClass = (gridMode: GridMode): string => {
  switch (gridMode) {
    case "grid4":
      return "grid grid-cols-2 gap-3";
    case "grid6":
      return "grid grid-cols-3 gap-3";
    case "grid8":
      return "grid grid-cols-4 gap-3";
    case "grid12":
      return "grid grid-cols-3 gap-3";
    default:
      return "";
  }
};

export const getDisplayImages = (
  gridMode: GridMode,
  selectedImage: ImageItem | undefined,
  filteredImages: ImageItem[]
): ImageItem[] => {
  if (gridMode === "single") {
    return selectedImage ? [selectedImage] : [];
  }

  const maxImages = gridMode === "grid4" ? 4 : gridMode === "grid6" ? 6 : gridMode === "grid8" ? 8 : 12;
  return filteredImages.slice(0, maxImages);
};

export const getGridImageHeight = (gridMode: GridMode): string => {
  switch (gridMode) {
    case "grid6":
      return "350px";
    case "grid8":
      return "300px";
    case "grid12":
      return "280px";
    default:
      return "400px";
  }
};

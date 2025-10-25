import { useMemo } from "react";
import { ImageItem } from "@/types/annotation";

export const useImageNavigation = (
  filteredImages: ImageItem[],
  selectedImageId: string | null,
  setSelectedImageId: (id: string | null) => void
) => {
  const currentImageIndex = useMemo(
    () => filteredImages.findIndex((img) => img.id === selectedImageId),
    [filteredImages, selectedImageId]
  );

  const handlePreviousImage = () => {
    if (currentImageIndex > 0) {
      setSelectedImageId(filteredImages[currentImageIndex - 1].id);
    }
  };

  const handleNextImage = () => {
    if (currentImageIndex < filteredImages.length - 1) {
      setSelectedImageId(filteredImages[currentImageIndex + 1].id);
    }
  };

  return {
    currentImageIndex,
    handlePreviousImage,
    handleNextImage,
    canGoPrevious: currentImageIndex > 0,
    canGoNext: currentImageIndex < filteredImages.length - 1,
  };
};

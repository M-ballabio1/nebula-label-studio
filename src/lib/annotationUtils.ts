import { ImageItem, Label, BoundingBox, SegmentationPolygon } from "@/types/annotation";

/**
 * Get annotations for a specific image
 */
export const getImageAnnotations = (image: ImageItem | undefined) => {
  if (!image) return { boxes: [], polygons: [], tags: [] };
  
  return {
    boxes: image.annotations?.boxes || [],
    polygons: image.annotations?.polygons || [],
    tags: image.annotations?.tags || [],
  };
};

/**
 * Filter images by annotation status and labels
 */
export const filterImages = (
  images: ImageItem[],
  filters: { annotated: boolean | null; labelIds: string[] }
): ImageItem[] => {
  return images.filter((img) => {
    // Filter by annotation status
    if (filters.annotated !== null) {
      const hasAnnotations =
        (img.annotations?.boxes?.length || 0) > 0 ||
        (img.annotations?.polygons?.length || 0) > 0 ||
        (img.annotations?.tags?.length || 0) > 0;

      if (filters.annotated && !hasAnnotations) return false;
      if (!filters.annotated && hasAnnotations) return false;
    }

    // Filter by labels
    if (filters.labelIds.length > 0) {
      const hasMatchingLabel =
        img.annotations?.boxes?.some((box) =>
          filters.labelIds.includes(box.labelId)
        ) ||
        img.annotations?.polygons?.some((poly) =>
          filters.labelIds.includes(poly.labelId)
        ) ||
        img.annotations?.tags?.some((tag) =>
          filters.labelIds.includes(tag.labelId)
        );

      if (!hasMatchingLabel) return false;
    }

    return true;
  });
};

/**
 * Get label by ID
 */
export const getLabelById = (labels: Label[], labelId: string): Label | undefined => {
  return labels.find((l) => l.id === labelId);
};

/**
 * Get label color with fallback
 */
export const getLabelColor = (labels: Label[], labelId: string): string => {
  const label = getLabelById(labels, labelId);
  return label?.color || "#3b82f6";
};

/**
 * Check if box is valid
 */
export const isValidBox = (box: Partial<BoundingBox>, minSize = 10): boolean => {
  if (!box.x || !box.y || !box.width || !box.height) return false;
  return box.width >= minSize && box.height >= minSize;
};

/**
 * Check if polygon is valid
 */
export const isValidPolygon = (polygon: Partial<SegmentationPolygon>, minPoints = 3): boolean => {
  if (!polygon.points || polygon.points.length < minPoints) return false;
  return true;
};

/**
 * Calculate annotation statistics
 */
export const getAnnotationStats = (images: ImageItem[]) => {
  let totalBoxes = 0;
  let totalPolygons = 0;
  let totalTags = 0;
  let annotatedImages = 0;

  images.forEach((img) => {
    const boxes = img.annotations?.boxes?.length || 0;
    const polygons = img.annotations?.polygons?.length || 0;
    const tags = img.annotations?.tags?.length || 0;

    totalBoxes += boxes;
    totalPolygons += polygons;
    totalTags += tags;

    if (boxes > 0 || polygons > 0 || tags > 0) {
      annotatedImages++;
    }
  });

  return {
    totalImages: images.length,
    annotatedImages,
    unannotatedImages: images.length - annotatedImages,
    totalBoxes,
    totalPolygons,
    totalTags,
    totalAnnotations: totalBoxes + totalPolygons + totalTags,
  };
};

/**
 * Export annotation data in various formats
 */
export const prepareExportData = (images: ImageItem[], labels: Label[]) => {
  return {
    version: "1.0",
    exportDate: new Date().toISOString(),
    images: images.map((img) => ({
      id: img.id,
      name: img.name,
      url: img.url,
      annotations: img.annotations,
    })),
    labels: labels.map((label) => ({
      id: label.id,
      name: label.name,
      color: label.color,
      hotkey: label.hotkey,
    })),
    statistics: getAnnotationStats(images),
  };
};

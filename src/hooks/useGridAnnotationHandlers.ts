import {
  ImageItem,
  BoundingBox,
  SegmentationPolygon,
} from "@/types/annotation";

export const useGridAnnotationHandlers = (
  images: ImageItem[],
  setImages: (images: ImageItem[]) => void,
  setSelectedImageId: (id: string) => void
) => {
  const handleGridAddBox = (imageId: string, box: Omit<BoundingBox, "id">) => {
    setSelectedImageId(imageId);
    const newBox: BoundingBox = {
      ...box,
      id: `box-${Date.now()}`,
    };
    setImages(
      images.map((image) =>
        image.id === imageId
          ? {
              ...image,
              annotations: {
                ...image.annotations,
                boxes: [...(image.annotations.boxes || []), newBox],
              },
            }
          : image
      )
    );
  };

  const handleGridDeleteBox = (imageId: string, boxId: string) => {
    setImages(
      images.map((image) =>
        image.id === imageId
          ? {
              ...image,
              annotations: {
                ...image.annotations,
                boxes: (image.annotations.boxes || []).filter((b) => b.id !== boxId),
              },
            }
          : image
      )
    );
  };

  const handleGridUpdateBox = (
    imageId: string,
    boxId: string,
    updates: Partial<BoundingBox>
  ) => {
    setImages(
      images.map((image) =>
        image.id === imageId
          ? {
              ...image,
              annotations: {
                ...image.annotations,
                boxes: (image.annotations.boxes || []).map((b) =>
                  b.id === boxId ? { ...b, ...updates } : b
                ),
              },
            }
          : image
      )
    );
  };

  const handleGridAddPolygon = (
    imageId: string,
    polygon: Omit<SegmentationPolygon, "id">
  ) => {
    const newPolygon: SegmentationPolygon = {
      ...polygon,
      id: `polygon-${Date.now()}`,
    };
    setImages(
      images.map((image) =>
        image.id === imageId
          ? {
              ...image,
              annotations: {
                ...image.annotations,
                polygons: [...(image.annotations.polygons || []), newPolygon],
              },
            }
          : image
      )
    );
  };

  const handleGridDeletePolygon = (imageId: string, polygonId: string) => {
    setImages(
      images.map((image) =>
        image.id === imageId
          ? {
              ...image,
              annotations: {
                ...image.annotations,
                polygons: (image.annotations.polygons || []).filter(
                  (p) => p.id !== polygonId
                ),
              },
            }
          : image
      )
    );
  };

  const handleGridToggleTag = (imageId: string, labelId: string) => {
    setImages(
      images.map((image) => {
        if (image.id !== imageId) return image;
        const tags = image.annotations.tags || [];
        const hasTag = tags.some((t) => t.labelId === labelId);
        return {
          ...image,
          annotations: {
            ...image.annotations,
            tags: hasTag
              ? tags.filter((t) => t.labelId !== labelId)
              : [...tags, { labelId }],
          },
        };
      })
    );
  };

  return {
    handleGridAddBox,
    handleGridDeleteBox,
    handleGridUpdateBox,
    handleGridAddPolygon,
    handleGridDeletePolygon,
    handleGridToggleTag,
  };
};

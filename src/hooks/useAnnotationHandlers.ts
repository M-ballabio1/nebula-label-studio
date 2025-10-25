import { toast } from "sonner";
import {
  Label,
  ImageItem,
  BoundingBox,
  SegmentationPolygon,
  AudioSegment,
  TextAnnotation,
} from "@/types/annotation";

export const useAnnotationHandlers = (
  images: ImageItem[],
  setImages: (images: ImageItem[]) => void,
  selectedImageId: string | null,
  labels: Label[],
  setLabels: (labels: Label[]) => void,
  selectedLabelId: string | null,
  setSelectedLabelId: (id: string | null) => void,
  audioSegments: AudioSegment[],
  setAudioSegments: (segments: AudioSegment[]) => void,
  textAnnotations: TextAnnotation[],
  setTextAnnotations: (annotations: TextAnnotation[]) => void
) => {
  const handleAddLabel = (label: Omit<Label, "id">) => {
    const newLabel: Label = {
      ...label,
      id: `label-${Date.now()}`,
    };
    setLabels([...labels, newLabel]);
    toast.success(`Label "${label.name}" added`);
  };

  const handleDeleteLabel = (id: string) => {
    setLabels(labels.filter((l) => l.id !== id));
    if (selectedLabelId === id) {
      setSelectedLabelId(labels[0]?.id || null);
    }
    toast.success("Label deleted");
  };

  const handleAddBox = (box: Omit<BoundingBox, "id">) => {
    if (!selectedImageId) return;
    const newBox: BoundingBox = {
      ...box,
      id: `box-${Date.now()}`,
    };
    setImages(
      images.map((img) =>
        img.id === selectedImageId
          ? {
              ...img,
              annotations: {
                ...img.annotations,
                boxes: [...(img.annotations.boxes || []), newBox],
              },
            }
          : img
      )
    );
    toast.success("Bounding box added");
  };

  const handleUpdateBox = (id: string, updates: Partial<BoundingBox>) => {
    if (!selectedImageId) return;
    setImages(
      images.map((img) =>
        img.id === selectedImageId
          ? {
              ...img,
              annotations: {
                ...img.annotations,
                boxes: (img.annotations.boxes || []).map((b) =>
                  b.id === id ? { ...b, ...updates } : b
                ),
              },
            }
          : img
      )
    );
  };

  const handleDeleteBox = (id: string) => {
    if (!selectedImageId) return;
    setImages(
      images.map((img) =>
        img.id === selectedImageId
          ? {
              ...img,
              annotations: {
                ...img.annotations,
                boxes: (img.annotations.boxes || []).filter((b) => b.id !== id),
              },
            }
          : img
      )
    );
    toast.success("Bounding box deleted");
  };

  const handleAddPolygon = (polygon: Omit<SegmentationPolygon, "id">) => {
    if (!selectedImageId) return;
    const newPolygon: SegmentationPolygon = {
      ...polygon,
      id: `polygon-${Date.now()}`,
    };
    setImages(
      images.map((img) =>
        img.id === selectedImageId
          ? {
              ...img,
              annotations: {
                ...img.annotations,
                polygons: [...(img.annotations.polygons || []), newPolygon],
              },
            }
          : img
      )
    );
    toast.success("Segmentation polygon added");
  };

  const handleDeletePolygon = (id: string) => {
    if (!selectedImageId) return;
    setImages(
      images.map((img) =>
        img.id === selectedImageId
          ? {
              ...img,
              annotations: {
                ...img.annotations,
                polygons: (img.annotations.polygons || []).filter((p) => p.id !== id),
              },
            }
          : img
      )
    );
    toast.success("Polygon deleted");
  };

  const handleToggleTag = (labelId: string) => {
    if (!selectedImageId) return;
    setImages(
      images.map((img) => {
        if (img.id !== selectedImageId) return img;
        const tags = img.annotations.tags || [];
        const hasTag = tags.some((t) => t.labelId === labelId);
        return {
          ...img,
          annotations: {
            ...img.annotations,
            tags: hasTag
              ? tags.filter((t) => t.labelId !== labelId)
              : [...tags, { labelId }],
          },
        };
      })
    );
  };

  const handleAddAudioSegment = (segment: Omit<AudioSegment, "id">) => {
    const newSegment: AudioSegment = {
      ...segment,
      id: `segment-${Date.now()}`,
    };
    setAudioSegments([...audioSegments, newSegment]);
    toast.success("Audio segment added");
  };

  const handleDeleteAudioSegment = (id: string) => {
    setAudioSegments(audioSegments.filter((s) => s.id !== id));
    toast.success("Audio segment deleted");
  };

  const handleAddTextAnnotation = (annotation: Omit<TextAnnotation, "id">) => {
    const newAnnotation: TextAnnotation = {
      ...annotation,
      id: `text-ann-${Date.now()}`,
    };
    setTextAnnotations([...textAnnotations, newAnnotation]);
    toast.success("Text annotation added");
  };

  const handleDeleteTextAnnotation = (id: string) => {
    setTextAnnotations(textAnnotations.filter((a) => a.id !== id));
    toast.success("Text annotation deleted");
  };

  return {
    handleAddLabel,
    handleDeleteLabel,
    handleAddBox,
    handleUpdateBox,
    handleDeleteBox,
    handleAddPolygon,
    handleDeletePolygon,
    handleToggleTag,
    handleAddAudioSegment,
    handleDeleteAudioSegment,
    handleAddTextAnnotation,
    handleDeleteTextAnnotation,
  };
};

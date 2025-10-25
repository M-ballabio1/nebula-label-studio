import { Label } from "@/types/annotation";
import { useLabels } from "./useLabels";
import { useAnnotations } from "./useAnnotations";

export const useAnnotationHandlers = (
  images: any[],
  setImages: (images: any[]) => void,
  selectedImageId: string | null,
  labels: Label[],
  setLabels: (labels: Label[]) => void,
  selectedLabelId: string | null,
  setSelectedLabelId: (id: string | null) => void
) => {
  const labelsApi = useLabels();
  const annotationsApi = useAnnotations(images, setImages, selectedImageId);

  const handleAddLabel = async (label: Omit<Label, "id">) => {
    const newLabel = await labelsApi.createLabel(label);
    if (newLabel) {
      setLabels([...labels, newLabel]);
    }
  };

  const handleDeleteLabel = async (id: string) => {
    const success = await labelsApi.deleteLabel(id);
    if (success) {
      setLabels(labels.filter((l) => l.id !== id));
      if (selectedLabelId === id) {
        setSelectedLabelId(labels[0]?.id || null);
      }
    }
  };

  const handleAddBox = (box: any) => {
    annotationsApi.addBox(box);
  };

  const handleUpdateBox = (id: string, updates: any) => {
    annotationsApi.updateBox(id, updates);
  };

  const handleDeleteBox = (id: string) => {
    annotationsApi.deleteBox(id);
  };

  const handleAddPolygon = (polygon: any) => {
    annotationsApi.addPolygon(polygon);
  };

  const handleDeletePolygon = (id: string) => {
    annotationsApi.deletePolygon(id);
  };

  const handleToggleTag = (labelId: string) => {
    annotationsApi.toggleTag(labelId);
  };

  const handleAddAudioSegment = (segment: any) => {
    annotationsApi.addAudioSegment(segment);
  };

  const handleDeleteAudioSegment = (id: string) => {
    annotationsApi.deleteAudioSegment(id);
  };

  const handleAddTextAnnotation = (annotation: any) => {
    annotationsApi.addTextAnnotation(annotation);
  };

  const handleDeleteTextAnnotation = (id: string) => {
    annotationsApi.deleteTextAnnotation(id);
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
    audioSegments: annotationsApi.audioSegments,
    textAnnotations: annotationsApi.textAnnotations,
  };
};

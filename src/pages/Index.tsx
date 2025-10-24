import { useState } from "react";
import { Header } from "@/components/Header";
import { LabelSidebar } from "@/components/LabelSidebar";
import { AnnotationToolbar } from "@/components/AnnotationToolbar";
import { ThumbnailGallery } from "@/components/ThumbnailGallery";
import { DetectionCanvas } from "@/components/DetectionCanvas";
import { ClassificationPanel } from "@/components/ClassificationPanel";
import { SegmentationCanvas } from "@/components/SegmentationCanvas";
import {
  AnnotationMode,
  Label,
  ImageItem,
  BoundingBox,
  SegmentationPolygon,
  ClassificationTag,
} from "@/types/annotation";
import { toast } from "sonner";

// Sample data
const INITIAL_LABELS: Label[] = [
  { id: "1", name: "Person", color: "#ef4444", hotkey: "1" },
  { id: "2", name: "Car", color: "#3b82f6", hotkey: "2" },
  { id: "3", name: "Building", color: "#22c55e", hotkey: "3" },
  { id: "4", name: "Tree", color: "#f59e0b", hotkey: "4" },
];

const SAMPLE_IMAGES: ImageItem[] = [
  {
    id: "img1",
    url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=120&h=120&fit=crop",
    name: "City Street",
    annotations: { boxes: [], polygons: [], tags: [] },
  },
  {
    id: "img2",
    url: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=120&h=120&fit=crop",
    name: "Mountain View",
    annotations: { boxes: [], polygons: [], tags: [] },
  },
  {
    id: "img3",
    url: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=120&h=120&fit=crop",
    name: "Urban Night",
    annotations: { boxes: [], polygons: [], tags: [] },
  },
  {
    id: "img4",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=120&h=120&fit=crop",
    name: "Nature Scene",
    annotations: { boxes: [], polygons: [], tags: [] },
  },
  {
    id: "img5",
    url: "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?w=120&h=120&fit=crop",
    name: "Sunset Beach",
    annotations: { boxes: [], polygons: [], tags: [] },
  },
];

const Index = () => {
  const [mode, setMode] = useState<AnnotationMode>("detection");
  const [labels, setLabels] = useState<Label[]>(INITIAL_LABELS);
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(labels[0]?.id || null);
  const [images, setImages] = useState<ImageItem[]>(SAMPLE_IMAGES);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(images[0]?.id || null);

  const selectedImage = images.find((img) => img.id === selectedImageId);

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

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <LabelSidebar
          labels={labels}
          selectedLabelId={selectedLabelId}
          onSelectLabel={setSelectedLabelId}
          onAddLabel={handleAddLabel}
          onDeleteLabel={handleDeleteLabel}
        />
        <div className="flex-1 flex flex-col">
          <AnnotationToolbar mode={mode} onModeChange={setMode} />
          {selectedImage && (
            <>
              {mode === "detection" && (
                <DetectionCanvas
                  imageUrl={selectedImage.url}
                  boxes={selectedImage.annotations.boxes || []}
                  labels={labels}
                  selectedLabelId={selectedLabelId}
                  onAddBox={handleAddBox}
                  onDeleteBox={handleDeleteBox}
                />
              )}
              {mode === "classification" && (
                <ClassificationPanel
                  imageUrl={selectedImage.url}
                  tags={selectedImage.annotations.tags || []}
                  labels={labels}
                  onToggleTag={handleToggleTag}
                />
              )}
              {mode === "segmentation" && (
                <SegmentationCanvas
                  imageUrl={selectedImage.url}
                  polygons={selectedImage.annotations.polygons || []}
                  labels={labels}
                  selectedLabelId={selectedLabelId}
                  onAddPolygon={handleAddPolygon}
                  onDeletePolygon={handleDeletePolygon}
                />
              )}
              {mode === "audio" && (
                <div className="flex-1 flex items-center justify-center bg-muted/30">
                  <div className="text-center p-8">
                    <h3 className="text-xl font-semibold mb-2">Audio Annotation</h3>
                    <p className="text-muted-foreground">Audio annotation interface coming soon</p>
                  </div>
                </div>
              )}
              {mode === "text" && (
                <div className="flex-1 flex items-center justify-center bg-muted/30">
                  <div className="text-center p-8">
                    <h3 className="text-xl font-semibold mb-2">Text Annotation</h3>
                    <p className="text-muted-foreground">Text annotation interface coming soon</p>
                  </div>
                </div>
              )}
            </>
          )}
          <ThumbnailGallery
            images={images}
            selectedImageId={selectedImageId}
            onSelectImage={setSelectedImageId}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;

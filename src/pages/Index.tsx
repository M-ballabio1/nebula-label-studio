import { useState } from "react";
import { Header } from "@/components/Header";
import { LabelSidebar } from "@/components/LabelSidebar";
import { AnnotationToolbar } from "@/components/AnnotationToolbar";
import { ThumbnailGallery } from "@/components/ThumbnailGallery";
import { EnhancedDetectionCanvas } from "@/components/EnhancedDetectionCanvas";
import { ClassificationPanel } from "@/components/ClassificationPanel";
import { SegmentationCanvas } from "@/components/SegmentationCanvas";
import { AudioAnnotationCanvas } from "@/components/AudioAnnotationCanvas";
import { TextAnnotationCanvas } from "@/components/TextAnnotationCanvas";
import { ImageInfoPanel } from "@/components/ImageInfoPanel";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import {
  AnnotationMode,
  Label,
  ImageItem,
  BoundingBox,
  SegmentationPolygon,
  ClassificationTag,
  AudioSegment,
  TextAnnotation,
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

const SAMPLE_AUDIO_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
const SAMPLE_TEXT = "Natural Language Processing (NLP) is a subfield of artificial intelligence that focuses on the interaction between computers and humans through natural language. The ultimate objective of NLP is to read, decipher, understand, and make sense of human languages in a manner that is valuable. Most NLP techniques rely on machine learning to derive meaning from human languages. NLP is used to apply algorithms to identify and extract the natural language rules such that unstructured language data is converted into a form that computers can understand.";

const Index = () => {
  const [mode, setMode] = useState<AnnotationMode>("detection");
  const [labels, setLabels] = useState<Label[]>(INITIAL_LABELS);
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(labels[0]?.id || null);
  const [images, setImages] = useState<ImageItem[]>(SAMPLE_IMAGES);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(images[0]?.id || null);
  const [audioSegments, setAudioSegments] = useState<AudioSegment[]>([]);
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [normalizedDimensions, setNormalizedDimensions] = useState({ width: 0, height: 0 });
  const [selectedBox, setSelectedBox] = useState<BoundingBox | null>(null);
  const [hoveredBox, setHoveredBox] = useState<BoundingBox | null>(null);

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

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="w-full">
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <LabelSidebar
              labels={labels}
              selectedLabelId={selectedLabelId}
              onSelectLabel={setSelectedLabelId}
              onAddLabel={handleAddLabel}
              onDeleteLabel={handleDeleteLabel}
            />
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={80} minSize={50}>
            <div className="h-full flex flex-col">
              <AnnotationToolbar mode={mode} onModeChange={setMode} />
              
              <ResizablePanelGroup direction="vertical" className="flex-1">
                <ResizablePanel defaultSize={75} minSize={40}>
                  {selectedImage && mode === "detection" && (
                    <EnhancedDetectionCanvas
                      imageUrl={selectedImage.url}
                      boxes={selectedImage.annotations.boxes || []}
                      labels={labels}
                      selectedLabelId={selectedLabelId}
                      onAddBox={handleAddBox}
                      onDeleteBox={handleDeleteBox}
                      onUpdateBox={handleUpdateBox}
                      onImageLoad={(dims) => {
                        setImageDimensions(dims);
                        const canvas = document.querySelector("canvas");
                        if (canvas) {
                          setNormalizedDimensions({
                            width: canvas.width,
                            height: canvas.height,
                          });
                        }
                      }}
                      onBoxSelect={setSelectedBox}
                      onBoxHover={setHoveredBox}
                    />
                  )}
                  {selectedImage && mode === "classification" && (
                    <ClassificationPanel
                      imageUrl={selectedImage.url}
                      tags={selectedImage.annotations.tags || []}
                      labels={labels}
                      onToggleTag={handleToggleTag}
                    />
                  )}
                  {selectedImage && mode === "segmentation" && (
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
                    <AudioAnnotationCanvas
                      audioUrl={SAMPLE_AUDIO_URL}
                      segments={audioSegments}
                      labels={labels}
                      selectedLabelId={selectedLabelId}
                      onAddSegment={handleAddAudioSegment}
                      onDeleteSegment={handleDeleteAudioSegment}
                    />
                  )}
                  {mode === "text" && (
                    <TextAnnotationCanvas
                      text={SAMPLE_TEXT}
                      annotations={textAnnotations}
                      labels={labels}
                      selectedLabelId={selectedLabelId}
                      onAddAnnotation={handleAddTextAnnotation}
                      onDeleteAnnotation={handleDeleteTextAnnotation}
                    />
                  )}
                </ResizablePanel>

                {mode === "detection" && selectedImage && (
                  <>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
                      <ImageInfoPanel
                        imageDimensions={imageDimensions}
                        normalizedDimensions={normalizedDimensions}
                        selectedBox={selectedBox}
                        hoveredBox={hoveredBox}
                        labels={labels}
                        totalBoxes={selectedImage.annotations.boxes?.length || 0}
                      />
                    </ResizablePanel>
                  </>
                )}
              </ResizablePanelGroup>

              <ThumbnailGallery
                images={images}
                selectedImageId={selectedImageId}
                onSelectImage={setSelectedImageId}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Index;

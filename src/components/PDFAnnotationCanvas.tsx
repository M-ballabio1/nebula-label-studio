import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, Upload, ZoomIn, ZoomOut, Download, Square, Type, Trash2 } from "lucide-react";
import { BoundingBox, TextAnnotation, Label as LabelType } from "@/types/annotation";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set up PDF.js worker with a reliable CDN
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFAnnotationCanvasProps {
  pdfFile: File | string | null;
  onFileUpload: (file: File) => void;
  textAnnotations: TextAnnotation[];
  boxAnnotations: BoundingBox[];
  labels: LabelType[];
  selectedLabelId: string | null;
  onAddTextAnnotation: (annotation: Omit<TextAnnotation, "id">) => void;
  onAddBoxAnnotation: (box: Omit<BoundingBox, "id">) => void;
  onDeleteTextAnnotation: (id: string) => void;
  onDeleteBoxAnnotation: (id: string) => void;
}

type AnnotationMode = "text" | "box";

export const PDFAnnotationCanvas = ({
  pdfFile,
  onFileUpload,
  textAnnotations,
  boxAnnotations,
  labels,
  selectedLabelId,
  onAddTextAnnotation,
  onAddBoxAnnotation,
  onDeleteTextAnnotation,
  onDeleteBoxAnnotation,
}: PDFAnnotationCanvasProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.5);
  const [annotationMode, setAnnotationMode] = useState<AnnotationMode>("text");
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [selectedText, setSelectedText] = useState<{ text: string; startIndex: number; endIndex: number } | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setCurrentPage(1);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      onFileUpload(file);
    }
  };

  // Convert string URL to usable format for react-pdf
  const getPdfSource = () => {
    if (typeof pdfFile === 'string') {
      return pdfFile;
    }
    return pdfFile;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (annotationMode !== "box" || !selectedLabelId) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    setIsDrawing(true);
    setDrawStart({ x, y });
    setCurrentBox({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !drawStart || annotationMode !== "box") return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentX = (e.clientX - rect.left) / rect.width;
    const currentY = (e.clientY - rect.top) / rect.height;
    
    setCurrentBox({
      x: Math.min(drawStart.x, currentX),
      y: Math.min(drawStart.y, currentY),
      width: Math.abs(currentX - drawStart.x),
      height: Math.abs(currentY - drawStart.y),
    });
  };

  const handleMouseUp = () => {
    if (isDrawing && currentBox && selectedLabelId && currentBox.width > 0.01 && currentBox.height > 0.01) {
      onAddBoxAnnotation({
        x: currentBox.x,
        y: currentBox.y,
        width: currentBox.width,
        height: currentBox.height,
        labelId: selectedLabelId,
      });
    }
    
    setIsDrawing(false);
    setDrawStart(null);
    setCurrentBox(null);
  };

  const handleTextSelection = () => {
    if (annotationMode !== "text" || !selectedLabelId) return;
    
    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === "") return;

    const selectedText = selection.toString();
    const range = selection.getRangeAt(0);
    
    // Simple index calculation - in production, you'd want more sophisticated tracking
    const startIndex = range.startOffset;
    const endIndex = range.endOffset;

    onAddTextAnnotation({
      text: selectedText,
      startIndex,
      endIndex,
      labelId: selectedLabelId,
    });

    selection.removeAllRanges();
  };

  const getPageAnnotations = (pageNum: number) => {
    // Filter annotations for current page (simplified - in production, track page info)
    return {
      text: textAnnotations,
      boxes: boxAnnotations,
    };
  };

  const currentPageAnnotations = getPageAnnotations(currentPage);
  const selectedLabel = labels.find(l => l.id === selectedLabelId);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-muted/20">
      {/* Workflow Instructions */}
      <Card className="m-4 p-4 bg-card/80 backdrop-blur border-primary/20">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 rounded-lg p-2">
            <Type className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-sm">PDF Annotation Workflow</h3>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Select a label from the sidebar</li>
              <li>Choose annotation mode: Text (highlight) or Box (bounding box)</li>
              <li>Text mode: Select text to highlight it with the chosen label</li>
              <li>Box mode: Click and drag to create bounding boxes around elements</li>
              <li>Scroll or use navigation to move between pages</li>
              <li>Upload your own PDF using the button in the top right</li>
            </ol>
          </div>
        </div>
      </Card>

      {/* Status Bar */}
      <div className="mx-4 mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2">
            {selectedLabel ? (
              <>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedLabel.color }} />
                {selectedLabel.name}
              </>
            ) : (
              "No label selected"
            )}
          </Badge>
          <div className="flex gap-2">
            <Button
              variant={annotationMode === "text" ? "default" : "outline"}
              size="sm"
              onClick={() => setAnnotationMode("text")}
            >
              <Type className="w-4 h-4 mr-1" />
              Text
            </Button>
            <Button
              variant={annotationMode === "box" ? "default" : "outline"}
              size="sm"
              onClick={() => setAnnotationMode("box")}
            >
              <Square className="w-4 h-4 mr-1" />
              Box
            </Button>
          </div>
        </div>
        {pdfFile && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Different PDF
            </Button>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden mx-4 mb-4">
        <Card className="h-full flex flex-col bg-card/50 backdrop-blur">
          {!pdfFile ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center space-y-4">
                <div className="bg-primary/10 rounded-full p-8 inline-block">
                  <Upload className="w-16 h-16 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Upload PDF Document</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a PDF to start annotating with text highlights and bounding boxes
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Choose PDF File
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* PDF Viewer */}
              <ScrollArea className="flex-1">
                <div className="p-4 flex justify-center">
                  <div
                    ref={canvasRef}
                    className="relative inline-block"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{ cursor: annotationMode === "box" && selectedLabelId ? "crosshair" : "text" }}
                  >
                    <Document
                      file={getPdfSource()}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={(error) => {
                        console.error("PDF loading error:", error);
                      }}
                      className="border rounded-lg shadow-lg bg-white"
                      loading={
                        <div className="flex items-center justify-center p-8">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-sm text-muted-foreground">Loading PDF...</p>
                          </div>
                        </div>
                      }
                      error={
                        <div className="flex items-center justify-center p-8">
                          <div className="text-center space-y-2">
                            <p className="text-sm text-destructive font-medium">Failed to load PDF</p>
                            <p className="text-xs text-muted-foreground">Please try uploading a different file</p>
                          </div>
                        </div>
                      }
                    >
                      <Page
                        pageNumber={currentPage}
                        scale={scale}
                        onMouseUp={handleTextSelection}
                        renderTextLayer={true}
                        renderAnnotationLayer={false}
                      />
                    </Document>

                    {/* Render existing box annotations */}
                    {currentPageAnnotations.boxes.map((box) => {
                      const label = labels.find(l => l.id === box.labelId);
                      const rect = canvasRef.current?.getBoundingClientRect();
                      if (!rect) return null;

                      return (
                        <div
                          key={box.id}
                          className="absolute border-2 cursor-pointer group"
                          style={{
                            left: `${box.x * 100}%`,
                            top: `${box.y * 100}%`,
                            width: `${box.width * 100}%`,
                            height: `${box.height * 100}%`,
                            borderColor: label?.color,
                            backgroundColor: `${label?.color}20`,
                          }}
                        >
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => onDeleteBoxAnnotation(box.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      );
                    })}

                    {/* Current drawing box */}
                    {isDrawing && currentBox && selectedLabel && (
                      <div
                        className="absolute border-2 pointer-events-none"
                        style={{
                          left: `${currentBox.x * 100}%`,
                          top: `${currentBox.y * 100}%`,
                          width: `${currentBox.width * 100}%`,
                          height: `${currentBox.height * 100}%`,
                          borderColor: selectedLabel.color,
                          backgroundColor: `${selectedLabel.color}20`,
                        }}
                      />
                    )}
                  </div>
                </div>
              </ScrollArea>

              {/* Controls */}
              <div className="border-t p-4 flex items-center justify-between bg-background/80 backdrop-blur">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium px-3">
                    Page {currentPage} / {numPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
                    disabled={currentPage >= numPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setScale(s => Math.max(0.5, s - 0.25))}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium px-2">{Math.round(scale * 100)}%</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setScale(s => Math.min(3, s + 0.25))}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground">
                  {currentPageAnnotations.text.length} text, {currentPageAnnotations.boxes.length} boxes
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

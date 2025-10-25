import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AnnotationMode, ImageItem, Label } from "@/types/annotation";
import { exportCOCO, exportYOLO, exportDarknet, exportCSV } from "@/lib/exportFormats";
import { Download, FileJson, FileText, Database } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label as UILabel } from "@/components/ui/label";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: AnnotationMode;
  images: ImageItem[];
  labels: Label[];
}

export const ExportModal = ({ open, onOpenChange, mode, images, labels }: ExportModalProps) => {
  const [includeImages, setIncludeImages] = useState(false);

  const handleExport = (format: string, includeImagesOption: boolean = false) => {
    try {
      let result;
      switch (format) {
        case "coco":
          result = exportCOCO(images, labels);
          break;
        case "yolo":
          result = exportYOLO(images, labels);
          break;
        case "darknet":
          result = exportDarknet(images, labels);
          break;
        case "csv":
          result = exportCSV(images, labels, mode);
          break;
        default:
          throw new Error("Unknown format");
      }
      
      toast.success(`Exported as ${format.toUpperCase()}`);
      onOpenChange(false);
    } catch (error) {
      toast.error("Export failed");
      console.error(error);
    }
  };

  const formats = [
    {
      id: "coco",
      name: "COCO JSON",
      description: "MS COCO format - industry standard for object detection",
      icon: FileJson,
      color: "text-blue-500",
      supportsImages: true,
    },
    {
      id: "yolo",
      name: "YOLO",
      description: "YOLOv5/v8 format - one txt file per image",
      icon: FileText,
      color: "text-green-500",
      supportsImages: false,
    },
    {
      id: "darknet",
      name: "Darknet",
      description: "Original YOLO/Darknet format",
      icon: Database,
      color: "text-purple-500",
      supportsImages: false,
    },
    {
      id: "csv",
      name: "CSV",
      description: "Simple CSV format for spreadsheets",
      icon: FileText,
      color: "text-orange-500",
      supportsImages: false,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Annotations
          </DialogTitle>
          <DialogDescription>
            Choose your preferred export format. All formats are compatible with major annotation tools.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {formats.map((format, index) => (
            <div key={format.id}>
              {index > 0 && <Separator className="my-4" />}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <format.icon className={`w-5 h-5 mt-1 ${format.color}`} />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{format.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format.description}
                    </p>
                    {format.supportsImages && (
                      <div className="flex items-center gap-2 mt-3">
                        <Switch
                          id={`include-images-${format.id}`}
                          checked={includeImages}
                          onCheckedChange={setIncludeImages}
                        />
                        <UILabel
                          htmlFor={`include-images-${format.id}`}
                          className="text-xs cursor-pointer"
                        >
                          Include images in export
                        </UILabel>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleExport(format.id, format.supportsImages && includeImages)}
                  className="shrink-0"
                >
                  <Download className="w-3 h-3 mr-1.5" />
                  Export
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

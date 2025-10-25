import { Settings, Download, HelpCircle, LogOut, FileJson, FileText, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { AnnotationMode, ImageItem, Label } from "@/types/annotation";
import { exportCOCO, exportYOLO, exportDarknet, exportCSV, downloadFile, downloadMultipleFiles } from "@/lib/exportFormats";

interface AppMenuProps {
  mode: AnnotationMode;
  images: ImageItem[];
  labels: Label[];
}

export const AppMenu = ({ mode, images, labels }: AppMenuProps) => {
  const handleSettings = () => {
    toast.info("Settings panel coming soon");
  };

  const handleExportCOCO = () => {
    const cocoData = exportCOCO(images, labels);
    downloadFile(cocoData, "annotations_coco.json", "application/json");
    toast.success("Exported in COCO format");
  };

  const handleExportYOLO = () => {
    const yoloFiles = exportYOLO(images, labels);
    downloadMultipleFiles(yoloFiles, "annotations_yolo.zip");
    toast.success("Exported in YOLO format");
  };

  const handleExportDarknet = () => {
    const darknetFiles = exportDarknet(images, labels);
    downloadMultipleFiles(darknetFiles, "annotations_darknet.zip");
    toast.success("Exported in Darknet format");
  };

  const handleExportCSV = () => {
    const csvData = exportCSV(images, labels, mode);
    downloadFile(csvData, `annotations_${mode}.csv`, "text/csv");
    toast.success("Exported in CSV format");
  };

  const handleHelp = () => {
    toast.info("Help documentation coming soon");
  };

  const handleLogout = () => {
    toast.info("Logout functionality coming soon");
  };

  const getExportFormats = () => {
    const formats = [
      {
        label: "CSV Format",
        icon: FileText,
        onClick: handleExportCSV,
        available: ["detection", "segmentation", "classification"],
      },
    ];

    if (mode === "detection" || mode === "segmentation") {
      formats.push(
        {
          label: "COCO Format",
          icon: FileJson,
          onClick: handleExportCOCO,
          available: ["detection", "segmentation"],
        },
        {
          label: "YOLO Format",
          icon: File,
          onClick: handleExportYOLO,
          available: ["detection", "segmentation"],
        },
        {
          label: "Darknet Format",
          icon: File,
          onClick: handleExportDarknet,
          available: ["detection", "segmentation"],
        }
      );
    }

    return formats.filter((f) => f.available.includes(mode));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="secondary" className="h-9">
          <Settings className="w-4 h-4 mr-2" />
          Menu
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleSettings}>
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Download className="w-4 h-4 mr-2" />
            Export Annotations
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            {getExportFormats().map((format) => (
              <DropdownMenuItem key={format.label} onClick={format.onClick}>
                <format.icon className="w-4 h-4 mr-2" />
                {format.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleHelp}>
          <HelpCircle className="w-4 h-4 mr-2" />
          Help & Documentation
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

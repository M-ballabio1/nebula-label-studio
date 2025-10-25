import { Settings, Download, HelpCircle, LogOut, FileJson, FileText, File, FileArchive, Image } from "lucide-react";
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
  onOpenSettings: () => void;
}

export const AppMenu = ({ mode, images, labels, onOpenSettings }: AppMenuProps) => {

  const handleExportCOCO = async (includeImages: boolean = false) => {
    const cocoData = exportCOCO(images, labels);
    if (includeImages) {
      const files: Record<string, string> = {
        "annotations.json": cocoData,
      };
      toast.promise(downloadMultipleFiles(files, "coco_dataset.zip"), {
        loading: "Preparing COCO export...",
        success: "Exported COCO format with images",
        error: "Failed to export",
      });
    } else {
      downloadFile(cocoData, "annotations_coco.json", "application/json");
      toast.success("Exported COCO annotations");
    }
  };

  const handleExportYOLO = async (includeImages: boolean = false) => {
    const yoloFiles = exportYOLO(images, labels);
    toast.promise(downloadMultipleFiles(yoloFiles, "yolo_dataset.zip"), {
      loading: "Preparing YOLO export...",
      success: "Exported YOLO format",
      error: "Failed to export",
    });
  };

  const handleExportDarknet = async (includeImages: boolean = false) => {
    const darknetFiles = exportDarknet(images, labels);
    toast.promise(downloadMultipleFiles(darknetFiles, "darknet_dataset.zip"), {
      loading: "Preparing Darknet export...",
      success: "Exported Darknet format",
      error: "Failed to export",
    });
  };

  const handleExportCSV = () => {
    const csvData = exportCSV(images, labels, mode);
    downloadFile(csvData, `annotations_${mode}.csv`, "text/csv");
    toast.success("Exported CSV format");
  };

  const handleHelp = () => {
    toast.info("Help documentation coming soon");
  };

  const handleLogout = () => {
    toast.info("Logout functionality coming soon");
  };

  const getExportFormats = () => {
    type FormatItem = {
      label: string;
      icon: any;
      onClick: () => void;
      available: string[];
      hasSubMenu: boolean;
      subItems?: Array<{
        label: string;
        icon: any;
        onClick: () => void;
      }>;
    };

    const formats: FormatItem[] = [
      {
        label: "CSV Format",
        icon: FileText,
        onClick: handleExportCSV,
        available: ["detection", "segmentation", "classification"],
        hasSubMenu: false,
      },
    ];

    if (mode === "detection" || mode === "segmentation") {
      formats.push(
        {
          label: "COCO Format",
          icon: FileJson,
          onClick: () => {},
          available: ["detection", "segmentation"],
          hasSubMenu: true,
          subItems: [
            {
              label: "Annotations Only",
              icon: FileJson,
              onClick: () => handleExportCOCO(false),
            },
            {
              label: "With Images (ZIP)",
              icon: FileArchive,
              onClick: () => handleExportCOCO(true),
            },
          ],
        },
        {
          label: "YOLO Format (ZIP)",
          icon: FileArchive,
          onClick: () => handleExportYOLO(false),
          available: ["detection", "segmentation"],
          hasSubMenu: false,
        },
        {
          label: "Darknet Format (ZIP)",
          icon: FileArchive,
          onClick: () => handleExportDarknet(false),
          available: ["detection", "segmentation"],
          hasSubMenu: false,
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
        <DropdownMenuItem onClick={onOpenSettings}>
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Download className="w-4 h-4 mr-2" />
            Export Annotations
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-56">
            {getExportFormats().map((format) => (
              format.hasSubMenu && format.subItems ? (
                <DropdownMenuSub key={format.label}>
                  <DropdownMenuSubTrigger>
                    <format.icon className="w-4 h-4 mr-2" />
                    {format.label}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-56">
                    {format.subItems.map((subItem) => (
                      <DropdownMenuItem key={subItem.label} onClick={subItem.onClick}>
                        <subItem.icon className="w-4 h-4 mr-2" />
                        {subItem.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              ) : (
                <DropdownMenuItem key={format.label} onClick={format.onClick}>
                  <format.icon className="w-4 h-4 mr-2" />
                  {format.label}
                </DropdownMenuItem>
              )
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

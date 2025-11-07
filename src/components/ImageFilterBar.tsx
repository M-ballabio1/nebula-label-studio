import { useState } from "react";
import { Filter, CheckCircle2, XCircle, Sparkles, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label as LabelType } from "@/types/annotation";
import { AnnotationMode } from "@/types/annotation";
import { GridMode, isMultiGrid } from "@/types/gridMode";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface ImageFilterBarProps {
  labels: LabelType[];
  selectedFilters: {
    annotated: boolean | null;
    labelIds: string[];
  };
  onFilterChange: (filters: { annotated: boolean | null; labelIds: string[] }) => void;
  gridMode: GridMode;
  onGridModeChange: (mode: GridMode) => void;
  mode?: AnnotationMode;
}

export const ImageFilterBar = ({
  labels,
  selectedFilters,
  onFilterChange,
  gridMode,
  onGridModeChange,
  mode,
}: ImageFilterBarProps) => {
  const [selectedModel, setSelectedModel] = useState<string>("");
  const toggleAnnotatedFilter = (value: boolean | null) => {
    onFilterChange({
      ...selectedFilters,
      annotated: selectedFilters.annotated === value ? null : value,
    });
  };

  const toggleLabelFilter = (labelId: string) => {
    const labelIds = selectedFilters.labelIds.includes(labelId)
      ? selectedFilters.labelIds.filter((id) => id !== labelId)
      : [...selectedFilters.labelIds, labelId];
    onFilterChange({ ...selectedFilters, labelIds });
  };

  const activeFiltersCount = 
    (selectedFilters.annotated !== null ? 1 : 0) + 
    selectedFilters.labelIds.length;

  const getModelsForMode = () => {
    switch (mode) {
      case "detection":
        return ["YOLO v8", "YOLO v11", "Faster R-CNN", "SSD MobileNet"];
      case "segmentation":
        return ["Mask R-CNN", "U-Net", "DeepLab v3+", "SAM"];
      case "classification":
        return ["ResNet-50", "EfficientNet", "Vision Transformer", "MobileNet"];
      default:
        return ["YOLO v8", "ResNet-50", "U-Net"];
    }
  };

  const handleAutolabel = () => {
    if (!selectedModel) {
      toast.error("Please select a model first");
      return;
    }
    toast.loading("Running autolabelling...", { duration: 2000 });
    setTimeout(() => {
      toast.success(`Autolabelling completed with ${selectedModel}`);
    }, 2000);
  };

  return (
    <div className="h-12 border-b bg-card flex items-center px-4 gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="secondary" className="h-8">
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Annotation Status</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={selectedFilters.annotated === true}
            onCheckedChange={() => toggleAnnotatedFilter(true)}
          >
            <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
            Annotated Only
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={selectedFilters.annotated === false}
            onCheckedChange={() => toggleAnnotatedFilter(false)}
          >
            <XCircle className="w-4 h-4 mr-2 text-orange-500" />
            Not Annotated
          </DropdownMenuCheckboxItem>
          
          {labels.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Label</DropdownMenuLabel>
              {labels.map((label) => (
                <DropdownMenuCheckboxItem
                  key={label.id}
                  checked={selectedFilters.labelIds.includes(label.id)}
                  onCheckedChange={() => toggleLabelFilter(label.id)}
                >
                  <div
                    className="w-3 h-3 rounded mr-2"
                    style={{ backgroundColor: label.color }}
                  />
                  {label.name}
                </DropdownMenuCheckboxItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="h-6 w-px bg-border" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="secondary" className="h-8">
            <Sparkles className="w-4 h-4 mr-2" />
            Autolabelling
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Select Model</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={selectedModel} onValueChange={setSelectedModel}>
            {getModelsForMode().map((model) => (
              <DropdownMenuRadioItem key={model} value={model}>
                {model}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <div className="p-2">
            <Button
              size="sm"
              onClick={handleAutolabel}
              disabled={!selectedModel}
              className="w-full h-8 bg-primary text-primary-foreground"
            >
              Run Autolabelling
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {(mode === "detection" || mode === "segmentation" || mode === "classification") && (
        <>
          <div className="h-6 w-px bg-border" />

          <div className="flex items-center gap-2">
            <Grid3X3 className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor="grid-images" className="text-sm whitespace-nowrap">
              Images:
            </Label>
            <Input
              id="grid-images"
              type="number"
              min="1"
              max="50"
              value={gridMode.maxImages}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                const clamped = Math.min(50, Math.max(1, value));
                onGridModeChange({
                  maxImages: clamped,
                  columns: gridMode.columns,
                });
              }}
              className="h-8 w-16 text-center"
            />
            {isMultiGrid(gridMode) && (
              <>
                <Label htmlFor="grid-columns" className="text-sm whitespace-nowrap">
                  Columns:
                </Label>
                <Select
                  value={gridMode.columns.toString()}
                  onValueChange={(value) => {
                    onGridModeChange({
                      maxImages: gridMode.maxImages,
                      columns: parseInt(value),
                    });
                  }}
                >
                  <SelectTrigger id="grid-columns" className="h-8 w-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

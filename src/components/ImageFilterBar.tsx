import { Filter, CheckCircle2, XCircle, Tag, Grid2X2, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/types/annotation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type GridMode = "single" | "grid2" | "grid4" | "grid8";

interface ImageFilterBarProps {
  labels: Label[];
  selectedFilters: {
    annotated: boolean | null;
    labelIds: string[];
  };
  onFilterChange: (filters: { annotated: boolean | null; labelIds: string[] }) => void;
  gridMode: GridMode;
  onGridModeChange: (mode: GridMode) => void;
}

export const ImageFilterBar = ({
  labels,
  selectedFilters,
  onFilterChange,
  gridMode,
  onGridModeChange,
}: ImageFilterBarProps) => {
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

      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant={gridMode === "single" ? "default" : "secondary"}
          onClick={() => onGridModeChange("single")}
          className="h-8 w-8 p-0"
        >
          <Grid2X2 className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant={gridMode === "grid2" ? "default" : "secondary"}
          onClick={() => onGridModeChange("grid2")}
          className="h-8 px-2"
        >
          2x2
        </Button>
        <Button
          size="sm"
          variant={gridMode === "grid4" ? "default" : "secondary"}
          onClick={() => onGridModeChange("grid4")}
          className="h-8 px-2"
        >
          2x4
        </Button>
        <Button
          size="sm"
          variant={gridMode === "grid8" ? "default" : "secondary"}
          onClick={() => onGridModeChange("grid8")}
          className="h-8 px-2"
        >
          4x4
        </Button>
      </div>
    </div>
  );
};

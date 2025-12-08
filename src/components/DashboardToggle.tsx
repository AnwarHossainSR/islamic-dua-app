import { User, Users } from "lucide-react";
import { useState } from "react";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";

interface DashboardToggleProps {
  onToggle: (showGlobal: boolean) => void;
}

export function DashboardToggle({ onToggle }: DashboardToggleProps) {
  const [showGlobal, setShowGlobal] = useState(false);

  const handleToggle = (checked: boolean) => {
    setShowGlobal(checked);
    onToggle(checked);
  };

  return (
    <div className="flex items-center space-x-2">
      <User className="h-4 w-4 text-muted-foreground" />
      <Label htmlFor="data-filter" className="text-sm font-medium">
        {showGlobal ? "All Users" : "Only Me"}
      </Label>
      <Switch id="data-filter" checked={showGlobal} onCheckedChange={handleToggle} />
      <Users className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}

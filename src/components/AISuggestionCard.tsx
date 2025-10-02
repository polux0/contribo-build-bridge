import { Card } from "@/components/ui/card";

interface AISuggestionCardProps {
  milestones: string;
  isGenerating: boolean;
  onInsert: () => void;
}

const AISuggestionCard = ({ milestones, isGenerating, onInsert }: AISuggestionCardProps) => {
  return (
    <Card className="p-4 border shadow-sm bg-card">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-card-foreground mb-2">Suggested milestones</h3>
          {isGenerating ? (
            <p className="text-xs text-muted-foreground">Generating milestones...</p>
          ) : milestones ? (
            <div className="text-xs text-muted-foreground whitespace-pre-line">
              {milestones}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No milestones generated yet</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AISuggestionCard;

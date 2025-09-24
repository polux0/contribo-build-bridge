import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AISuggestion {
  title: string;
  description: string;
  price: string;
  timeline: string;
  deliverables: string[];
}

interface AISuggestionCardProps {
  suggestion: AISuggestion;
  onInsert: () => void;
}

const AISuggestionCard = ({ suggestion, onInsert }: AISuggestionCardProps) => {
  return (
    <Card className="p-4 border shadow-sm bg-card">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-card-foreground mb-2">Suggested milestones</h3>
          <p className="text-sm text-muted-foreground mb-3">
            {suggestion.description}
          </p>
          <p className="text-xs font-bold text-primary">
            {suggestion.price} · {suggestion.timeline}
          </p>
        </div>
        
        <div className="space-y-3">
          {suggestion.deliverables.map((deliverable, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
              <span className="text-xs text-muted-foreground">{deliverable}</span>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={onInsert}
            className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold px-6 py-2 h-9 text-sm"
          >
            Use as Template →
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AISuggestionCard;

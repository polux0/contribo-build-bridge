import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Video, GitPullRequest, X } from "lucide-react";

interface MilestoneWithReward {
  id: string;
  title: string;
  outcome: string;
  proof: string;
  videoDescription: string;
  timeline: string;
  payout: string;
  rewardAmount: string;
  currency: string;
  startDate: string;
  endDate: string;
}

interface RewardMilestoneCardProps {
  milestone: MilestoneWithReward;
  onUpdate: (milestone: MilestoneWithReward) => void;
  onDelete: (id: string) => void;
}

const RewardMilestoneCard = ({ milestone, onUpdate, onDelete }: RewardMilestoneCardProps) => {
  const handleFieldChange = (field: keyof MilestoneWithReward, value: string) => {
    onUpdate({
      ...milestone,
      [field]: value
    });
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Milestone Header */}
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900">{milestone.title}</h4>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => onDelete(milestone.id)}
            className="text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Milestone Content */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">Outcome</Label>
            <p className="text-sm text-gray-600 mt-1">{milestone.outcome}</p>
          </div>

          {/* Proof Section */}
          <div className="space-y-3">
            <h5 className="text-sm font-semibold text-gray-700">Proof Required</h5>
            
            <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Video className="h-3 w-3 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-blue-800 block">Demo video</span>
                  <p className="text-sm text-blue-700 mt-1">{milestone.videoDescription}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50/50 rounded-lg p-3 border border-green-100">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                  <GitPullRequest className="h-3 w-3 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-green-800 block">Pull request</span>
                  <p className="text-sm text-green-700 mt-1">{milestone.proof}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reward and Timeline Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Reward Amount</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={milestone.rewardAmount}
                  onChange={(e) => handleFieldChange('rewardAmount', e.target.value)}
                  placeholder="1000"
                  className="flex-1"
                />
                <Select 
                  value={milestone.currency} 
                  onValueChange={(value) => handleFieldChange('currency', value)}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDC">USDC</SelectItem>
                    <SelectItem value="USDT">USDT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Timeline (days)</Label>
              <Input
                type="number"
                value={milestone.timeline}
                onChange={(e) => handleFieldChange('timeline', e.target.value)}
                placeholder="7"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Payout</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={milestone.payout}
                  onChange={(e) => handleFieldChange('payout', e.target.value)}
                  placeholder="25"
                  className="flex-1"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RewardMilestoneCard;

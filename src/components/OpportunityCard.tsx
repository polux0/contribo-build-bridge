import React from 'react';
import { Opportunity } from '@/hooks/useOpportunities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Calendar, DollarSign, GitBranch, Clock, CheckCircle } from 'lucide-react';
import { useApplicationFlow } from '@/hooks/useApplicationFlow';
import { useApplicationStatus } from '@/hooks/useApplicationStatus';
import { trackPH } from '@/lib/posthog-script';

interface OpportunityCardProps {
  opportunity: Opportunity;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity }) => {
  const { handleApply, canApply, statusMessage } = useApplicationFlow();
  const { applicationStatus, loading: checkingStatus } = useApplicationStatus(opportunity.id);

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getChainName = (chainId: number) => {
    const chains: { [key: number]: string } = {
      1: 'Ethereum',
      8453: 'Base',
      42161: 'Arbitrum',
      137: 'Polygon',
      10: 'Optimism'
    };
    return chains[chainId] || `Chain ${chainId}`;
  };

  const daysUntilDeadline = () => {
    const deadline = new Date(opportunity.deadline);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = daysUntilDeadline();

  const handleApplyClick = async () => {
    // Track ApplyStarted event
    trackPH("ApplyStarted", {
      opportunity_id: opportunity.id,
      opportunity_title: opportunity.title,
      company_name: opportunity.company_name,
      payout_amount: opportunity.payout_amount,
      payout_token: opportunity.payout_token,
    });

    // Track ApplyClicked event (for external redirect)
    trackPH("ApplyClicked", {
      opportunity_id: opportunity.id,
      opportunity_title: opportunity.title,
      destination: "github_issue", // This redirects to GitHub issue
    });

    await handleApply({
      id: opportunity.id,
      title: opportunity.title
    });
  };

  // Determine button state and text
  const getButtonState = () => {
    if (checkingStatus) {
      return {
        text: "Checking...",
        disabled: true,
        variant: "outline" as const,
        icon: null
      };
    }

    if (applicationStatus.hasApplied) {
      return {
        text: "Already Applied",
        disabled: true,
        variant: "outline" as const,
        icon: <CheckCircle className="w-4 h-4 mr-2" />
      };
    }

    if (!canApply) {
      return {
        text: "Apply Now",
        disabled: true,
        variant: "outline" as const,
        icon: <GitBranch className="w-4 h-4 mr-2" />
      };
    }

    return {
      text: "Apply Now",
      disabled: false,
      variant: "default" as const,
      icon: <GitBranch className="w-4 h-4 mr-2" />
    };
  };

  const buttonState = getButtonState();

  return (
    <Card className="w-full max-w-2xl mx-auto hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
              {opportunity.title}
            </CardTitle>
            <CardDescription className="text-gray-600 mb-3">
              {opportunity.short_desc}
            </CardDescription>
          </div>
          <Badge 
            variant={daysLeft <= 7 ? "destructive" : daysLeft <= 14 ? "secondary" : "default"}
            className="ml-4"
          >
            {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            <span className="font-medium text-gray-500">
              {opportunity.payout_amount.toLocaleString()} {opportunity.payout_token}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <GitBranch className="w-4 h-4" />
            <span>{getChainName(opportunity.chain_id)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDeadline(opportunity.deadline)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Company:</span>
            <span className="text-sm text-gray-600">{opportunity.company_name}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Repository:</span>
            <a 
              href={opportunity.repo_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-black flex items-center gap-1"
            >
              View Repository
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Issue:</span>
            <a 
              href={opportunity.issue_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-black flex items-center gap-1"
            >
              View Issue
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {opportunity.long_description_url && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Details:</span>
              <a 
                href={opportunity.long_description_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-black flex items-center gap-1"
              >
                View Full Description
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Show application status if user has applied */}
          {applicationStatus.hasApplied && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <CheckCircle className="w-4 h-4 text-gray-600" />
              <div>
                <span className="text-sm font-medium text-gray-900">Application Submitted</span>
                <p className="text-xs text-gray-600">
                  Status: {applicationStatus.status?.replace('_', ' ')} • 
                  Applied: {applicationStatus.appliedAt ? new Date(applicationStatus.appliedAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-3">
        <Button 
          onClick={handleApplyClick}
          disabled={buttonState.disabled}
          variant={buttonState.variant}
          className={`flex-1 ${buttonState.disabled ? 'bg-gray-300 text-gray-500' : 'bg-contribo-black hover:bg-gray-800'}`}
          title={applicationStatus.hasApplied ? "You have already applied for this opportunity" : statusMessage}
        >
          {buttonState.icon}
          {buttonState.text}
        </Button>
        
        {opportunity.long_description_url && (
          <Button 
            variant="outline" 
            asChild
          >
            <a 
              href={opportunity.long_description_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Learn More
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default OpportunityCard; 
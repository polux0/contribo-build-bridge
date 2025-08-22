import React from 'react';
import { Opportunity } from '@/hooks/useOpportunities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Calendar, DollarSign, GitBranch, Clock } from 'lucide-react';

interface OpportunityCardProps {
  opportunity: Opportunity;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity }) => {
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

  return (
    <Card className="w-full max-w-2xl mx-auto hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
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
            <span className="font-medium text-green-600">
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
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
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
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
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
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                View Full Description
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-3">
        <Button 
          asChild 
          className="flex-1 bg-contribo-black hover:bg-gray-800"
        >
          <a 
            href={opportunity.issue_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            <GitBranch className="w-4 h-4" />
            Apply Now
          </a>
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
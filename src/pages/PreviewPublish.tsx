import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProgressStepper from "@/components/ProgressStepper";
import ApplicationSuccessModal from "@/components/ApplicationSuccessModal";
import { Check } from "lucide-react";

const steps = [
  { number: 1, label: "Describe", sublabel: "Need" },
  { number: 2, label: "Inputs &", sublabel: "Context" },
  // { number: 3, label: "Acceptance", sublabel: "Criteria" }, // Commented out for organizations outsourcing
  { number: 3, label: "Reward &", sublabel: "Timeline" },
  { number: 4, label: "Preview &", sublabel: "Publish" }
];

const PreviewPublish = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Get all data from previous steps
  const projectData = location.state || {
    title: "Wallet Login + SIWE Protection",
    description: "Implement Web3 wallet auth with SIWE and route guards; include tests and docs.",
    milestones: [],
    totalReward: 0,
    totalTimeline: 0,
    currency: "USDC",
    complexity: "medium"
  };

  const formatPrice = () => {
    return `$${projectData.totalReward?.toLocaleString() || '0'}`;
  };

  const formatTimeline = () => {
    return `${projectData.totalTimeline || 0} days`;
  };

  const handleEditPrevious = () => {
    navigate("/hiring/reward-timeline", { state: projectData });
  };

  const handlePublish = () => {
    if (!isConfirmed) return;
    
    // TODO: Implement actual publish logic here
    console.log("Publishing project:", projectData);
    
    // Show success modal instead of alert
    setShowSuccessModal(true);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    // Navigate back to hiring page after closing modal
    navigate("/hiring");
  };

  const checklistItems = [
    { id: 1, text: "Project description provided", completed: true },
    { id: 2, text: "Milestones generated and configured", completed: projectData.milestones && projectData.milestones.length > 0 },
    { id: 3, text: "Rewards & timelines set for each milestone", completed: projectData.totalReward > 0 }
  ];

  return (
    <div className="min-h-screen bg-white font-inter text-contribo-text">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Header */}
          <Card className="p-6 shadow-card border-border bg-card">
            <h1 className="text-2xl font-bold text-card-foreground">Create Milestone Project</h1>
          </Card>

          {/* Progress Stepper */}
          <div className="px-6">
            <ProgressStepper steps={steps} currentStep={4} />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            {/* Left Panel - 2/3 width */}
            <div className="xl:col-span-2">
              <Card className="p-8 shadow-card border-border bg-card h-full">
                <div className="space-y-8">
                  {/* Final Checks */}
                  <div className="space-y-6">
                    <h2 className="text-lg font-bold text-card-foreground">Final checks</h2>
                    
                    <div className="space-y-4">
                      {checklistItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center flex-shrink-0">
                            <Check className="h-4 w-4 text-primary-foreground" />
                          </div>
                          <span className="text-sm text-card-foreground">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Confirmation */}
                  <div className="space-y-4">
                    <p className="text-xs text-muted-foreground font-medium">Checkbox</p>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="confirmation"
                        checked={isConfirmed}
                        onCheckedChange={(checked) => setIsConfirmed(checked === true)}
                        className="mt-0.5"
                      />
                      <label 
                        htmlFor="confirmation" 
                        className="text-sm text-card-foreground cursor-pointer leading-relaxed"
                      >
                        I confirm the scope is clear and feasible.
                      </label>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between pt-36">
                    <Button
                      variant="outline"
                      onClick={handleEditPrevious}
                      className="px-8 py-2 h-11 font-medium"
                    >
                      Edit previous
                    </Button>
                    <Button
                      onClick={handlePublish}
                      disabled={!isConfirmed}
                      className="bg-contribo-black hover:bg-gray-800 text-white font-medium px-12 py-2 h-11 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Publish Project
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Panel - 1/3 width */}
            <div className="xl:col-span-1">
              <Card className="p-8 shadow-card border-border bg-card h-full">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-lg font-bold text-card-foreground">Preview</h2>
                    <p className="text-xs text-muted-foreground">What developers will see</p>
                  </div>
                  
                  <Card className="p-4 border shadow-sm bg-card relative overflow-hidden">
                    {/* Purple accent bar at top */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary"></div>
                    
                    <div className="pt-2 space-y-4">
                      <h3 className="text-base font-bold text-card-foreground">
                        {projectData.title}
                      </h3>
                      <p className="text-xs font-bold text-primary">
                        {formatPrice()} · {formatTimeline()}
                      </p>
                      <hr className="border-border" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {projectData.description}
                      </p>
                      
                      {projectData.milestones && Array.isArray(projectData.milestones) && projectData.milestones.length > 0 && (
                        <>
                          <hr className="border-border" />
                          <div>
                            <p className="text-xs font-bold text-card-foreground mb-2">Milestones</p>
                            <div className="space-y-1">
                              {projectData.milestones.map((milestone, index) => (
                                <div key={milestone?.id || index} className="flex items-center justify-between py-1.5 px-2 bg-muted/10 rounded text-xs whitespace-nowrap">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span className="text-muted-foreground font-medium flex-shrink-0">
                                      {index + 1}.
                                    </span>
                                    <span className="text-card-foreground truncate min-w-0">
                                      {milestone?.title?.replace(/\*\*/g, '')?.replace(/^Title:\s*/i, '') || 'Untitled Milestone'}
                                    </span>
                                    <span className="text-muted-foreground flex-shrink-0">
                                      {milestone?.timeline?.replace(/\*\*/g, '') || 'TBD'}
                                    </span>
                                  </div>
                                  <span className="text-primary font-medium ml-2 flex-shrink-0">
                                    ${milestone?.rewardAmount || '0'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <Button className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-medium text-sm h-11">
                            Apply for Project
                          </Button>
                        </>
                      )}
                    </div>
                  </Card>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />

      {/* Success Modal */}
      <ApplicationSuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        opportunityTitle={projectData.title}
        companyName="Project Published"
        customTitle="Project Published Successfully!"
        customMessage="Your milestone project is now live and developers can start applying. We'll notify you when someone applies. As soon as a developer expresses intent to contribute to a specific milestone, we'll ask you for a deposit."
        customBadgeText="Published Successfully"
        customShareText={`I just published a new project: ${projectData.title}! Looking for talented developers. `}
      />
    </div>
  );
};

export default PreviewPublish;

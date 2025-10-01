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
  { number: 3, label: "Acceptance", sublabel: "Criteria" },
  { number: 4, label: "Reward &", sublabel: "Timeline" },
  { number: 5, label: "Preview &", sublabel: "Publish" }
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
    deliverables: [
      "User registration and login flow",
      "Session management and security",
      "Route guards implementation",
      "Tests and documentation"
    ],
    acceptanceCriteria: [
      "Route guards enforce auth on protected pages",
      "SIWE session persists & refreshes correctly", 
      "Unit & integration tests pass in CI",
      "Docs include setup, env vars, and edge cases"
    ],
    rewardAmount: "2800",
    currency: "USDC",
    duration: "10"
  };

  const formatPrice = () => {
    return `$${projectData.rewardAmount}`;
  };

  const formatTimeline = () => {
    return `${projectData.duration} days`;
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
    { id: 1, text: "Inputs added (repo/design/files)", completed: true },
    { id: 2, text: "Acceptance criteria defined", completed: true },
    { id: 3, text: "Reward & timeline set", completed: true }
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
            <ProgressStepper steps={steps} currentStep={5} />
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
                  <div className="flex justify-between pt-24">
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
                      
                      {projectData.deliverables && projectData.deliverables.length > 0 && (
                        <>
                          <hr className="border-border" />
                          <div>
                            <p className="text-xs font-bold text-card-foreground mb-2">Milestones</p>
                            <div className="space-y-2">
                              {projectData.deliverables.map((deliverable, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0 mt-1.5"></div>
                                  <span className="text-xs text-muted-foreground leading-relaxed">{deliverable}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                      
                      {projectData.acceptanceCriteria && projectData.acceptanceCriteria.length > 0 && (
                        <>
                          <hr className="border-border" />
                          <div>
                            <p className="text-xs font-bold text-card-foreground mb-2">Acceptance</p>
                            <div className="space-y-2">
                              {projectData.acceptanceCriteria.map((criterion, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0 mt-1.5"></div>
                                  <span className="text-xs text-muted-foreground leading-relaxed">{criterion}</span>
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
        customMessage="Your project is now live and developers can start applying. We'll notify you when someone applies. As soon as a developer expresses intent to contribute to a specific module, we'll ask you for a deposit."
        customBadgeText="Published Successfully"
        customShareText={`I just published a new project: ${projectData.title}! Looking for talented developers. `}
      />
    </div>
  );
};

export default PreviewPublish;

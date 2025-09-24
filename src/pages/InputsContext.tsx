import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProgressStepper from "@/components/ProgressStepper";
import { Upload } from "lucide-react";

const steps = [
  { number: 1, label: "Describe", sublabel: "Need" },
  { number: 2, label: "Inputs &", sublabel: "Context" },
  { number: 3, label: "Acceptance", sublabel: "Criteria" },
  { number: 4, label: "Reward &", sublabel: "Timeline" },
  { number: 5, label: "Preview &", sublabel: "Publish" }
];

const InputsContext = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [repoUrl, setRepoUrl] = useState("");
  const [designLink, setDesignLink] = useState("");
  const [dependencies, setDependencies] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Get data from previous step
  const gigData = location.state || {
    title: "Wallet Login + SIWE Protection",
    description: "Implement Web3 wallet auth with SIWE and route guards; include tests and docs.",
    price: "$2,000–$3,200",
    timeline: "1–2 weeks"
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploadedFiles(Array.from(files));
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files) {
      setUploadedFiles(Array.from(files));
    }
  };

  const handleExtractContext = () => {
    console.log("Extracting context with AI");
  };

  const handleCheckDependencies = () => {
    console.log("Checking dependencies with AI");
  };

  const handleBack = () => {
    navigate("/hiring/describe-project", { state: gigData });
  };

  const handleNext = () => {
    navigate("/hiring/acceptance-criteria", { 
      state: { 
        ...gigData,
        repoUrl,
        designLink,
        dependencies,
        files: uploadedFiles
      } 
    });
  };

  return (
    <div className="min-h-screen bg-white font-inter text-contribo-text">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Header */}
          <Card className="p-6 shadow-card border-border bg-card">
            <h1 className="text-2xl font-bold text-card-foreground">Create Milestone Gig</h1>
          </Card>

          {/* Progress Stepper */}
          <div className="px-6">
            <ProgressStepper steps={steps} currentStep={2} />
          </div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 shadow-card border-border bg-card">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-card-foreground">Step 2 · Provide inputs & context</h2>
                  <p className="text-sm text-muted-foreground">
                    Links and files help developers start fast.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Repo URL */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-card-foreground">Repo URL</label>
                    <Input
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      className="text-base bg-muted border-border h-11"
                      placeholder="https://github.com/org/app"
                    />
                  </div>

                  {/* Design Link */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-card-foreground">Design link (Figma, etc.)</label>
                    <Input
                      value={designLink}
                      onChange={(e) => setDesignLink(e.target.value)}
                      className="text-base bg-muted border-border h-11"
                      placeholder="https://www.figma.com/file/..."
                    />
                  </div>

                  {/* File Upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-card-foreground">Useful files that might help in gaining context</label>
                    <div
                      className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Drop files or click to upload</p>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>
                    
                    {/* Show uploaded files */}
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-card-foreground">Uploaded files:</p>
                        <div className="space-y-1">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded">
                              {file.name} ({(file.size / 1024).toFixed(1)} KB)
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dependencies */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-card-foreground">Additional notes</label>
                    <Textarea
                      value={dependencies}
                      onChange={(e) => setDependencies(e.target.value)}
                      className="min-h-16 text-base bg-muted border-border resize-none"
                      placeholder="Any important details, requirements, or context that would help the developer..."
                    />
                  </div>
                </div>

                {/* AI Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    disabled
                    className="h-8 px-6 text-muted-foreground bg-muted/50 border-muted cursor-not-allowed font-bold text-sm"
                  >
                    Extract context
                    <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Coming Soon</span>
                  </Button>
                  <Button
                    variant="secondary"
                    disabled
                    className="h-8 px-6 text-muted-foreground bg-muted/50 border-muted cursor-not-allowed font-bold text-sm"
                  >
                    Check dependencies
                    <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Coming Soon</span>
                  </Button>
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-6">
                  <Button
                    variant="secondary"
                    onClick={handleBack}
                    className="px-8 py-2 h-11 font-bold"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold px-12 py-2 h-11"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default InputsContext;

interface Step {
  number: number;
  label: string;
  sublabel: string;
  completed?: boolean;
  active?: boolean;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: number;
}

const ProgressStepper = ({ steps, currentStep }: ProgressStepperProps) => {
  return (
    <div className="relative">
      {/* Progress bar background */}
      <div className="absolute top-7 left-7 right-7 h-1 bg-border rounded"></div>
      
      {/* Active progress */}
      <div 
        className="absolute top-7 left-7 h-1 bg-primary rounded transition-all duration-300"
        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
      ></div>
      
      {/* Steps */}
      <div className="flex justify-between relative">
        {steps.map((step, index) => {
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;
          
          return (
            <div key={step.number} className="flex flex-col items-center">
              <div 
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : isCompleted 
                    ? "bg-primary text-primary-foreground"
                    : "bg-border text-muted-foreground"
                }`}
              >
                {step.number}
              </div>
              <div className="mt-3 text-center">
                <div className={`text-xs font-bold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {step.label}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {step.sublabel}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressStepper;

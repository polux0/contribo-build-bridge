import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    if (type === "file") {
      return (
        <div className="relative">
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            ref={ref}
            {...props}
          />
          <div className="flex items-center h-10 w-full rounded-md border border-input bg-background py-2 text-base">
            <button
              type="button"
              className="bg-black text-white text-sm font-medium px-4 py-2 rounded-l-md hover:bg-gray-800 transition-colors mr-3"
            >
              Choose File
            </button>
            <span className="text-muted-foreground text-sm">
              {props.value ? 'File selected' : 'No file chosen'}
            </span>
          </div>
        </div>
      )
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

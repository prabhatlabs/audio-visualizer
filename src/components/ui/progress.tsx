import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
    React.ElementRef<typeof ProgressPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
        indicatorClassName?: string;
        bufferValue?: number;
    }
>(({ className, value, indicatorClassName, bufferValue, ...props }, ref) => (
    <ProgressPrimitive.Root
        ref={ref}
        className={cn(
            "relative h-1 w-full overflow-hidden rounded-full",
            className,
        )}
        {...props}
    >
        {bufferValue !== undefined && (
            <div
                className="absolute top-0 left-0 h-full bg-red-500 transition-all duration-300"
                style={{ width: `${bufferValue}%` }}
            />
        )}
        <ProgressPrimitive.Indicator
            className={cn(
                "h-full w-full flex-1 bg-primary transition-all",
                indicatorClassName,
            )}
            style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
    </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };

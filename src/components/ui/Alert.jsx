import React from "react";
import { CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "../../lib/cn";

const alertVariants = {
  success: {
    container: "bg-green-50 border-green-200 text-green-900",
    icon: CheckCircle2,
    iconColor: "text-green-600",
  },
  error: {
    container: "bg-red-50 border-red-200 text-red-900",
    icon: XCircle,
    iconColor: "text-red-600",
  },
  warning: {
    container: "bg-yellow-50 border-yellow-200 text-yellow-900",
    icon: AlertCircle,
    iconColor: "text-yellow-600",
  },
  info: {
    container: "bg-blue-50 border-blue-200 text-blue-900",
    icon: Info,
    iconColor: "text-blue-600",
  },
};

export const Alert = ({ variant = "info", title, children, className }) => {
  const config = alertVariants[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "relative w-full rounded-lg border p-4 flex items-start gap-3",
        config.container,
        className
      )}
    >
      <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", config.iconColor)} />
      <div className="flex-1">
        {title && <h5 className="font-semibold mb-1">{title}</h5>}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
};

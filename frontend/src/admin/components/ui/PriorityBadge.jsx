import React from "react";
import { Badge } from "./Badge";

export const PriorityBadge = ({ priority, className = "" }) => {
  const priorityLower = priority?.toLowerCase();

  let variant = "secondary";
  if (priorityLower === "low") variant = "info";
  else if (priorityLower === "medium") variant = "primary";
  else if (priorityLower === "high") variant = "warning";
  else if (priorityLower === "critical") variant = "danger";

  return (
    <Badge variant={variant} className={className}>
      {priority}
    </Badge>
  );
};

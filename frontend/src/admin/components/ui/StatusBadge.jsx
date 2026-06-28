import React from "react";
import { Badge } from "./Badge";

export const StatusBadge = ({ status, className = "" }) => {
  const statusLower = status?.toLowerCase();

  let variant = "secondary";
  if (statusLower === "pending") variant = "warning";
  else if (statusLower === "in progress" || statusLower === "active") variant = "primary";
  else if (statusLower === "resolved") variant = "success";
  else if (statusLower === "suspended") variant = "danger";

  return (
    <Badge variant={variant} className={className}>
      {status}
    </Badge>
  );
};

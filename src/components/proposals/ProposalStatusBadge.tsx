/**
 * ProposalStatusBadge Component
 *
 * Displays a status badge for proposals with appropriate styling
 */

import { Badge } from '@/components/ui/badge';
import { getStatusDisplay } from '@/lib/formatters';
import type { ProposalStatus } from '@/types/proposal';

interface ProposalStatusBadgeProps {
  status: ProposalStatus;
  className?: string;
}

export function ProposalStatusBadge({ status, className }: ProposalStatusBadgeProps) {
  const display = getStatusDisplay(status);

  return (
    <Badge
      className={`${display.className} ${className || ''}`}
      aria-label={`Status: ${display.label}`}
    >
      <span className="mr-1" aria-hidden="true">{display.icon}</span>
      {display.label}
    </Badge>
  );
}

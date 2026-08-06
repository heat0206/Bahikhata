/**
 * Pure utility — no state dependencies.
 * Components import this directly instead of receiving it as a prop.
 */
export function getStatusClassName(status) {
  if (!status) return 'status-default';
  return `status-${status.toLowerCase()}`;
}

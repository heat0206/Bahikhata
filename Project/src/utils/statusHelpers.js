/**
 * Pure utility — no state dependencies.
 * Components import this directly instead of receiving it as a prop.
 */
export function getStatusClassName(status) {
  if (!status) return 'status-default';
  const safeStatus = status.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-');
  return `status-${safeStatus}`;
}

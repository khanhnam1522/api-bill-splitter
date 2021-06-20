export function timeDifferenceInMinute(startDate: Date, endDate: Date) {
  const diffMs = endDate.getTime() - startDate.getTime(); // milliseconds between endDate & startDate
  const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
  return diffMins;
}

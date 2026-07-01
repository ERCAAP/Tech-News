export function getUserInitials(user: { firstName?: string; lastName?: string } | null): string {
  if (!user) return '';
  
  const firstInitial = user.firstName?.[0] || '';
  const lastInitial = user.lastName?.[0] || '';
  
  return (firstInitial + lastInitial).toUpperCase();
} 
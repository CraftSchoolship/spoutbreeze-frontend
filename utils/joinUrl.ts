// Client-side utility functions that require browser APIs

export const getShareableJoinUrl = (eventId: string, role: 'attendee' | 'moderator' = 'attendee'): string => {
  // Check if we're in the browser environment
  if (typeof window !== 'undefined') {
    const baseUrl = window.location.origin;
    return `${baseUrl}/join/${eventId}?role=${role}`;
  }
  
  // Fallback for server-side rendering (shouldn't be called server-side, but just in case)
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  return `${baseUrl}/join/${eventId}?role=${role}`;
};

// You can add other client-side utilities here
export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (typeof window === 'undefined' || !navigator.clipboard) {
    return false;
  }
  
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};
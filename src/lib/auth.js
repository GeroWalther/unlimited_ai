/**
 * Simple client-side authentication utility to generate and maintain a persistent anonymous user ID.
 * This is a temporary solution until we implement proper authentication.
 */

// Generate a random user ID
const generateUserId = () => {
  return (
    'anon-' +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

// Get the current user ID from localStorage or create a new one
export const getUserId = () => {
  if (typeof window === 'undefined') {
    return null; // Server-side rendering
  }

  let userId = localStorage.getItem('userId');

  if (!userId) {
    userId = generateUserId();
    localStorage.setItem('userId', userId);
  }

  return userId;
};

// Create a fake username from the user ID
export const getUsername = () => {
  const userId = getUserId();
  if (!userId) return 'guest_user';

  // Extract a portion of the ID to make a shorter username
  return 'artist_' + userId.substring(5, 10);
};

// Check if a user is currently logged in (always true for this simple version)
export const isLoggedIn = () => {
  return !!getUserId();
};

// In the future, this would be a real authentication function
export const login = async (credentials) => {
  // This would normally verify credentials with a server
  console.log('Login functionality will be implemented in the future');
  return { success: true, userId: getUserId() };
};

// For future use - would clear the authentication state
export const logout = () => {
  // We'll keep the user ID for now
  console.log('Logout functionality will be implemented in the future');
  return true;
};

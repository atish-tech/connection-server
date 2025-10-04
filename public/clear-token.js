// Script to clear invalid tokens and fetch a new one
(function() {
  // Check for JWT_SECRET in localStorage
  const token = localStorage.getItem('token');
  
  // If it matches the JWT_SECRET pattern, remove it
  if (token && (
      token === '44196dd4a6e7f9c17683e50ae8128fc110f353987fdd09a208a19feef1195f5b' || 
      token.length > 64
    )) {
    console.log('Removing invalid token from localStorage');
    localStorage.removeItem('token');
    
    // Redirect to main page
    window.location.href = '/';
  }
})();

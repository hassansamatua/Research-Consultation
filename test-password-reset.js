// Test script for password reset functionality
// Run this in browser console when on the forgot password page

async function testPasswordReset() {
  try {
    // Test forgot password
    console.log('Testing forgot password...');
    const forgotResponse = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: 'test@example.com' // Replace with actual email
      }),
    });
    
    const forgotData = await forgotResponse.json();
    console.log('Forgot password response:', forgotData);
    
    if (forgotData.resetToken) {
      // Test reset password
      console.log('Testing reset password...');
      const resetResponse = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: forgotData.resetToken,
          password: 'newpassword123'
        }),
      });
      
      const resetData = await resetResponse.json();
      console.log('Reset password response:', resetData);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Run the test
testPasswordReset();

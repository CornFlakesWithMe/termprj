interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

// Mock email service for development
export const sendEmail = async (options: EmailOptions) => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // Log the email details for development
      console.log('Email would be sent to:', options.to);
      console.log('Subject:', options.subject);
      console.log('Text:', options.text);
      console.log('HTML:', options.html);
      
      resolve({
        success: true,
        previewUrl: 'https://ethereal.email/messages', // Mock preview URL
      });
    }, 1000);
  });
};

export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  const resetUrl = `http://localhost:19006/auth/reset-password?token=${resetToken}`;
  
  return sendEmail({
    to: email,
    subject: 'Password Reset Request',
    text: `Click the following link to reset your password: ${resetUrl}`,
    html: `
      <h1>Password Reset Request</h1>
      <p>Click the button below to reset your password:</p>
      <a href="${resetUrl}" style="
        display: inline-block;
        padding: 10px 20px;
        background-color: #007AFF;
        color: white;
        text-decoration: none;
        border-radius: 5px;
        margin: 10px 0;
      ">Reset Password</a>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `,
  });
};
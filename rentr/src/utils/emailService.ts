import { supabase } from '@/lib/supabaseClient';

// Simple utility for email services

interface WelcomeEmailParams {
  to: string;
  name: string;
  agency: string;
  password: string;
  invitedBy: string;
  loginUrl: string;
}

/**
 * Send a welcome email to a new user with their credentials
 */
export async function sendWelcomeEmail(params: WelcomeEmailParams): Promise<void> {
  const { to, name, agency, password, invitedBy, loginUrl } = params;
  
  // During development, just log the email
  console.log(`
    === SENDING EMAIL ===
    To: ${to}
    Subject: Welcome to ${agency}
    
    Hi ${name},
    
    You've been invited by ${invitedBy} to join ${agency} on Rentr.
    
    Your login details:
    Email: ${to}
    Password: ${password}
    
    Login at: ${loginUrl}
    
    We recommend changing your password after your first login.
    
    Welcome to the team!
  `);
  
  // In a real application, you would integrate with an email service here
  // Example with a hypothetical email service:
  // 
  // return emailClient.send({
  //   to,
  //   from: 'noreply@rentr.com',
  //   subject: `Welcome to ${agency}`,
  //   html: `
  //     <h1>Welcome to ${agency}!</h1>
  //     <p>Hi ${name},</p>
  //     <p>You've been invited by ${invitedBy} to join ${agency} on Rentr.</p>
  //     <p><strong>Your login details:</strong><br>
  //     Email: ${to}<br>
  //     Password: ${password}</p>
  //     <p><a href="${loginUrl}">Login here</a></p>
  //     <p>We recommend changing your password after your first login.</p>
  //     <p>Welcome to the team!</p>
  //   `
  // });
  
  // For now, just simulate success
  return Promise.resolve();
}

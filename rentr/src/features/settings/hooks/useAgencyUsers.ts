import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { AgencyUser } from '../types';
import { Role } from '@/types/auth.types';
import { sendWelcomeEmail } from '@/utils/emailService'; // You'll need to create this utility

interface UseAgencyUsersOptions {
  agencyId?: string;
}

export const useAgencyUsers = (options?: UseAgencyUsersOptions) => {
  const { agencyId } = options || {};

  return useQuery({
    queryKey: ["agency-users", agencyId],
    queryFn: async () => {
      if (!agencyId) {
        console.log("No agency ID provided to useAgencyUsers");
        return [];
      }
      
      try {
        console.log("Fetching agency users for agency:", agencyId);
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("agencyid", agencyId);

        if (error) {
          console.error("Error fetching agency users:", error);
          throw error;
        }

        console.log(`Found ${data?.length || 0} users for agency ${agencyId}`);
        return data || [];
      } catch (err) {
        console.error("Exception in useAgencyUsers:", err);
        return [];
      }
    },
    enabled: !!agencyId,
  });
};

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: Role }) => {
      const { error } = await supabase
        .from('users')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', userId);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencyUsers'] });
    }
  });
}

export function useAddAgencyUser() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      email, 
      name, 
      role 
    }: { 
      email: string; 
      name?: string; 
      role: Role; 
    }) => {
      if (!user) {
        throw new Error("You must be logged in to add team members");
      }

      try {
        // First get the user's agency ID
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("agencyid")
          .eq("id", user.id)
          .single();
        
        if (userError) {
          console.error("Error getting user agency:", userError);
          throw new Error("Failed to get your agency information");
        }
        
        if (!userData?.agencyid) {
          throw new Error("You are not associated with any agency");
        }
        
        const agencyId = userData.agencyid;
        
        // Get agency name for the welcome email
        const { data: agencyData, error: agencyError } = await supabase
          .from("agencies")
          .select("name")
          .eq("id", agencyId)
          .single();
          
        if (agencyError) {
          console.error("Error fetching agency details:", agencyError);
          throw new Error("Failed to get agency details");
        }
        
        // Check if user with email already exists
        const { data: existingUsers, error: emailCheckError } = await supabase
          .from('users')
          .select('id, email')
          .ilike('email', email);
          
        if (emailCheckError) {
          console.error("Error checking existing user:", emailCheckError);
        }
        
        // User already exists in database
        if (existingUsers && existingUsers.length > 0) {
          // Add them to this agency directly
          const existingUserId = existingUsers[0].id;
          
          // Update the user to be part of this agency too
          const { error: updateError } = await supabase
            .from('users')
            .update({ 
              agencyid: agencyId,
              role,
              updated_at: new Date().toISOString() 
            })
            .eq('id', existingUserId);
            
          if (updateError) {
            console.error("Error updating existing user:", updateError);
            throw updateError;
          }
          
          // Add to agency_members table
          const { error: memberError } = await supabase
            .from('agency_members')
            .insert([{
              userid: existingUserId,
              agencyid: agencyId,
              role,
              is_active: true,
              created_at: new Date().toISOString()
            }]);
            
          if (memberError && memberError.code !== '23505') { // Ignore duplicate key errors
            console.error("Error adding to agency_members:", memberError);
            throw memberError;
          }
          
          return { 
            success: true, 
            invited: false,
            userId: existingUserId 
          };
        }
        
        // Generate a temporary password
        const tempPassword = generateStrongPassword();
        const displayName = name || email.split('@')[0];
        
        // Only use admin.createUser (no fallbacks)
        const { data: adminAuthData, error: adminAuthError } = await supabase.auth.admin.createUser({
          email,
          password: tempPassword,
          email_confirm: true, // Auto-confirm the email
          user_metadata: {
            name: displayName,
            role,
            agencyid: agencyId,
          }
        });
        
        if (adminAuthError) {
          console.error("Error creating user with admin API:", adminAuthError);
          throw new Error(
            `Cannot create user account: ${adminAuthError.message}. ` +
            `You need admin privileges to add team members.`
          );
        }
        
        if (!adminAuthData?.user) {
          throw new Error("Failed to create user account: No user data returned");
        }
        
        const userId = adminAuthData.user.id;
        
        // Create user record in the database
        const { error: dbError } = await supabase
          .from('users')
          .insert([{
            id: userId,
            name: displayName,

            agencyid: agencyId,
            role,
            is_active: true,
            created_at: new Date().toISOString()
          }]);
        
        if (dbError) {
          console.error("Error creating user in database:", dbError);
          throw dbError;
        }
        
        // Add to agency_members table
        const { error: memberError } = await supabase
          .from('agency_members')
          .insert([{
            userid: userId,
            agencyid: agencyId,
            role,
            is_active: true,
            created_at: new Date().toISOString()
          }]);
        
        if (memberError) {
          console.error("Error adding to agency_members:", memberError);
          throw memberError;
        }
        
        // Send welcome email with credentials
        try {
          // In development, just log the credentials
          if (process.env.NODE_ENV === 'development') {
            console.log(`
              Welcome Email:
              To: ${email}
              Subject: Welcome to ${agencyData.name}
              
              Hi ${displayName},
              
              You've been invited to join ${agencyData.name} on Rentr.
              
              Your login details:
              Email: ${email}
              Password: ${tempPassword}
              
              Login at: ${window.location.origin}/auth
            `);
          } else {
            // In production, use your email service
            await sendWelcomeEmail({
              to: email,
              name: displayName,
              agency: agencyData.name,
              password: tempPassword,
              invitedBy: user.email || 'your colleague',
              loginUrl: window.location.origin + '/auth'
            });
          }
        } catch (emailError) {
          console.error("Error sending welcome email:", emailError);
          // Continue even if email fails, since the account is created
        }
        
        return { 
          success: true, 
          invited: true,
          userId
        };
      } catch (err) {
        console.error("Error in addAgencyUser:", err);
        throw err;
      }
    },
    onSuccess: () => {
      // Refresh agency users data
      queryClient.invalidateQueries({ queryKey: ['agency-users'] });
    },
  });
}

// Helper function to generate a strong password
function generateStrongPassword(): string {
  // Generate a password with at least 12 characters including at least one number, uppercase, lowercase, and special character
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
  
  const getRandomChar = (str: string) => str.charAt(Math.floor(Math.random() * str.length));
  
  // Start with one of each required character type
  let password = [
    getRandomChar(lowercase),
    getRandomChar(uppercase),
    getRandomChar(numbers),
    getRandomChar(special),
  ].join('');
  
  // Add 8 more random characters
  const allChars = lowercase + uppercase + numbers + special;
  for (let i = 0; i < 8; i++) {
    password += getRandomChar(allChars);
  }
  
  // Shuffle the password
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}

export function useRemoveAgencyUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, agencyId }: { userId: string, agencyId: string }) => {
      // Remove user from agency_members 
      const { error } = await supabase
        .from('agency_members')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('userid', userId)
        .eq('agencyid', agencyId);
      
      if (error) throw error;
      
      // Update user record to remove agency association
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ 
          agencyid: null, 
          is_active: false,
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId);
      
      if (userUpdateError) throw userUpdateError;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencyUsers'] });
    }
  });
}

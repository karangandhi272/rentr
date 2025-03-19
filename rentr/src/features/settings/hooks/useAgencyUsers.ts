import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { AgencyUser } from '../types';
import { Role } from '@/types/auth.types';

export function useAgencyUsers() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['agencyUsers', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        // First get the user's agency ID
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('agencyid')
          .eq('id', user.id)
          .single();
        
        if (userError) {
          console.error("Failed to get user's agency:", userError);
          return [];
        }
        
        if (!userData?.agencyid) {
          console.log("User is not part of any agency");
          return [];
        }
        
        // Get all users in the same agency
        const { data: agencyUsers, error: usersError } = await supabase
          .from('users')
          .select('id, name, email, role, profile_picture, is_active, availability')
          .eq('agencyid', userData.agencyid);
        
        if (usersError) {
          console.error("Failed to fetch agency users:", usersError);
          return [];
        }
        
        return agencyUsers as AgencyUser[];
      } catch (err) {
        console.error("Error in useAgencyUsers:", err);
        return [];
      }
    },
    enabled: !!user
  });
}

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
      role, 
      generatePassword = true 
    }: { 
      email: string; 
      name?: string; 
      role: Role; 
      generatePassword?: boolean;
    }) => {
      // First get the user's agency ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('agencyid')
        .eq('id', user?.id)
        .single();
      
      if (userError) throw userError;
      
      if (!userData?.agencyid) {
        throw new Error("You are not associated with an agency");
      }
      
      // Check if user with this email already exists in Auth
      const { data: existingAuth, error: authCheckError } = await supabase.auth.admin.listUsers({
        filter: { email: [email] }
      });
      
      let userId: string;
      let inviteSent = false;
      
      if (authCheckError) {
        console.error("Error checking for existing user:", authCheckError);
      }
      
      // If user doesn't exist in Auth, create them
      if (!existingAuth || existingAuth.users.length === 0) {
        // Generate a random password for new users
        const tempPassword = generatePassword 
          ? Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-4) + "!"
          : "";
        
        // Create user in Auth
        const { data: newAuthUser, error: createAuthError } = await supabase.auth.admin.createUser({
          email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            name: name || email.split('@')[0],
            agencyid: userData.agencyid,
            role: role
          }
        });
        
        if (createAuthError) throw createAuthError;
        
        if (!newAuthUser?.user) {
          throw new Error("Failed to create user");
        }
        
        userId = newAuthUser.user.id;
        inviteSent = true;
        
        // Create user record in the users table
        const { error: createUserError } = await supabase
          .from('users')
          .insert([{
            id: userId,
            name: name || email.split('@')[0],
            email,
            agencyid: userData.agencyid,
            role,
            created_at: new Date().toISOString(),
            is_active: true,
          }]);
        
        if (createUserError) {
          // If we fail to create the user record, delete the auth user
          await supabase.auth.admin.deleteUser(userId);
          throw createUserError;
        }
      } else {
        // User exists in Auth, check if they're in our users table
        userId = existingAuth.users[0].id;
        
        const { data: existingUser, error: userCheckError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (userCheckError && userCheckError.code !== 'PGRST116') {
          throw userCheckError;
        }
        
        // Update user with new agency and role
        if (existingUser) {
          // If user exists, update their agency
          const { error: updateError } = await supabase
            .from('users')
            .update({ 
              agencyid: userData.agencyid,
              role,
              is_active: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
          
          if (updateError) throw updateError;
        } else {
          // Insert new user record
          const { error: insertError } = await supabase
            .from('users')
            .insert([{ 
              id: userId,
              name: name || email.split('@')[0],
              email,
              agencyid: userData.agencyid,
              role,
              created_at: new Date().toISOString(),
              is_active: true,
            }]);
          
          if (insertError) throw insertError;
        }
      }
      
      // Add entry to agency_members table
      const { error: memberError } = await supabase
        .from('agency_members')
        .insert([{
          userid: userId,
          agencyid: userData.agencyid,
          role,
          is_active: true,
          created_at: new Date().toISOString()
        }]);
      
      if (memberError) {
        // Check if this is a duplicate key error (user already a member)
        if (memberError.code === '23505') {
          // Update the existing record instead
          const { error: updateMemberError } = await supabase
            .from('agency_members')
            .update({
              role,
              is_active: true,
              updated_at: new Date().toISOString()
            })
            .eq('userid', userId)
            .eq('agencyid', userData.agencyid);
          
          if (updateMemberError) throw updateMemberError;
        } else {
          throw memberError;
        }
      }
      
      // Send password reset email for new users
      if (inviteSent) {
        try {
          await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password',
          });
        } catch (resetError) {
          console.error("Error sending password reset email:", resetError);
          // Continue anyway since the user was created successfully
        }
      }
      
      return { 
        success: true, 
        invited: inviteSent,
        userId 
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencyUsers'] });
    },
  });
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
 
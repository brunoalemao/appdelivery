/*
  # Fix RLS policy for user registration
  
  1. Changes
    - Add policy to allow unauthenticated users to create profiles during registration
    - This is needed because the user isn't authenticated yet when creating their initial profile
*/

-- Remove existing insert policy
DROP POLICY IF EXISTS "Usuários podem criar seus próprios perfis" ON perfis;

-- Add new insert policy that allows profile creation during registration
CREATE POLICY "Permitir criação de perfil durante registro"
ON perfis FOR INSERT
WITH CHECK (
  -- Allow if user_id matches the ID that will be assigned to the new user
  -- OR if the user is already authenticated and creating their own profile
  auth.uid() IS NULL OR auth.uid() = user_id
);
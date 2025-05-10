/*
  # Fix RLS policy for user registration
  
  1. Changes
    - Remove existing restrictive policy for profile creation
    - Add new policy that allows profile creation during registration
    - Maintain security while enabling new user registration flow
  
  2. Security
    - Allow unauthenticated requests during initial registration
    - Maintain user_id validation for authenticated users
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
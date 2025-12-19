-- Migration: Add 'transcript' type to files_type_check constraint
-- Run this in Supabase SQL Editor

-- First, drop the existing constraint
ALTER TABLE files DROP CONSTRAINT IF EXISTS files_type_check;

-- Then, add the constraint back with 'transcript' included
ALTER TABLE files ADD CONSTRAINT files_type_check 
  CHECK (type IN ('audio', 'email', 'transcript'));


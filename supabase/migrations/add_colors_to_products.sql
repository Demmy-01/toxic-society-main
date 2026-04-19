-- Add colors array column to products table
-- Run this once in your Supabase SQL Editor
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS colors text[] NOT NULL DEFAULT '{}';

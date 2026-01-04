-- Add auto_reply_enabled and writing_style columns to categories
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS auto_reply_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS writing_style TEXT NOT NULL DEFAULT 'professional';

-- Add a comment for clarity
COMMENT ON COLUMN public.categories.auto_reply_enabled IS 'When enabled, AI will automatically send replies for this category';
COMMENT ON COLUMN public.categories.writing_style IS 'Per-category writing style: professional, concise, friendly, detailed';

-- Drop the signature column from ai_settings since it is no longer needed
ALTER TABLE public.ai_settings DROP COLUMN IF EXISTS signature;
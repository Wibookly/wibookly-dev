-- Add condition_logic (AND/OR) and recipient_filter (to_me, cc_me, to_or_cc_me) columns to rules
ALTER TABLE public.rules 
ADD COLUMN condition_logic text NOT NULL DEFAULT 'and',
ADD COLUMN recipient_filter text DEFAULT NULL;
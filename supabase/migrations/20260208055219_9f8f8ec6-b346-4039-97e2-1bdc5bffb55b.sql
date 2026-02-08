
-- Restrict ai_activity_logs SELECT to user's own logs only
DROP POLICY IF EXISTS "Users can view AI activity in their organization" ON public.ai_activity_logs;

CREATE POLICY "Users can view their own AI activity logs"
  ON public.ai_activity_logs
  FOR SELECT
  USING (auth.uid() = user_id);

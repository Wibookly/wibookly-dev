-- Add RLS policies for the signature-logos storage bucket
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload own signature logos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'signature-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to read their own files
CREATE POLICY "Users can read own signature logos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'signature-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update own signature logos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'signature-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete own signature logos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'signature-logos' AND (storage.foldername(name))[1] = auth.uid()::text);
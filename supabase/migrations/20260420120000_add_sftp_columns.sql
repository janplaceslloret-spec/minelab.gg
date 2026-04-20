-- Add SFTP credential columns to mc_servers
ALTER TABLE mc_servers
  ADD COLUMN IF NOT EXISTS sftp_user TEXT,
  ADD COLUMN IF NOT EXISTS sftp_pass TEXT;

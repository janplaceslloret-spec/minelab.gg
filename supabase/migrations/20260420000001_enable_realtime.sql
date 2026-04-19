-- Enable Realtime for server status and metrics tables (idempotent)

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE mc_servers;
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE server_metrics;
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE server_activity;
EXCEPTION WHEN others THEN NULL; END $$;

-- REPLICA IDENTITY FULL so UPDATE events include all column values
-- (required for row-level filters on UPDATE to work correctly)
ALTER TABLE mc_servers REPLICA IDENTITY FULL;
ALTER TABLE server_metrics REPLICA IDENTITY FULL;
ALTER TABLE server_activity REPLICA IDENTITY FULL;

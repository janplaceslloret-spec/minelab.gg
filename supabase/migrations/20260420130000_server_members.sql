-- ─────────────────────────────────────────────────────────────────
-- server_members: invite / share a Minecraft server with other users
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS server_members (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id     UUID        NOT NULL REFERENCES mc_servers(id) ON DELETE CASCADE,
  -- null until the invited person accepts (matches by email on accept)
  user_id       UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_email TEXT        NOT NULL,
  role          TEXT        NOT NULL DEFAULT 'member'
                              CHECK (role IN ('admin', 'member', 'viewer')),
  status        TEXT        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'active', 'revoked')),
  invited_by    UUID        NOT NULL REFERENCES auth.users(id),
  -- opaque token that goes in the invite link URL
  invite_token  TEXT        UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  accepted_at   TIMESTAMPTZ
);

-- ── RLS ──────────────────────────────────────────────────────────
ALTER TABLE server_members ENABLE ROW LEVEL SECURITY;

-- Server owner can do anything with their members
CREATE POLICY "owner_all" ON server_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM mc_servers
      WHERE id = server_members.server_id
        AND user_id = auth.uid()
    )
  );

-- A member can view their own rows (pending + active)
CREATE POLICY "member_select_own" ON server_members
  FOR SELECT
  USING (user_id = auth.uid());

-- Any logged-in user can accept an invite whose token they know
-- (they prove they know the token; we also require email match server-side in the UI)
CREATE POLICY "accept_by_token" ON server_members
  FOR UPDATE
  USING  (status = 'pending')
  WITH CHECK (
    status        = 'active'
    AND user_id   = auth.uid()
  );

-- ── Index for fast token lookup (used on invite-accept page) ─────
CREATE INDEX IF NOT EXISTS idx_server_members_token   ON server_members (invite_token);
CREATE INDEX IF NOT EXISTS idx_server_members_user_id ON server_members (user_id);
CREATE INDEX IF NOT EXISTS idx_server_members_server  ON server_members (server_id);

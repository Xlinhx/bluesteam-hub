CREATE TABLE creative_coloring_runs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),open_key uuid NOT NULL UNIQUE,
 content_key text NOT NULL,content_version integer CHECK(content_version>0),content_title text NOT NULL,
 token_hash text NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),expires_at timestamptz NOT NULL DEFAULT now()+interval '1 day'
);
CREATE INDEX creative_coloring_run_content ON creative_coloring_runs(content_key,content_version,created_at);
CREATE INDEX creative_coloring_run_created ON creative_coloring_runs(created_at,id);
CREATE TABLE creative_coloring_events (
 run_id uuid NOT NULL REFERENCES creative_coloring_runs(id) ON DELETE CASCADE,
 client_event_id uuid NOT NULL,type text NOT NULL CHECK(type IN ('tool_used','manual_save','complete','undo')),
 tool text CHECK(tool IN ('brush','bucket','eraser','stamp')),
 input text CHECK(input IN ('touch','pen','mouse','unknown')),created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(run_id,client_event_id)
);
CREATE INDEX creative_coloring_event_run ON creative_coloring_events(run_id,type);

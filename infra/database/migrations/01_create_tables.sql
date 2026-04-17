-- 01_create_tables.sql

CREATE TABLE Dist_app.posts (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    post    TEXT        NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
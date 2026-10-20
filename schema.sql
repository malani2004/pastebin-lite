create table if not exists pastes (
  id         text primary key,
  content    text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  max_views  integer,
  views      integer not null default 0
);

-- Shared one-use leases for privacy-sensitive media batches. The subject is a
-- SHA-256 digest of the verified user id; no image, filename, question, or
-- observation is persisted here.
create table if not exists media_batch_reservation (
  subject_hash char(64) not null,
  batch_id uuid not null,
  reservation_id uuid not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default CURRENT_TIMESTAMP,
  primary key (subject_hash, batch_id),
  constraint media_batch_subject_hash_format check (subject_hash ~ '^[0-9a-f]{64}$')
);

create index if not exists media_batch_reservation_expiry_idx
  on media_batch_reservation (expires_at);

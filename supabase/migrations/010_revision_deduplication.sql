-- ============================================================================
-- 010: Revision Queue Idempotency & Deduplication
-- Ensures that +1, +3, +7 spaced revisions are strictly unique per mistake/topic
-- ============================================================================

DO $$
BEGIN
  -- 1. Deduplicate revisions table by (user_id, mistake_id, interval_day) if mistake_id column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'revisions' AND column_name = 'mistake_id'
  ) THEN
    -- Delete older/uncompleted duplicate rows keeping the most progressed one
    DELETE FROM public.revisions r1
    WHERE r1.mistake_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.revisions r2
        WHERE r2.user_id = r1.user_id
          AND r2.mistake_id = r1.mistake_id
          AND r2.interval_day = r1.interval_day
          AND (
            (r2.status = 'completed' AND r1.status <> 'completed')
            OR (r2.status = r1.status AND r2.created_at > r1.created_at)
            OR (r2.status = r1.status AND r2.created_at = r1.created_at AND r2.id > r1.id)
          )
      );

    -- Create unique partial index for idempotency
    CREATE UNIQUE INDEX IF NOT EXISTS idx_revisions_user_mistake_interval
      ON public.revisions (user_id, mistake_id, interval_day)
      WHERE mistake_id IS NOT NULL;
  END IF;

  -- 2. Deduplicate by (user_id, topic_id, due_date) if topic_id column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'revisions' AND column_name = 'topic_id'
  ) THEN
    DELETE FROM public.revisions r1
    WHERE r1.topic_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.revisions r2
        WHERE r2.user_id = r1.user_id
          AND r2.topic_id = r1.topic_id
          AND r2.due_date = r1.due_date
          AND (
            (r2.completed = true AND r1.completed = false)
            OR (r2.completed = r1.completed AND r2.created_at > r1.created_at)
            OR (r2.completed = r1.completed AND r2.created_at = r1.created_at AND r2.id > r1.id)
          )
      );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_revisions_user_topic_date
      ON public.revisions (user_id, topic_id, due_date)
      WHERE topic_id IS NOT NULL;
  END IF;
END $$;

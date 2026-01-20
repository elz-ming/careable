-- Add status column to events table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_status') THEN
        CREATE TYPE event_status AS ENUM ('active', 'cancelled', 'completed');
    END IF;
END $$;

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS status event_status DEFAULT 'active';

-- Update existing events to 'active' if they have no status
UPDATE public.events SET status = 'active' WHERE status IS NULL;

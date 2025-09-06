/*
  # Create votes table for group voting system

  1. New Tables
    - `votes`
      - `id` (uuid, primary key)
      - `trip_id` (uuid, foreign key to trips)
      - `activity_id` (text, identifier for activity)
      - `voter_id` (text, identifier for voter)
      - `choice` (text, 'yes'|'no'|'maybe')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `votes` table
    - Add policies for authenticated users to vote and view votes for their trips
    - Unique constraint to prevent duplicate votes from same user on same activity

  3. Indexes
    - Index on trip_id for efficient querying
    - Index on activity_id for vote aggregation
    - Composite index on trip_id + activity_id for results view
*/

CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE,
  activity_id text NOT NULL,
  voter_id text NOT NULL,
  choice text CHECK (choice IN ('yes', 'no', 'maybe')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(trip_id, activity_id, voter_id)
);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS votes_trip_id_idx ON votes(trip_id);
CREATE INDEX IF NOT EXISTS votes_activity_id_idx ON votes(activity_id);
CREATE INDEX IF NOT EXISTS votes_trip_activity_idx ON votes(trip_id, activity_id);
CREATE INDEX IF NOT EXISTS votes_voter_id_idx ON votes(voter_id);

-- Policies for voting system
CREATE POLICY "Authenticated users can vote"
  ON votes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = votes.trip_id
    )
  );

CREATE POLICY "Users can read votes for own trips"
  ON votes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = votes.trip_id 
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own votes"
  ON votes
  FOR UPDATE
  TO authenticated
  USING (voter_id = auth.uid()::text)
  WITH CHECK (voter_id = auth.uid()::text);

CREATE POLICY "Users can delete own votes"
  ON votes
  FOR DELETE
  TO authenticated
  USING (voter_id = auth.uid()::text);
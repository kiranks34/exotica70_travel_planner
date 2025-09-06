/*
  # Create votes table

  1. New Tables
    - `votes`
      - `id` (uuid, primary key)
      - `trip_id` (uuid, foreign key to trips)
      - `activity_id` (text, identifier for activity within trip)
      - `voter_id` (text, identifier for voter - could be user ID or session ID)
      - `choice` (text, constrained to 'yes', 'no', 'maybe')
      - `created_at` (timestamp, default now)
      - Unique constraint on (trip_id, activity_id, voter_id)

  2. Security
    - Enable RLS on `votes` table
    - Add policy for authenticated users to vote on trips they have access to
    - Add policy for trip owners to read all votes on their trips
*/

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE,
  activity_id text NOT NULL,
  voter_id text NOT NULL,
  choice text CHECK (choice IN ('yes', 'no', 'maybe')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(trip_id, activity_id, voter_id)
);

-- Enable RLS
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read votes for trips they own
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

-- Policy: Authenticated users can vote on trips (insert votes)
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

-- Policy: Users can update their own votes
CREATE POLICY "Users can update own votes"
  ON votes
  FOR UPDATE
  TO authenticated
  USING (voter_id = auth.uid()::text)
  WITH CHECK (voter_id = auth.uid()::text);

-- Policy: Users can delete their own votes
CREATE POLICY "Users can delete own votes"
  ON votes
  FOR DELETE
  TO authenticated
  USING (voter_id = auth.uid()::text);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS votes_trip_id_idx ON votes(trip_id);
CREATE INDEX IF NOT EXISTS votes_activity_id_idx ON votes(activity_id);
CREATE INDEX IF NOT EXISTS votes_voter_id_idx ON votes(voter_id);
CREATE INDEX IF NOT EXISTS votes_trip_activity_idx ON votes(trip_id, activity_id);
/*
  # Create trips table

  1. New Tables
    - `trips`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `destination` (text, not null)
      - `vibe` (text, trip type/style)
      - `days` (int, trip duration)
      - `budget` (int, estimated budget)
      - `start_date` (date, trip start date)
      - `itinerary` (jsonb, structured itinerary data)
      - `created_at` (timestamp, default now)

  2. Security
    - Enable RLS on `trips` table
    - Add policy for users to read/write their own trips
    - Add policy for users to read shared trips (future feature)
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  destination text NOT NULL,
  vibe text,
  days int,
  budget int,
  start_date date,
  itinerary jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own trips
CREATE POLICY "Users can read own trips"
  ON trips
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own trips
CREATE POLICY "Users can insert own trips"
  ON trips
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own trips
CREATE POLICY "Users can update own trips"
  ON trips
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own trips
CREATE POLICY "Users can delete own trips"
  ON trips
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS trips_user_id_idx ON trips(user_id);
CREATE INDEX IF NOT EXISTS trips_created_at_idx ON trips(created_at DESC);
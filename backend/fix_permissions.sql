-- Grant permissions to the database user for all tables and sequences
-- This script should be run by a superuser (postgres) or database owner

-- Grant all privileges on all tables in the public schema to the user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rashindu;

-- Grant all privileges on all sequences in the public schema to the user
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rashindu;

-- Grant usage on the schema
GRANT USAGE ON SCHEMA public TO rashindu;

-- Grant default privileges for future tables and sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO rashindu;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO rashindu;

-- Specific grants for the users table and its sequence (if they exist)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'users') THEN
    GRANT ALL PRIVILEGES ON TABLE users TO rashindu;
  END IF;
  
  IF EXISTS (SELECT FROM pg_sequences WHERE sequencename = 'users_id_seq') THEN
    GRANT ALL PRIVILEGES ON SEQUENCE users_id_seq TO rashindu;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'user_profiles') THEN
    GRANT ALL PRIVILEGES ON TABLE user_profiles TO rashindu;
  END IF;
  
  IF EXISTS (SELECT FROM pg_sequences WHERE sequencename = 'user_profiles_id_seq') THEN
    GRANT ALL PRIVILEGES ON SEQUENCE user_profiles_id_seq TO rashindu;
  END IF;
END $$;

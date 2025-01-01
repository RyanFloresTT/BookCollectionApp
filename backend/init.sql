-- Create the database if it doesn't exist
CREATE DATABASE book_collection_db;

-- Connect to the database
\c book_collection_db;

-- Create the books table
CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    auth0_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(13),
    page_count INTEGER,
    started_at TIMESTAMP,
    finished_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Create the streak_settings table
CREATE TABLE IF NOT EXISTS streak_settings (
    auth0_id VARCHAR(255) PRIMARY KEY,
    excluded_days INTEGER[] DEFAULT '{}',
    goal_interval VARCHAR(10) DEFAULT 'yearly',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Create the goal_histories table
CREATE TABLE IF NOT EXISTS goal_histories (
    id SERIAL PRIMARY KEY,
    auth0_id VARCHAR(255) NOT NULL,
    interval VARCHAR(10) NOT NULL,
    target INTEGER NOT NULL,
    achieved INTEGER NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    was_completed BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_books_auth0_id ON books(auth0_id);
CREATE INDEX IF NOT EXISTS idx_goal_histories_auth0_id ON goal_histories(auth0_id);
CREATE INDEX IF NOT EXISTS idx_goal_histories_end_date ON goal_histories(end_date); 
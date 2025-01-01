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

CREATE INDEX IF NOT EXISTS idx_goal_histories_auth0_id ON goal_histories(auth0_id);
CREATE INDEX IF NOT EXISTS idx_goal_histories_end_date ON goal_histories(end_date); 
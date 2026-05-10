CREATE TABLE text_dictation (
    id        VARCHAR(36)   NOT NULL,
    name      VARCHAR(100)  NOT NULL,
    full_text VARCHAR(5000) NOT NULL,
    CONSTRAINT pk_text_dictation PRIMARY KEY (id)
);

CREATE TABLE text_dictation_segments (
    text_dictation_id VARCHAR(36)  NOT NULL,
    segments          VARCHAR(255),
    segments_order    INTEGER      NOT NULL,
    CONSTRAINT pk_text_dictation_segments PRIMARY KEY (text_dictation_id, segments_order),
    CONSTRAINT fk_text_dictation_segments_text_dictation FOREIGN KEY (text_dictation_id) REFERENCES text_dictation (id)
);

CREATE TABLE text_dictation_score (
    id                VARCHAR(36) NOT NULL,
    text_dictation_id VARCHAR(36) NOT NULL,
    score             INTEGER     NOT NULL,
    total             INTEGER     NOT NULL,
    played_at         TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT pk_text_dictation_score PRIMARY KEY (id),
    CONSTRAINT fk_text_dictation_score_text_dictation FOREIGN KEY (text_dictation_id) REFERENCES text_dictation (id)
);

CREATE INDEX idx_text_dictation_score_text_dictation_id ON text_dictation_score (text_dictation_id);

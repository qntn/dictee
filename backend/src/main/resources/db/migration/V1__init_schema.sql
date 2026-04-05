CREATE TABLE dictation (
    id   VARCHAR(36)  NOT NULL,
    name VARCHAR(100) NOT NULL,
    CONSTRAINT pk_dictation PRIMARY KEY (id)
);

CREATE TABLE dictation_words (
    dictation_id VARCHAR(36)  NOT NULL,
    words        VARCHAR(255),
    words_order  INTEGER      NOT NULL,
    CONSTRAINT pk_dictation_words PRIMARY KEY (dictation_id, words_order),
    CONSTRAINT fk_dictation_words_dictation FOREIGN KEY (dictation_id) REFERENCES dictation (id)
);

CREATE TABLE dictation_score (
    id           VARCHAR(36) NOT NULL,
    dictation_id VARCHAR(36) NOT NULL,
    score        INTEGER     NOT NULL,
    total        INTEGER     NOT NULL,
    played_at    TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT pk_dictation_score PRIMARY KEY (id),
    CONSTRAINT fk_dictation_score_dictation FOREIGN KEY (dictation_id) REFERENCES dictation (id)
);

CREATE INDEX idx_score_dictation_id ON dictation_score (dictation_id);

package com.dictee.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TextDictationScore {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "text_dictation_id", nullable = false)
    private TextDictation textDictation;

    @Min(0)
    @Column(nullable = false)
    private int score;

    @Min(1)
    @Column(nullable = false)
    private int total;

    @Column(nullable = false)
    private Instant playedAt;

    @PrePersist
    protected void onCreate() {
        if (playedAt == null) {
            playedAt = Instant.now();
        }
    }
}

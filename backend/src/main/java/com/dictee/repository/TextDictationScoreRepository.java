package com.dictee.repository;

import com.dictee.model.TextDictationScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TextDictationScoreRepository extends JpaRepository<TextDictationScore, String> {
    List<TextDictationScore> findByTextDictationIdOrderByPlayedAtDesc(String textDictationId);
    void deleteByTextDictationId(String textDictationId);
}

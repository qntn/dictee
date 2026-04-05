package com.dictee.repository;

import com.dictee.model.DictationScore;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DictationScoreRepository extends JpaRepository<DictationScore, String> {

    List<DictationScore> findByDictationIdOrderByPlayedAtDesc(String dictationId);
}

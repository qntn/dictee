package com.dictee.repository;

import com.dictee.model.TextDictation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TextDictationRepository extends JpaRepository<TextDictation, String> {
}

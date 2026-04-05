package com.dictee.repository;

import com.dictee.model.Dictation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DictationRepository extends JpaRepository<Dictation, String> {
}

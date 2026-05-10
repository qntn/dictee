package com.dictee.service;

import com.dictee.model.TextDictation;
import com.dictee.repository.TextDictationRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class TextDictationServiceTest {

    @Autowired
    private TextDictationService textDictationService;

    @Autowired
    private TextDictationRepository textDictationRepository;

    @Test
    void shouldCreateTextDictationWithSegments() {
        // Given
        TextDictation textDictation = new TextDictation();
        textDictation.setName("Test Dictation");
        textDictation.setFullText("Bonjour le monde. Comment allez-vous? Très bien!");

        // When
        TextDictation saved = textDictationService.create(textDictation);

        // Then
        assertThat(saved).isNotNull();
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getName()).isEqualTo("Test Dictation");
        assertThat(saved.getFullText()).isEqualTo("Bonjour le monde. Comment allez-vous? Très bien!");
        assertThat(saved.getSegments()).isNotNull();
        assertThat(saved.getSegments()).hasSize(3);
        assertThat(saved.getSegments()).containsExactly(
                "Bonjour le monde.",
                "Comment allez-vous?",
                "Très bien!"
        );

        // Verify it was persisted correctly
        TextDictation retrieved = textDictationRepository.findById(saved.getId()).orElseThrow();
        assertThat(retrieved.getSegments()).hasSize(3);
        assertThat(retrieved.getSegments()).containsExactly(
                "Bonjour le monde.",
                "Comment allez-vous?",
                "Très bien!"
        );
    }

    @Test
    void shouldCreateTextDictationWithoutPunctuation() {
        // Given
        TextDictation textDictation = new TextDictation();
        textDictation.setName("Simple Text");
        textDictation.setFullText("Bonjour le monde");

        // When
        TextDictation saved = textDictationService.create(textDictation);

        // Then
        assertThat(saved.getSegments()).hasSize(1);
        assertThat(saved.getSegments()).containsExactly("Bonjour le monde");
    }
}

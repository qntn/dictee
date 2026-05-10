package com.dictee.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class HintServiceTest {

    private HintService hintService;

    @BeforeEach
    void setUp() {
        hintService = new HintService();
    }

    @Test
    void generateHint_level1_shouldReturnFirstLetterAndLength() {
        String hint = hintService.generateHint("chat", 1);
        assertTrue(hint.contains("C"));
        assertTrue(hint.contains("4"));
    }

    @Test
    void generateHint_level2_shouldReturnFirstLastLetterAndVowels() {
        String hint = hintService.generateHint("maison", 2);
        assertTrue(hint.contains("M"));
        assertTrue(hint.contains("n"));
        assertTrue(hint.contains("3")); // a, i, o
    }

    @Test
    void generateHint_level3_shouldReturnSyllables() {
        String hint = hintService.generateHint("chocolat", 3);
        assertTrue(hint.toLowerCase().contains("cho") || hint.toLowerCase().contains("co"));
    }

    @Test
    void generateHint_emptyWord_shouldReturnEmpty() {
        String hint = hintService.generateHint("", 1);
        assertEquals("", hint);
    }

    @Test
    void generateHint_nullWord_shouldReturnEmpty() {
        String hint = hintService.generateHint(null, 1);
        assertEquals("", hint);
    }

    @Test
    void generateHint_invalidLevel_shouldReturnErrorMessage() {
        String hint = hintService.generateHint("chat", 0);
        assertTrue(hint.contains("invalide"));
    }

    @Test
    void analyzeError_missingAccents_shouldDetect() {
        String feedback = hintService.analyzeError("eleve", "élève");
        assertTrue(feedback.toLowerCase().contains("accent"));
    }

    @Test
    void analyzeError_doubleConsonant_shouldDetect() {
        String feedback = hintService.analyzeError("alée", "allée");
        assertTrue(feedback.toLowerCase().contains("double") ||
                feedback.toLowerCase().contains("consonnes"));
    }

    @Test
    void analyzeError_phoneticSimilar_shouldDetect() {
        String feedback = hintService.analyzeError("foto", "photo");
        assertTrue(feedback.toLowerCase().contains("son") ||
                feedback.toLowerCase().contains("orthographe"));
    }

    @Test
    void analyzeError_nullInputs_shouldHandleGracefully() {
        String feedback = hintService.analyzeError(null, "chat");
        assertFalse(feedback.isEmpty());
    }

    @Test
    void analyzeError_differentWords_shouldGiveGenericFeedback() {
        String feedback = hintService.analyzeError("chien", "chat");
        assertFalse(feedback.isEmpty());
    }
}

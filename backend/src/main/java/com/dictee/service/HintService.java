package com.dictee.service;

import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;

/**
 * Service for generating progressive hints to help children learn spelling.
 */
@Service
public class HintService {

    /**
     * Generate hints for a given word at different difficulty levels.
     *
     * @param word the target word
     * @param level hint level (1=easy, 2=medium, 3=hard)
     * @return a hint appropriate for the level
     */
    public String generateHint(String word, int level) {
        if (word == null || word.isEmpty()) {
            return "";
        }

        return switch (level) {
            case 1 -> generateLevel1Hint(word);  // First letter + length
            case 2 -> generateLevel2Hint(word);  // First and last letter + vowels count
            case 3 -> generateLevel3Hint(word);  // Phonetic hint + syllables
            default -> "Niveau d'indice invalide";
        };
    }

    /**
     * Level 1: Show first letter and word length.
     */
    private String generateLevel1Hint(String word) {
        char firstLetter = Character.toUpperCase(word.charAt(0));
        int length = word.length();
        return String.format("Le mot commence par '%c' et contient %d lettre%s",
                firstLetter, length, length > 1 ? "s" : "");
    }

    /**
     * Level 2: Show first and last letter, and number of vowels.
     */
    private String generateLevel2Hint(String word) {
        char firstLetter = Character.toUpperCase(word.charAt(0));
        char lastLetter = Character.toLowerCase(word.charAt(word.length() - 1));
        int vowelCount = countVowels(word);

        return String.format("Le mot commence par '%c', finit par '%c' et contient %d voyelle%s",
                firstLetter, lastLetter, vowelCount, vowelCount > 1 ? "s" : "");
    }

    /**
     * Level 3: Phonetic hint with syllable breakdown.
     */
    private String generateLevel3Hint(String word) {
        String syllables = breakIntoSyllables(word);
        List<String> sounds = detectSpecialSounds(word);

        StringBuilder hint = new StringBuilder("Le mot se découpe ainsi : " + syllables);

        if (!sounds.isEmpty()) {
            hint.append(". Il contient le son : ").append(String.join(", ", sounds));
        }

        return hint.toString();
    }

    /**
     * Count vowels in a word (a, e, i, o, u, y and accented variants).
     */
    private int countVowels(String word) {
        int count = 0;
        String normalized = word.toLowerCase();
        for (char c : normalized.toCharArray()) {
            if (isVowel(c)) {
                count++;
            }
        }
        return count;
    }

    /**
     * Check if a character is a vowel (including accented versions).
     */
    private boolean isVowel(char c) {
        return "aeiouyàâäéèêëïîôùûüÿ".indexOf(c) >= 0;
    }

    /**
     * Break word into syllables (simplified French syllabification).
     */
    private String breakIntoSyllables(String word) {
        // Simplified syllable breaking: insert dash between consonant-vowel transitions
        StringBuilder result = new StringBuilder();
        String lower = word.toLowerCase();

        for (int i = 0; i < lower.length(); i++) {
            result.append(lower.charAt(i));

            // Add separator between syllables (simplified heuristic)
            if (i < lower.length() - 2) {
                boolean currentIsVowel = isVowel(lower.charAt(i));
                boolean nextIsConsonant = !isVowel(lower.charAt(i + 1));
                boolean afterNextIsVowel = isVowel(lower.charAt(i + 2));

                if (currentIsVowel && nextIsConsonant && afterNextIsVowel) {
                    result.append("-");
                }
            }
        }

        return result.toString();
    }

    /**
     * Detect special French sounds in the word.
     */
    private List<String> detectSpecialSounds(String word) {
        List<String> sounds = new ArrayList<>();
        String lower = word.toLowerCase();

        // Common French digraphs and trigraphs
        if (lower.contains("ou")) sounds.add("ou");
        if (lower.contains("on")) sounds.add("on");
        if (lower.contains("an") || lower.contains("en")) sounds.add("an/en");
        if (lower.contains("in") || lower.contains("ain") || lower.contains("ein")) sounds.add("in/ain");
        if (lower.contains("oi")) sounds.add("oi");
        if (lower.contains("au") || lower.contains("eau")) sounds.add("au/eau");
        if (lower.contains("eu")) sounds.add("eu");
        if (lower.contains("ch")) sounds.add("ch");
        if (lower.contains("ph")) sounds.add("ph");
        if (lower.contains("gn")) sounds.add("gn");
        if (lower.contains("ill") || lower.contains("ail")) sounds.add("ill/ail");

        return sounds;
    }

    /**
     * Analyze errors and provide targeted feedback.
     *
     * @param attempted what the child wrote
     * @param expected the correct word
     * @return feedback explaining the type of error
     */
    public String analyzeError(String attempted, String expected) {
        if (attempted == null || expected == null) {
            return "Impossible d'analyser l'erreur";
        }

        String attemptedLower = attempted.toLowerCase();
        String expectedLower = expected.toLowerCase();

        // Check for accent errors
        String attemptedNoAccent = removeAccents(attemptedLower);
        String expectedNoAccent = removeAccents(expectedLower);
        if (attemptedNoAccent.equals(expectedNoAccent)) {
            return "Presque ! Il manque juste les accents. Regarde bien les é, è, ê, à, etc.";
        }

        // Check for double consonant errors
        if (hasSimilarDoubleConsonantPattern(attemptedLower, expectedLower)) {
            return "Attention aux consonnes doubles ! Certaines lettres doivent être doublées.";
        }

        // Check for phonetic similarity (sounds right but spelled wrong)
        if (soundsSimilar(attemptedLower, expectedLower)) {
            return "Tu as le bon son mais pas la bonne orthographe. Essaie une autre façon d'écrire ce son.";
        }

        // Check for letter inversion
        if (hasLetterInversion(attemptedLower, expectedLower)) {
            return "Tu as inversé deux lettres. Relis attentivement le mot.";
        }

        // Generic feedback
        return "Regarde bien chaque lettre et réessaie !";
    }

    /**
     * Remove accents from a string for comparison.
     */
    private String removeAccents(String str) {
        return Normalizer.normalize(str, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
    }

    /**
     * Check if two words have similar double consonant patterns.
     */
    private boolean hasSimilarDoubleConsonantPattern(String a, String b) {
        String aSimplified = a.replaceAll("(.)\\1+", "$1");
        String bSimplified = b.replaceAll("(.)\\1+", "$1");
        return aSimplified.equals(bSimplified);
    }

    /**
     * Check if two words sound similar (simplified phonetic comparison).
     */
    private boolean soundsSimilar(String a, String b) {
        // Replace common phonetic equivalents
        String aPhonetic = simplifyPhonetics(a);
        String bPhonetic = simplifyPhonetics(b);
        return aPhonetic.equals(bPhonetic);
    }

    /**
     * Simplify phonetics for comparison.
     */
    private String simplifyPhonetics(String word) {
        return word.toLowerCase()
                .replace("ph", "f")
                .replace("qu", "k")
                .replace("eau", "o")
                .replace("au", "o")
                .replace("ai", "è")
                .replace("ei", "è")
                .replace("s", "c");
    }

    /**
     * Check if two words have letter inversion.
     */
    private boolean hasLetterInversion(String a, String b) {
        if (Math.abs(a.length() - b.length()) > 0) {
            return false;
        }

        int differences = 0;
        for (int i = 0; i < Math.min(a.length() - 1, b.length() - 1); i++) {
            if (a.charAt(i) == b.charAt(i + 1) && a.charAt(i + 1) == b.charAt(i)) {
                differences++;
            }
        }

        return differences > 0;
    }
}

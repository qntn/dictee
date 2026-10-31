# Dictée

An app where an adult creates dictées and a child takes them: the child hears each item spoken, types it, and gets corrected.

## Language

**Dictée**:
A named list of items an adult prepares for a child to write from hearing. Comes in two kinds: a dictée de mots (items are single words) and a dictée de texte (a text split into phrases).
_Avoid_: Dictation (in prose), exercise

**Mot**:
One word the child must write. The unit of correctness and of scoring in both kinds of dictée.
_Avoid_: Item, token

**Phrase**:
One item of a dictée de texte: a sentence the child hears and writes in one go.
_Avoid_: Segment, sentence

**Réponse**:
What the child typed for one item of a dictée.
_Avoid_: Answer, attempt, input

**Correction**:
The verdict on one réponse: which mots are right, which are wrong, missing or extra, and what kind of mistake each wrong mot shows. A mot is right only if its accents, apostrophes and hyphens match; capitals and other punctuation don't count. Kinds of mistake: accents manquants, consonne double, bon son mais mauvaise orthographe, lettres inversées, mot manquant, mot en trop.
_Avoid_: Validation, check, feedback, similarity

**Score**:
The result of one full playthrough of a dictée: correct mots out of total mots. The same number is shown to the child and kept in the history, tagged with how the dictée was played (dictée or pendu). Using indices does not lower it.
_Avoid_: Percentage, similarity, grade

**Indice**:
A progressive clue the child can ask for while writing an item, up to three levels.
_Avoid_: Hint (in prose), help

**Pendu**:
Another way to play a dictée de mots. For each mot the child hears, they find its letters one at a time, with 7 errors allowed. A mot is found if it is completed before the child is hanged.
_Avoid_: Hangman (in prose), game

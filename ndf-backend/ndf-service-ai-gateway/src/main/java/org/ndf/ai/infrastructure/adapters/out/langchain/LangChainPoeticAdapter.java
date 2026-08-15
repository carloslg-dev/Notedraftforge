package org.ndf.ai.infrastructure.adapters.out.langchain;

import jakarta.enterprise.context.ApplicationScoped;
import org.ndf.ai.application.ports.out.PoeticEnginePort;
import org.ndf.contracts.ai.model.MeterAnalysisResponseDTO;
import org.ndf.contracts.ai.model.RhymeCandidateDTO;
import org.ndf.contracts.ai.model.RhymeResponseDTO;
import org.ndf.contracts.ai.model.StanzaMeterDTO;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@ApplicationScoped
public class LangChainPoeticAdapter implements PoeticEnginePort {

    private static final Pattern VOWEL_CLUSTER = Pattern.compile("[aeiouáéíóúüAEIOUÁÉÍÓÚÜ]+");
    private static final String RHYME_KIND_CONSONANT = "consonant";
    private static final String RHYME_KIND_ASSONANT = "assonant";

    @Override
    public MeterAnalysisResponseDTO computeMeter(String text, String language) {
        String[] lines = text.split("\\R+");
        List<StanzaMeterDTO> stanzaList = new ArrayList<>();

        for (String rawLine : lines) {
            String trimmedLine = rawLine.trim();
            if (trimmedLine.isEmpty()) {
                continue;
            }

            int syllables = countSyllables(trimmedLine);
            String meterName = classifyMeter(syllables);
            String stressPattern = generateStressPattern(trimmedLine, syllables);

            StanzaMeterDTO dto = new StanzaMeterDTO();
            dto.setLine(trimmedLine);
            dto.setSyllableCount(syllables);
            dto.setMeterType(meterName);
            dto.setStressPattern(stressPattern);

            stanzaList.add(dto);
        }

        String overallRhythm = determineOverallRhythm(stanzaList);

        MeterAnalysisResponseDTO response = new MeterAnalysisResponseDTO();
        response.setTotalLines(stanzaList.size());
        response.setStanzas(stanzaList);
        response.setOverallRhythm(overallRhythm);

        return response;
    }

    @Override
    public RhymeResponseDTO computeRhymes(String targetWord, String poemContext, String rhymeType) {
        String lowerWord = targetWord.toLowerCase(Locale.ROOT);
        String ending = extractPhoneticEnding(lowerWord);

        List<RhymeCandidateDTO> candidates = new ArrayList<>();
        List<String> mockRhymes = getRhymeDictionaryForEnding(ending, lowerWord);

        for (int i = 0; i < mockRhymes.size(); i++) {
            String rhymeWord = mockRhymes.get(i);
            RhymeCandidateDTO candidate = new RhymeCandidateDTO();
            candidate.setWord(rhymeWord);
            candidate.setRhymeKind(RHYME_KIND_CONSONANT.equalsIgnoreCase(rhymeType) ? RHYME_KIND_CONSONANT : RHYME_KIND_ASSONANT);
            candidate.setPoeticWeight((float) Math.max(0.70, 0.95 - (i * 0.05)));
            candidate.setUsageExample(String.format("... %s en la brisa", rhymeWord));
            candidates.add(candidate);
        }

        RhymeResponseDTO response = new RhymeResponseDTO();
        response.setTargetWord(targetWord);
        response.setCandidates(candidates);

        return response;
    }

    private int countSyllables(String line) {
        Matcher matcher = VOWEL_CLUSTER.matcher(line);
        int count = 0;
        while (matcher.find()) {
            count++;
        }
        // Poetic sinalefa heuristic: subtract 1 syllable for adjacent vowel boundaries across words
        String[] words = line.split("\\s+");
        for (int i = 0; i < words.length - 1; i++) {
            String w1 = words[i].toLowerCase(Locale.ROOT);
            String w2 = words[i + 1].toLowerCase(Locale.ROOT);
            if (!w1.isEmpty() && !w2.isEmpty()) {
                char last = w1.charAt(w1.length() - 1);
                char first = w2.charAt(0);
                if (isVowel(last) && isVowel(first)) {
                    count = Math.max(1, count - 1);
                }
            }
        }
        return Math.max(1, count);
    }

    private boolean isVowel(char c) {
        return "aeiouáéíóúü".indexOf(Character.toLowerCase(c)) >= 0;
    }

    private String classifyMeter(int syllables) {
        return switch (syllables) {
            case 7 -> "Heptasílabo (7)";
            case 8 -> "Octosílabo (8)";
            case 11 -> "Endecasílabo (11)";
            case 14 -> "Alejandrino (14)";
            default -> (syllables <= 8)
                ? String.format("Arte Menor (%d)", syllables)
                : String.format("Arte Mayor (%d)", syllables);
        };
    }

    private String generateStressPattern(String line, int syllables) {
        StringBuilder pattern = new StringBuilder();
        for (int i = 1; i <= syllables; i++) {
            if (i == syllables - 1 || (syllables == 11 && (i == 4 || i == 8))) {
                pattern.append("/ ");
            } else {
                pattern.append("- ");
            }
        }
        return pattern.toString().trim();
    }

    private String determineOverallRhythm(List<StanzaMeterDTO> stanzas) {
        if (stanzas.isEmpty()) {
            return "Sin métrica detectada";
        }
        double avgSyllables = stanzas.stream()
            .mapToInt(StanzaMeterDTO::getSyllableCount)
            .average()
            .orElse(0.0);

        if (avgSyllables >= 10.5 && avgSyllables <= 11.5) {
            return "Cadencia de Arte Mayor (Endecasílabo predominante)";
        } else if (avgSyllables >= 7.5 && avgSyllables <= 8.5) {
            return "Cadencia de Arte Menor (Octosílabo romance)";
        } else {
            return String.format("Métrica mixta polimétrica (promedio %.1f sílabas)", avgSyllables);
        }
    }

    private String extractPhoneticEnding(String word) {
        if (word.length() <= 3) {
            return word;
        }
        return word.substring(word.length() - 3);
    }

    private List<String> getRhymeDictionaryForEnding(String ending, String targetWord) {
        List<String> pool = switch (ending) {
            case "lla", "ela" -> List.of("estrella", "huella", "centella", "doncella", "bella");
            case "ada", "ado" -> List.of("mirada", "alborada", "callada", "dorada", "amada");
            case "ina", "ino" -> List.of("golondrina", "colina", "marina", "divina", "argentina");
            case "ore", "or" -> List.of("amor", "candor", "fulgor", "ardor", "resplandor");
            default -> List.of(targetWord + "mente", "fuente", "puente", "creyente", "ardiente");
        };

        return pool.stream()
            .filter(w -> !w.equalsIgnoreCase(targetWord))
            .limit(4)
            .toList();
    }
}

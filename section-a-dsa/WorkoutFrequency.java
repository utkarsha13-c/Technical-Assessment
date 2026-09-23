import java.util.*;

public class WorkoutFrequency {

    public static String firstUniqueExercise(String[] exercises) {

        if (exercises == null || exercises.length == 0) {
            return "No unique exercise";
        }

        Map<String, Integer> frequency = new HashMap<>();

        // Step 1: Count frequency
        for (String exercise : exercises) {
            frequency.put(
                exercise,
                frequency.getOrDefault(exercise, 0) + 1
            );
        }

        
        for (String exercise : exercises) {

            if (frequency.get(exercise) == 1) {
                return exercise;
            }
        }

        return "No unique exercise";
    }

    public static void main(String[] args) {

        String[] exercises = {
            "Bench",
            "Squat",
            "Bench",
            "Deadlift",
            "Squat",
            "Bench"
        };

        System.out.println(firstUniqueExercise(exercises));
    }
}
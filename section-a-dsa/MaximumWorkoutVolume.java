import java.util.*;

public class MaximumWorkoutVolume {

    static class Workout {

        String exercise;
        long weight;
        long reps;

        Workout(String exercise, long weight, long reps) {
            this.exercise = exercise;
            this.weight = weight;
            this.reps = reps;
        }
    }

    public static String findMaximumVolume(List<Workout> workouts) {

        if (workouts == null || workouts.isEmpty()) {
            return "No workout records";
        }

        Map<String, Long> totalVolume = new HashMap<>();

        
        for (Workout workout : workouts) {

            long volume = workout.weight * workout.reps;

            totalVolume.put(
                workout.exercise,
                totalVolume.getOrDefault(workout.exercise, 0L) + volume
            );
        }

        String maxExercise = null;
        long maxVolume = Long.MIN_VALUE;

        // Find exercise with highest total volume
        for (Map.Entry<String, Long> entry : totalVolume.entrySet()) {

            if (entry.getValue() > maxVolume) {

                maxVolume = entry.getValue();
                maxExercise = entry.getKey();
            }
        }

        return maxExercise;
    }

    public static void main(String[] args) {

        List<Workout> workouts = Arrays.asList(

            new Workout("Bench", 100, 10),
            new Workout("Squat", 120, 5),
            new Workout("Bench", 80, 10),
            new Workout("Deadlift", 150, 5)
        );

        String result = findMaximumVolume(workouts);

        System.out.println("Exercise with maximum volume: " + result);
    }
}
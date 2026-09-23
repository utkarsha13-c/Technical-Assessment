
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

public class LongestWorkoutStreak {

    public static int findLongestStreak(String[] workoutDates) {

        
        if (workoutDates == null || workoutDates.length == 0) {
            return 0;
        }

    
        Set<LocalDate> dates = new HashSet<>();

        for (String date : workoutDates) {
            dates.add(LocalDate.parse(date));
        }

        int longestStreak = 0;

        // Check each unique date
        for (LocalDate date : dates) {

            
            if (!dates.contains(date.minusDays(1))) {

                int currentStreak = 1;

                LocalDate nextDate = date.plusDays(1);

                
                while (dates.contains(nextDate)) {
                    currentStreak++;
                    nextDate = nextDate.plusDays(1);
                }

                longestStreak =
                        Math.max(longestStreak, currentStreak);
            }
        }

        return longestStreak;
    }

    public static void main(String[] args) {

        String[] workoutDates = {
                "2026-09-15",
                "2026-09-16",
                "2026-09-17",
                "2026-09-19",
                "2026-09-20",
                "2026-09-21"
        };

        int result = findLongestStreak(workoutDates);

        System.out.println("Longest workout streak: " + result);
    }
}
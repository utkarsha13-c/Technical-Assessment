# Section A - Problem Solving / DSA

## Q1 - Workout Frequency

Find the first exercise that occurs exactly once.

### Approach
A HashMap is used to count the frequency of each exercise.
The original array is then traversed again to find the first
exercise whose frequency is 1.

### Complexity
- Time: O(n)
- Space: O(n)

---

## Q2 - Longest Workout Streak

Find the longest sequence of consecutive workout dates.

### Approach
Workout dates are converted to LocalDate objects and stored
in a HashSet.

The HashSet:
- Removes duplicate dates
- Provides O(1) average lookup

A date is considered the start of a streak when the previous
day is not present. Consecutive days are then counted.

### Complexity
- Time: O(n) average
- Space: O(n)

---

## Q3 - Maximum Workout Volume

Calculate total workout volume for each exercise.

Volume = Weight × Reps

### Approach
A HashMap stores:

Exercise -> Total Volume

Each workout record is processed once and its volume is added
to the corresponding exercise.

The exercise with the highest accumulated volume is returned.

`long` is used for volume calculations to safely support
large inputs.

### Complexity
- Time: O(n)
- Space: O(k)

where k is the number of unique exercises.
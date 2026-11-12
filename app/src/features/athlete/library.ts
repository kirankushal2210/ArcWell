// Exercise library (F4-08, K-06): every exercise has a primary muscle, the equipment it needs and an
// exercise type, which decides what a set logs (kg and reps, time, distance…). Sample build: a
// static list; the licensed library with demo media and secondary muscles comes from the exercise
// API (PLAN.md blocker: demo media licence). Custom exercises are the athlete's or coach's own.

export type Muscle =
  | "abdominals"
  | "biceps"
  | "chest"
  | "forearms"
  | "lats"
  | "lower_back"
  | "neck"
  | "shoulders"
  | "traps"
  | "triceps"
  | "upper_back"
  | "abductors"
  | "adductors"
  | "calves"
  | "glutes"
  | "hamstrings"
  | "quadriceps"
  | "cardio"
  | "full_body"
  | "other";

export type Equipment =
  | "none"
  | "barbell"
  | "dumbbell"
  | "kettlebell"
  | "machine"
  | "cable"
  | "plate"
  | "band"
  | "suspension"
  | "other";

export type ExerciseType =
  | "weight_reps"
  | "bodyweight_reps"
  | "weighted_bodyweight"
  | "assisted_bodyweight"
  | "duration"
  | "duration_weight"
  | "distance_duration"
  | "weight_distance";

/** What one set records. */
export type SetField = "kg" | "reps" | "seconds" | "km";

export type Exercise = {
  name: string;
  muscle: Muscle;
  equipment: Equipment;
  type: ExerciseType;
  /** Secondary muscles (custom exercises; the API adds them for the library). */
  other?: Muscle[];
  /** Made by the athlete or coach. */
  custom?: boolean;
  /** Photo for a custom exercise (local file in the sample build; S3 via a signed URL later). */
  image?: string;
};

export const MUSCLE_LABEL: Record<Muscle, string> = {
  abdominals: "Abdominals",
  biceps: "Biceps",
  chest: "Chest",
  forearms: "Forearms",
  lats: "Lats",
  lower_back: "Lower back",
  neck: "Neck",
  shoulders: "Shoulders",
  traps: "Traps",
  triceps: "Triceps",
  upper_back: "Upper back",
  abductors: "Abductors",
  adductors: "Adductors",
  calves: "Calves",
  glutes: "Glutes",
  hamstrings: "Hamstrings",
  quadriceps: "Quadriceps",
  cardio: "Cardio",
  full_body: "Full body",
  other: "Other",
};

export const MUSCLE_GROUPS: { title: string; muscles: Muscle[] }[] = [
  {
    title: "Upper body",
    muscles: [
      "abdominals",
      "biceps",
      "chest",
      "forearms",
      "lats",
      "lower_back",
      "neck",
      "shoulders",
      "traps",
      "triceps",
      "upper_back",
    ],
  },
  {
    title: "Lower body",
    muscles: [
      "abductors",
      "adductors",
      "calves",
      "glutes",
      "hamstrings",
      "quadriceps",
    ],
  },
  { title: "Other", muscles: ["cardio", "full_body", "other"] },
];

export const EQUIPMENT_LABEL: Record<Equipment, string> = {
  none: "None",
  barbell: "Barbell",
  dumbbell: "Dumbbell",
  kettlebell: "Kettlebell",
  machine: "Machine",
  cable: "Cable",
  plate: "Plate",
  band: "Resistance band",
  suspension: "Suspension trainer",
  other: "Other",
};
export const EQUIPMENT = Object.keys(EQUIPMENT_LABEL) as Equipment[];

export const EXERCISE_TYPES: {
  value: ExerciseType;
  label: string;
  example: string;
  fields: SetField[];
}[] = [
  {
    value: "weight_reps",
    label: "Weight and reps",
    example: "Bench press, dumbbell curl",
    fields: ["kg", "reps"],
  },
  {
    value: "bodyweight_reps",
    label: "Bodyweight reps",
    example: "Pull ups, sit ups, burpees",
    fields: ["reps"],
  },
  {
    value: "weighted_bodyweight",
    label: "Weighted bodyweight",
    example: "Weighted pull ups, weighted dips",
    fields: ["kg", "reps"],
  },
  {
    value: "assisted_bodyweight",
    label: "Assisted bodyweight",
    example: "Assisted pull ups, assisted dips",
    fields: ["kg", "reps"],
  },
  {
    value: "duration",
    label: "Duration",
    example: "Plank, yoga, stretching",
    fields: ["seconds"],
  },
  {
    value: "duration_weight",
    label: "Duration and weight",
    example: "Weighted plank, wall sit with a plate",
    fields: ["kg", "seconds"],
  },
  {
    value: "distance_duration",
    label: "Distance and duration",
    example: "Running, cycling, rowing",
    fields: ["km", "seconds"],
  },
  {
    value: "weight_distance",
    label: "Weight and distance",
    example: "Farmers walk, sled push",
    fields: ["kg", "km"],
  },
];

export const fieldsOf = (t: ExerciseType): SetField[] =>
  EXERCISE_TYPES.find((x) => x.value === t)?.fields ?? ["kg", "reps"];
export const typeLabel = (t: ExerciseType) =>
  EXERCISE_TYPES.find((x) => x.value === t)?.label ?? "";

/** Column heading for a set field: weighted moves log added kg, assisted moves log the assistance. */
export const fieldHead = (f: SetField, t: ExerciseType) =>
  f === "kg"
    ? t === "weighted_bodyweight"
      ? "+KG"
      : t === "assisted_bodyweight"
        ? "−KG"
        : "KG"
    : f === "seconds"
      ? "TIME"
      : f === "km" && t === "weight_distance"
        ? "M"
        : f.toUpperCase();

const ROWS: [string, Muscle, Equipment, ExerciseType][] = [
  ["21s bicep curl", "biceps", "barbell", "weight_reps"],
  ["Ab scissors", "abdominals", "none", "bodyweight_reps"],
  ["Ab wheel", "abdominals", "other", "bodyweight_reps"],
  ["Aerobics", "cardio", "none", "duration"],
  ["Air bike", "cardio", "machine", "distance_duration"],
  ["Arnold press (dumbbell)", "shoulders", "dumbbell", "weight_reps"],
  ["Around the world", "chest", "dumbbell", "weight_reps"],
  ["Assisted pistol squats", "quadriceps", "none", "bodyweight_reps"],
  ["Back extension (hyperextension)", "lower_back", "none", "bodyweight_reps"],
  ["Back extension (machine)", "lower_back", "machine", "weight_reps"],
  [
    "Back extension (weighted hyperextension)",
    "lower_back",
    "none",
    "weighted_bodyweight",
  ],
  ["Ball slams", "full_body", "other", "weight_reps"],
  ["Band pullaparts", "shoulders", "band", "bodyweight_reps"],
  ["Battle ropes", "cardio", "other", "duration"],
  ["Bear crawl", "full_body", "none", "bodyweight_reps"],
  ["Behind the back curl (cable)", "biceps", "cable", "weight_reps"],
  [
    "Behind the back wrist curl (barbell)",
    "forearms",
    "barbell",
    "weight_reps",
  ],
  ["Belt squat (machine)", "quadriceps", "machine", "weight_reps"],
  ["Bench dip", "triceps", "none", "bodyweight_reps"],
  ["Bench press (barbell)", "chest", "barbell", "weight_reps"],
  ["Bench press (cable)", "chest", "cable", "weight_reps"],
  ["Bench press (dumbbell)", "chest", "dumbbell", "weight_reps"],
  ["Bench press (Smith machine)", "chest", "machine", "weight_reps"],
  ["Bench press - close grip (barbell)", "triceps", "barbell", "weight_reps"],
  ["Bench press - wide grip (barbell)", "chest", "barbell", "weight_reps"],
  ["Bent over row (band)", "upper_back", "band", "bodyweight_reps"],
  ["Bent over row (barbell)", "upper_back", "barbell", "weight_reps"],
  ["Bent over row (dumbbell)", "upper_back", "dumbbell", "weight_reps"],
  ["Bent over row (Smith machine)", "upper_back", "machine", "weight_reps"],
  ["Bicep curl (barbell)", "biceps", "barbell", "weight_reps"],
  ["Bicep curl (cable)", "biceps", "cable", "weight_reps"],
  ["Bicep curl (dumbbell)", "biceps", "dumbbell", "weight_reps"],
  ["Bicep curl (machine)", "biceps", "machine", "weight_reps"],
  ["Bicep curl (suspension)", "biceps", "suspension", "bodyweight_reps"],
  ["Bicycle crunch", "abdominals", "none", "bodyweight_reps"],
  ["Bicycle crunch raised legs", "abdominals", "none", "bodyweight_reps"],
  ["Bird dog", "glutes", "none", "bodyweight_reps"],
  ["Box jump", "quadriceps", "none", "bodyweight_reps"],
  ["Box squat (barbell)", "quadriceps", "barbell", "weight_reps"],
  ["Boxing", "cardio", "none", "duration"],
  ["Bulgarian split squat (barbell)", "quadriceps", "barbell", "weight_reps"],
  ["Bulgarian split squat (dumbbell)", "quadriceps", "dumbbell", "weight_reps"],
  ["Burpee", "full_body", "none", "bodyweight_reps"],
  ["Burpee broad jumps", "full_body", "none", "bodyweight_reps"],
  ["Burpee over the bar", "full_body", "none", "bodyweight_reps"],
  ["Butterfly (pec deck)", "chest", "machine", "weight_reps"],
  ["Cable core Pallof press", "abdominals", "cable", "weight_reps"],
  ["Cable crunch", "abdominals", "cable", "weight_reps"],
  ["Cable fly crossovers", "chest", "cable", "weight_reps"],
  ["Cable pull through", "glutes", "cable", "weight_reps"],
  ["Cable twist (down to up)", "abdominals", "cable", "weight_reps"],
  ["Cable twist (up to down)", "abdominals", "cable", "weight_reps"],
  ["Calf extension (machine)", "calves", "machine", "weight_reps"],
  ["Calf press (machine)", "calves", "machine", "weight_reps"],
  ["Chest dip", "chest", "none", "bodyweight_reps"],
  ["Chest dip (assisted)", "chest", "none", "assisted_bodyweight"],
  ["Chest dip (weighted)", "chest", "none", "weighted_bodyweight"],
  ["Chest fly (band)", "chest", "band", "bodyweight_reps"],
  ["Chest fly (dumbbell)", "chest", "dumbbell", "weight_reps"],
  ["Chest fly (machine)", "chest", "machine", "weight_reps"],
  ["Chest fly (suspension)", "chest", "suspension", "bodyweight_reps"],
  ["Chest press (band)", "chest", "band", "bodyweight_reps"],
  ["Chest press (machine)", "chest", "machine", "weight_reps"],
  [
    "Chest supported incline row (dumbbell)",
    "upper_back",
    "dumbbell",
    "weight_reps",
  ],
  [
    "Chest supported reverse fly (dumbbell)",
    "shoulders",
    "dumbbell",
    "weight_reps",
  ],
  ["Chest supported T bar row", "upper_back", "machine", "weight_reps"],
  [
    "Chest supported Y raise (dumbbell)",
    "shoulders",
    "dumbbell",
    "weight_reps",
  ],
  ["Chin up", "lats", "none", "bodyweight_reps"],
  ["Chin up (assisted)", "lats", "none", "assisted_bodyweight"],
  ["Chin up (weighted)", "lats", "none", "weighted_bodyweight"],
  ["Clamshell", "glutes", "none", "bodyweight_reps"],
  ["Clap push ups", "chest", "none", "bodyweight_reps"],
  ["Clean", "full_body", "barbell", "weight_reps"],
  ["Clean and jerk", "full_body", "barbell", "weight_reps"],
  ["Clean and press", "full_body", "barbell", "weight_reps"],
  ["Clean pull", "full_body", "barbell", "weight_reps"],
  ["Climbing", "cardio", "none", "duration"],
  ["Concentration curl", "biceps", "dumbbell", "weight_reps"],
  ["Cross body hammer curl", "biceps", "dumbbell", "weight_reps"],
  ["Crunch", "abdominals", "none", "bodyweight_reps"],
  ["Crunch (machine)", "abdominals", "machine", "weight_reps"],
  ["Crunch (weighted)", "abdominals", "none", "weight_reps"],
  ["Curtsy lunge (dumbbell)", "quadriceps", "dumbbell", "weight_reps"],
  ["Cycling", "cardio", "none", "distance_duration"],
  ["Dead bug", "abdominals", "none", "bodyweight_reps"],
  ["Dead hang", "upper_back", "none", "duration"],
  ["Deadlift (band)", "glutes", "band", "bodyweight_reps"],
  ["Deadlift (barbell)", "glutes", "barbell", "weight_reps"],
  ["Deadlift (dumbbell)", "glutes", "dumbbell", "weight_reps"],
  ["Deadlift (Smith machine)", "glutes", "machine", "weight_reps"],
  ["Deadlift (trap bar)", "glutes", "barbell", "weight_reps"],
  ["Deadlift high pull", "full_body", "barbell", "weight_reps"],
  ["Decline bench press (barbell)", "chest", "barbell", "weight_reps"],
  ["Decline bench press (dumbbell)", "chest", "dumbbell", "weight_reps"],
  ["Decline bench press (machine)", "chest", "machine", "weight_reps"],
  ["Decline bench press (Smith machine)", "chest", "machine", "weight_reps"],
  ["Decline chest fly (dumbbell)", "chest", "dumbbell", "weight_reps"],
  ["Decline crunch", "abdominals", "none", "bodyweight_reps"],
  ["Decline crunch (weighted)", "abdominals", "none", "weight_reps"],
  ["Decline push up", "chest", "none", "bodyweight_reps"],
  ["Diamond push up", "triceps", "none", "bodyweight_reps"],
  ["Downward dog", "full_body", "none", "duration"],
  ["Drag curl", "biceps", "barbell", "weight_reps"],
  ["Dragon flag", "abdominals", "none", "bodyweight_reps"],
  ["Dragonfly", "abdominals", "none", "bodyweight_reps"],
  ["Dumbbell row", "lats", "dumbbell", "weight_reps"],
  ["Dumbbell snatch", "full_body", "dumbbell", "weight_reps"],
  ["Dumbbell squeeze press", "chest", "dumbbell", "weight_reps"],
  ["Dumbbell step up", "quadriceps", "dumbbell", "weight_reps"],
  ["Elbow to knee", "abdominals", "none", "bodyweight_reps"],
  ["Elliptical trainer", "cardio", "machine", "distance_duration"],
  ["EZ bar biceps curl", "biceps", "barbell", "weight_reps"],
  ["Face pull", "shoulders", "cable", "weight_reps"],
  ["Farmers walk", "full_body", "dumbbell", "weight_distance"],
  ["Feet up bench press (barbell)", "chest", "barbell", "weight_reps"],
  ["Fire hydrants", "glutes", "none", "bodyweight_reps"],
  ["Floor press (barbell)", "chest", "barbell", "weight_reps"],
  ["Floor press (dumbbell)", "chest", "dumbbell", "weight_reps"],
  ["Floor triceps dip", "triceps", "none", "bodyweight_reps"],
  ["Flutter kicks", "abdominals", "none", "bodyweight_reps"],
  ["Frog jumps", "quadriceps", "none", "bodyweight_reps"],
  ["Frog pumps (dumbbell)", "glutes", "dumbbell", "weight_reps"],
  ["Front lever hold", "full_body", "none", "duration"],
  ["Front lever raise", "full_body", "none", "bodyweight_reps"],
  ["Front raise (band)", "shoulders", "band", "bodyweight_reps"],
  ["Front raise (barbell)", "shoulders", "barbell", "weight_reps"],
  ["Front raise (cable)", "shoulders", "cable", "weight_reps"],
  ["Front raise (dumbbell)", "shoulders", "dumbbell", "weight_reps"],
  ["Front raise (suspension)", "shoulders", "suspension", "bodyweight_reps"],
  ["Front squat", "quadriceps", "barbell", "weight_reps"],
  ["Full squat", "quadriceps", "barbell", "weight_reps"],
  ["Glute bridge", "glutes", "none", "bodyweight_reps"],
  ["Glute bridge (barbell)", "glutes", "barbell", "weight_reps"],
  ["Glute ham raise", "hamstrings", "none", "bodyweight_reps"],
  ["Glute kickback (machine)", "glutes", "machine", "weight_reps"],
  ["Glute kickback on floor", "glutes", "none", "bodyweight_reps"],
  ["Goblet squat", "quadriceps", "dumbbell", "weight_reps"],
  ["Good morning (barbell)", "hamstrings", "barbell", "weight_reps"],
  ["Gorilla row (kettlebell)", "upper_back", "kettlebell", "weight_reps"],
  ["Hack squat", "quadriceps", "machine", "weight_reps"],
  ["Hack squat (machine)", "quadriceps", "machine", "weight_reps"],
  ["Hammer curl (band)", "biceps", "band", "bodyweight_reps"],
  ["Hammer curl (cable)", "biceps", "cable", "weight_reps"],
  ["Hammer curl (dumbbell)", "biceps", "dumbbell", "weight_reps"],
  ["Handstand hold", "full_body", "none", "duration"],
  ["Handstand push up", "shoulders", "none", "bodyweight_reps"],
  ["Hang clean", "full_body", "barbell", "weight_reps"],
  ["Hang snatch", "full_body", "barbell", "weight_reps"],
  ["Hanging knee raise", "abdominals", "none", "bodyweight_reps"],
  ["Hanging leg raise", "abdominals", "none", "bodyweight_reps"],
  ["Heel taps", "abdominals", "none", "bodyweight_reps"],
  ["Hex press (dumbbell)", "chest", "dumbbell", "weight_reps"],
  ["High knee skips", "full_body", "none", "bodyweight_reps"],
  ["High knees", "full_body", "none", "bodyweight_reps"],
  ["HIIT", "cardio", "none", "duration"],
  ["Hiking", "cardio", "none", "distance_duration"],
  ["Hip abduction (cable)", "abductors", "cable", "weight_reps"],
  ["Hip abduction (machine)", "abductors", "machine", "weight_reps"],
  ["Hip adduction (cable)", "adductors", "cable", "weight_reps"],
  ["Hip adduction (machine)", "adductors", "machine", "weight_reps"],
  ["Hip thrust", "glutes", "none", "bodyweight_reps"],
  ["Hip thrust (barbell)", "glutes", "barbell", "weight_reps"],
  ["Hip thrust (dumbbell)", "glutes", "dumbbell", "weight_reps"],
  ["Hip thrust (machine)", "glutes", "machine", "weight_reps"],
  ["Hip thrust (Smith machine)", "glutes", "machine", "weight_reps"],
  ["Hollow rock", "abdominals", "none", "bodyweight_reps"],
  ["Incline bench press (barbell)", "chest", "barbell", "weight_reps"],
  ["Incline bench press (dumbbell)", "chest", "dumbbell", "weight_reps"],
  ["Incline chest fly (dumbbell)", "chest", "dumbbell", "weight_reps"],
  ["Incline chest press (machine)", "chest", "machine", "weight_reps"],
  ["Incline push ups", "chest", "none", "bodyweight_reps"],
  ["Inverted row", "upper_back", "none", "bodyweight_reps"],
  ["Iso-lateral chest press (machine)", "chest", "machine", "weight_reps"],
  ["Iso-lateral high row (machine)", "lats", "machine", "weight_reps"],
  ["Iso-lateral low row", "upper_back", "machine", "weight_reps"],
  ["Iso-lateral row (machine)", "upper_back", "machine", "weight_reps"],
  ["Jack knife (suspension)", "abdominals", "suspension", "bodyweight_reps"],
  ["Jackknife sit up", "abdominals", "none", "bodyweight_reps"],
  ["JM press (barbell)", "triceps", "barbell", "weight_reps"],
  ["Jump rope", "cardio", "other", "duration"],
  ["Jump shrug", "full_body", "barbell", "weight_reps"],
  ["Jump squat", "quadriceps", "none", "bodyweight_reps"],
  ["Jumping jack", "full_body", "none", "bodyweight_reps"],
  ["Jumping lunge", "quadriceps", "none", "bodyweight_reps"],
  ["Kettlebell around the world", "shoulders", "kettlebell", "weight_reps"],
  ["Kettlebell clean", "full_body", "kettlebell", "weight_reps"],
  ["Kettlebell curl", "biceps", "kettlebell", "weight_reps"],
  ["Kettlebell goblet squat", "quadriceps", "kettlebell", "weight_reps"],
  ["Kettlebell halo", "shoulders", "kettlebell", "weight_reps"],
  ["Kettlebell high pull", "full_body", "kettlebell", "weight_reps"],
  ["Kettlebell shoulder press", "shoulders", "kettlebell", "weight_reps"],
  ["Kettlebell snatch", "full_body", "kettlebell", "weight_reps"],
  ["Kettlebell swing", "full_body", "kettlebell", "weight_reps"],
  ["Kettlebell Turkish get up", "full_body", "kettlebell", "weight_reps"],
  ["Kipping pull up", "lats", "none", "bodyweight_reps"],
  ["Knee raise parallel bars", "abdominals", "none", "bodyweight_reps"],
  ["Kneeling pulldown (band)", "lats", "band", "bodyweight_reps"],
  ["Kneeling push up", "chest", "none", "bodyweight_reps"],
  ["L-sit hold", "abdominals", "none", "duration"],
  ["Landmine 180", "abdominals", "barbell", "weight_reps"],
  ["Landmine row", "upper_back", "barbell", "weight_reps"],
  ["Landmine squat and press", "full_body", "barbell", "weight_reps"],
  ["Lat pulldown (band)", "lats", "band", "bodyweight_reps"],
  ["Lat pulldown (cable)", "lats", "cable", "weight_reps"],
  ["Lat pulldown (machine)", "lats", "machine", "weight_reps"],
  ["Lat pulldown - close grip (cable)", "lats", "cable", "weight_reps"],
  ["Lateral band walks", "glutes", "band", "bodyweight_reps"],
  ["Lateral box jump", "quadriceps", "none", "bodyweight_reps"],
  ["Lateral leg raises", "glutes", "none", "bodyweight_reps"],
  ["Lateral lunge", "quadriceps", "none", "bodyweight_reps"],
  ["Lateral raise (band)", "shoulders", "band", "bodyweight_reps"],
  ["Lateral raise (cable)", "shoulders", "cable", "weight_reps"],
  ["Lateral raise (dumbbell)", "shoulders", "dumbbell", "weight_reps"],
  ["Lateral raise (machine)", "shoulders", "machine", "weight_reps"],
  ["Lateral squat", "quadriceps", "none", "bodyweight_reps"],
  ["Leg extension (machine)", "quadriceps", "machine", "weight_reps"],
  ["Leg press (machine)", "quadriceps", "machine", "weight_reps"],
  ["Leg press horizontal (machine)", "quadriceps", "machine", "weight_reps"],
  ["Leg raise parallel bars", "abdominals", "none", "bodyweight_reps"],
  ["Low cable fly crossovers", "chest", "cable", "weight_reps"],
  ["Low row (suspension)", "upper_back", "suspension", "bodyweight_reps"],
  ["Lunge", "quadriceps", "none", "bodyweight_reps"],
  ["Lunge (barbell)", "quadriceps", "barbell", "weight_reps"],
  ["Lunge (dumbbell)", "quadriceps", "dumbbell", "weight_reps"],
  ["Lying knee raise", "abdominals", "none", "bodyweight_reps"],
  ["Lying leg curl (machine)", "hamstrings", "machine", "weight_reps"],
  ["Lying leg raise", "abdominals", "none", "bodyweight_reps"],
  ["Lying neck curls", "neck", "none", "bodyweight_reps"],
  ["Lying neck curls (weighted)", "neck", "none", "weight_reps"],
  ["Lying neck extension", "neck", "none", "bodyweight_reps"],
  ["Lying neck extension (weighted)", "neck", "none", "weight_reps"],
  ["Meadows rows (barbell)", "upper_back", "barbell", "weight_reps"],
  ["Mountain climber", "full_body", "none", "bodyweight_reps"],
  ["Muscle up", "full_body", "none", "bodyweight_reps"],
  ["Negative pull up", "lats", "none", "bodyweight_reps"],
  ["Nordic hamstrings curls", "hamstrings", "none", "bodyweight_reps"],
  ["Oblique crunch", "abdominals", "none", "bodyweight_reps"],
  ["One arm push up", "chest", "none", "bodyweight_reps"],
  ["Overhead curl (cable)", "biceps", "cable", "weight_reps"],
  ["Overhead dumbbell lunge", "quadriceps", "dumbbell", "weight_reps"],
  ["Overhead plate raise", "shoulders", "plate", "weight_reps"],
  ["Overhead press (barbell)", "shoulders", "barbell", "weight_reps"],
  ["Overhead press (dumbbell)", "shoulders", "dumbbell", "weight_reps"],
  ["Overhead press (Smith machine)", "shoulders", "machine", "weight_reps"],
  ["Overhead squat", "full_body", "barbell", "weight_reps"],
  ["Overhead triceps extension (cable)", "triceps", "cable", "weight_reps"],
  ["Partial glute bridge (barbell)", "glutes", "barbell", "weight_reps"],
  ["Pause squat (barbell)", "quadriceps", "barbell", "weight_reps"],
  ["Pendlay row (barbell)", "upper_back", "barbell", "weight_reps"],
  ["Pendulum squat (machine)", "quadriceps", "machine", "weight_reps"],
  ["Pike pushup", "shoulders", "none", "bodyweight_reps"],
  ["Pinwheel curl (dumbbell)", "biceps", "dumbbell", "weight_reps"],
  ["Pistol squat", "quadriceps", "none", "bodyweight_reps"],
  ["Plank", "abdominals", "none", "duration"],
  ["Plank pushup", "chest", "none", "bodyweight_reps"],
  ["Plate curl", "biceps", "plate", "weight_reps"],
  ["Plate front raise", "shoulders", "plate", "weight_reps"],
  ["Plate press", "chest", "plate", "weight_reps"],
  ["Plate squeeze (Svend press)", "chest", "plate", "weight_reps"],
  ["Power clean", "full_body", "barbell", "weight_reps"],
  ["Power snatch", "full_body", "barbell", "weight_reps"],
  ["Preacher curl (barbell)", "biceps", "barbell", "weight_reps"],
  ["Preacher curl (dumbbell)", "biceps", "dumbbell", "weight_reps"],
  ["Preacher curl (machine)", "biceps", "machine", "weight_reps"],
  ["Press under", "full_body", "barbell", "weight_reps"],
  ["Pull up", "lats", "none", "bodyweight_reps"],
  ["Pull up (assisted)", "lats", "none", "assisted_bodyweight"],
  ["Pull up (band)", "lats", "band", "bodyweight_reps"],
  ["Pull up (weighted)", "lats", "none", "weighted_bodyweight"],
  ["Pullover (dumbbell)", "lats", "dumbbell", "weight_reps"],
  ["Pullover (machine)", "lats", "machine", "weight_reps"],
  ["Push press", "shoulders", "barbell", "weight_reps"],
  ["Push up", "chest", "none", "bodyweight_reps"],
  ["Push up (weighted)", "chest", "none", "weighted_bodyweight"],
  ["Push up - close grip", "chest", "none", "bodyweight_reps"],
  ["Rack pull", "upper_back", "barbell", "weight_reps"],
  ["Rear delt reverse fly (cable)", "shoulders", "cable", "weight_reps"],
  ["Rear delt reverse fly (dumbbell)", "shoulders", "dumbbell", "weight_reps"],
  ["Rear delt reverse fly (machine)", "shoulders", "machine", "weight_reps"],
  ["Rear kick (machine)", "glutes", "machine", "weight_reps"],
  ["Recumbent bike", "cardio", "machine", "distance_duration"],
  ["Renegade row (dumbbell)", "upper_back", "dumbbell", "weight_reps"],
  ["Reverse crunch", "abdominals", "none", "bodyweight_reps"],
  ["Reverse curl (barbell)", "biceps", "barbell", "weight_reps"],
  ["Reverse curl (cable)", "biceps", "cable", "weight_reps"],
  ["Reverse curl (dumbbell)", "biceps", "dumbbell", "weight_reps"],
  ["Reverse fly single arm (cable)", "shoulders", "cable", "weight_reps"],
  ["Reverse grip concentration curl", "biceps", "dumbbell", "weight_reps"],
  ["Reverse grip lat pulldown (cable)", "lats", "cable", "weight_reps"],
  ["Reverse grip triceps pushdown", "triceps", "cable", "weight_reps"],
  ["Reverse hyperextension", "glutes", "machine", "weight_reps"],
  ["Reverse lunge", "quadriceps", "none", "bodyweight_reps"],
  ["Reverse lunge (barbell)", "quadriceps", "barbell", "weight_reps"],
  ["Reverse lunge (dumbbell)", "quadriceps", "dumbbell", "weight_reps"],
  ["Reverse plank", "abdominals", "none", "duration"],
  ["Reverse wrist curl (dumbbell)", "forearms", "dumbbell", "weight_reps"],
  ["Ring dips", "chest", "none", "bodyweight_reps"],
  ["Ring pull up", "lats", "none", "bodyweight_reps"],
  ["Ring push up", "chest", "none", "bodyweight_reps"],
  ["Romanian deadlift (barbell)", "hamstrings", "barbell", "weight_reps"],
  ["Romanian deadlift (dumbbell)", "hamstrings", "dumbbell", "weight_reps"],
  ["Romanian deadlift (Smith machine)", "hamstrings", "machine", "weight_reps"],
  ["Rope cable curl", "biceps", "cable", "weight_reps"],
  ["Rope straight arm pulldown", "lats", "cable", "weight_reps"],
  ["Rowing machine", "cardio", "machine", "distance_duration"],
  ["Running", "cardio", "none", "distance_duration"],
  ["Russian twist (bodyweight)", "abdominals", "none", "bodyweight_reps"],
  ["Russian twist (weighted)", "abdominals", "none", "weight_reps"],
  ["Scapular pull ups", "upper_back", "none", "bodyweight_reps"],
  ["Seal row (barbell)", "upper_back", "barbell", "weight_reps"],
  ["Seal row (dumbbell)", "upper_back", "dumbbell", "weight_reps"],
  ["Seated cable row - bar grip", "upper_back", "cable", "weight_reps"],
  ["Seated cable row - bar wide grip", "upper_back", "cable", "weight_reps"],
  ["Seated cable row - V grip (cable)", "upper_back", "cable", "weight_reps"],
  ["Seated calf raise", "calves", "machine", "weight_reps"],
  ["Seated chest flys (cable)", "chest", "cable", "weight_reps"],
  ["Seated dip machine", "triceps", "machine", "weight_reps"],
  ["Seated incline curl (dumbbell)", "biceps", "dumbbell", "weight_reps"],
  [
    "Seated incline hammer curl (dumbbell)",
    "biceps",
    "dumbbell",
    "weight_reps",
  ],
  ["Seated lateral raise (dumbbell)", "shoulders", "dumbbell", "weight_reps"],
  ["Seated leg curl (machine)", "hamstrings", "machine", "weight_reps"],
  ["Seated overhead press (barbell)", "shoulders", "barbell", "weight_reps"],
  ["Seated overhead press (dumbbell)", "shoulders", "dumbbell", "weight_reps"],
  ["Seated palms up wrist curl", "forearms", "dumbbell", "weight_reps"],
  ["Seated row (machine)", "upper_back", "machine", "weight_reps"],
  ["Seated shoulder press (machine)", "shoulders", "machine", "weight_reps"],
  ["Seated triceps press", "triceps", "dumbbell", "weight_reps"],
  ["Seated wrist curl (barbell)", "forearms", "barbell", "weight_reps"],
  ["Seated wrist extension (barbell)", "forearms", "barbell", "weight_reps"],
  ["Shoulder press (dumbbell)", "shoulders", "dumbbell", "weight_reps"],
  ["Shoulder press (machine plates)", "shoulders", "machine", "weight_reps"],
  ["Shrug (barbell)", "traps", "barbell", "weight_reps"],
  ["Shrug (cable)", "traps", "cable", "weight_reps"],
  ["Shrug (dumbbell)", "traps", "dumbbell", "weight_reps"],
  ["Shrug (machine)", "traps", "machine", "weight_reps"],
  ["Shrug (Smith machine)", "traps", "machine", "weight_reps"],
  ["Side bend", "abdominals", "none", "bodyweight_reps"],
  ["Side bend (dumbbell)", "abdominals", "dumbbell", "weight_reps"],
  ["Side plank", "abdominals", "none", "duration"],
  ["Single arm cable crossover", "chest", "cable", "weight_reps"],
  ["Single arm cable row", "upper_back", "cable", "weight_reps"],
  ["Single arm curl (cable)", "biceps", "cable", "weight_reps"],
  [
    "Single arm landmine press (barbell)",
    "shoulders",
    "barbell",
    "weight_reps",
  ],
  ["Single arm lat pulldown", "lats", "cable", "weight_reps"],
  ["Single arm lateral raise (cable)", "shoulders", "cable", "weight_reps"],
  [
    "Single arm tricep extension (dumbbell)",
    "triceps",
    "dumbbell",
    "weight_reps",
  ],
  ["Single arm triceps pushdown (cable)", "triceps", "cable", "weight_reps"],
  ["Single leg extensions", "quadriceps", "machine", "weight_reps"],
  ["Single leg glute bridge", "glutes", "none", "bodyweight_reps"],
  ["Single leg hip thrust", "glutes", "none", "bodyweight_reps"],
  ["Single leg hip thrust (dumbbell)", "glutes", "dumbbell", "weight_reps"],
  ["Single leg press (machine)", "quadriceps", "machine", "weight_reps"],
  [
    "Single leg Romanian deadlift (barbell)",
    "hamstrings",
    "barbell",
    "weight_reps",
  ],
  [
    "Single leg Romanian deadlift (dumbbell)",
    "hamstrings",
    "dumbbell",
    "weight_reps",
  ],
  ["Single leg standing calf raise", "calves", "none", "bodyweight_reps"],
  [
    "Single leg standing calf raise (barbell)",
    "calves",
    "barbell",
    "weight_reps",
  ],
  [
    "Single leg standing calf raise (dumbbell)",
    "calves",
    "dumbbell",
    "weight_reps",
  ],
  [
    "Single leg standing calf raise (machine)",
    "calves",
    "machine",
    "weight_reps",
  ],
  ["Sit up", "abdominals", "none", "bodyweight_reps"],
  ["Ski erg", "cardio", "machine", "distance_duration"],
  ["Skiing", "cardio", "none", "duration"],
  ["Skullcrusher (barbell)", "triceps", "barbell", "weight_reps"],
  ["Skullcrusher (dumbbell)", "triceps", "dumbbell", "weight_reps"],
  ["Sled pull", "full_body", "other", "weight_distance"],
  ["Sled push", "full_body", "other", "weight_distance"],
  ["Snatch", "full_body", "barbell", "weight_reps"],
  ["Snowboarding", "cardio", "none", "duration"],
  ["Spider curl (barbell)", "biceps", "barbell", "weight_reps"],
  ["Spider curl (dumbbell)", "biceps", "dumbbell", "weight_reps"],
  ["Spiderman", "abdominals", "none", "bodyweight_reps"],
  ["Spinning", "cardio", "machine", "distance_duration"],
  ["Split jerk", "full_body", "barbell", "weight_reps"],
  ["Split squat (dumbbell)", "quadriceps", "dumbbell", "weight_reps"],
  ["Sprints", "cardio", "none", "distance_duration"],
  ["Squat (band)", "quadriceps", "band", "bodyweight_reps"],
  ["Squat (barbell)", "quadriceps", "barbell", "weight_reps"],
  ["Squat (bodyweight)", "quadriceps", "none", "bodyweight_reps"],
  ["Squat (dumbbell)", "quadriceps", "dumbbell", "weight_reps"],
  ["Squat (machine)", "quadriceps", "machine", "weight_reps"],
  ["Squat (Smith machine)", "quadriceps", "machine", "weight_reps"],
  ["Squat (suspension)", "quadriceps", "suspension", "bodyweight_reps"],
  ["Squat row", "full_body", "cable", "weight_reps"],
  ["Stair machine (steps)", "cardio", "machine", "duration"],
  ["Standing cable glute kickbacks", "glutes", "cable", "weight_reps"],
  ["Standing calf raise", "calves", "none", "bodyweight_reps"],
  ["Standing calf raise (barbell)", "calves", "barbell", "weight_reps"],
  ["Standing calf raise (dumbbell)", "calves", "dumbbell", "weight_reps"],
  ["Standing calf raise (machine)", "calves", "machine", "weight_reps"],
  ["Standing calf raise (Smith)", "calves", "machine", "weight_reps"],
  ["Standing leg curls", "hamstrings", "machine", "weight_reps"],
  ["Standing military press (barbell)", "shoulders", "barbell", "weight_reps"],
  ["Standing Y raise (cable)", "shoulders", "cable", "weight_reps"],
  ["Step up", "quadriceps", "none", "bodyweight_reps"],
  ["Sternum pull up (Gironda)", "lats", "none", "bodyweight_reps"],
  ["Straight arm lat pulldown (cable)", "lats", "cable", "weight_reps"],
  ["Straight leg deadlift", "hamstrings", "barbell", "weight_reps"],
  ["Stretching", "other", "none", "duration"],
  ["Suitcase carry (dumbbell)", "full_body", "dumbbell", "weight_distance"],
  ["Sumo deadlift", "glutes", "barbell", "weight_reps"],
  ["Sumo squat", "quadriceps", "none", "bodyweight_reps"],
  ["Sumo squat (barbell)", "quadriceps", "barbell", "weight_reps"],
  ["Sumo squat (dumbbell)", "quadriceps", "dumbbell", "weight_reps"],
  ["Sumo squat (kettlebell)", "quadriceps", "kettlebell", "weight_reps"],
  ["Superman", "lower_back", "none", "bodyweight_reps"],
  ["Swimming", "cardio", "none", "distance_duration"],
  ["T bar row", "upper_back", "barbell", "weight_reps"],
  ["Thruster (barbell)", "full_body", "barbell", "weight_reps"],
  ["Thruster (kettlebell)", "full_body", "kettlebell", "weight_reps"],
  ["Toe touch", "abdominals", "none", "bodyweight_reps"],
  ["Toes to bar", "abdominals", "none", "bodyweight_reps"],
  ["Torso rotation", "abdominals", "machine", "weight_reps"],
  ["Treadmill", "cardio", "machine", "distance_duration"],
  ["Triceps dip (assisted)", "triceps", "none", "assisted_bodyweight"],
  ["Triceps dip (weighted)", "triceps", "none", "weighted_bodyweight"],
  ["Triceps extension (barbell)", "triceps", "barbell", "weight_reps"],
  ["Triceps extension (cable)", "triceps", "cable", "weight_reps"],
  ["Triceps extension (dumbbell)", "triceps", "dumbbell", "weight_reps"],
  ["Triceps extension (machine)", "triceps", "machine", "weight_reps"],
  [
    "Triceps extension (suspension)",
    "triceps",
    "suspension",
    "bodyweight_reps",
  ],
  ["Triceps kickback (cable)", "triceps", "cable", "weight_reps"],
  ["Triceps kickback (dumbbell)", "triceps", "dumbbell", "weight_reps"],
  ["Triceps pressdown", "triceps", "cable", "weight_reps"],
  ["Triceps pushdown (band)", "triceps", "band", "bodyweight_reps"],
  ["Triceps pushdown", "triceps", "cable", "weight_reps"],
  ["Triceps rope pushdown", "triceps", "cable", "weight_reps"],
  ["Upright row (barbell)", "shoulders", "barbell", "weight_reps"],
  ["Upright row (cable)", "shoulders", "cable", "weight_reps"],
  ["Upright row (dumbbell)", "shoulders", "dumbbell", "weight_reps"],
  ["V up", "abdominals", "none", "bodyweight_reps"],
  ["Vertical traction (machine)", "lats", "machine", "weight_reps"],
  ["Waiter curl (dumbbell)", "biceps", "dumbbell", "weight_reps"],
  ["Walking", "cardio", "none", "distance_duration"],
  ["Walking lunge", "quadriceps", "none", "bodyweight_reps"],
  ["Walking lunge (dumbbell)", "quadriceps", "dumbbell", "weight_reps"],
  ["Walking lunge (sandbag)", "quadriceps", "other", "bodyweight_reps"],
  ["Wall ball", "full_body", "other", "weight_reps"],
  ["Wall sit", "quadriceps", "none", "duration"],
  ["Warm up", "full_body", "none", "duration"],
  ["Wide pull up", "lats", "none", "bodyweight_reps"],
  ["Wide-elbow triceps press (dumbbell)", "triceps", "dumbbell", "weight_reps"],
  ["Wrist roller", "forearms", "other", "weight_reps"],
  ["Yoga", "full_body", "none", "duration"],
  ["Zercher squat", "quadriceps", "barbell", "weight_reps"],
  ["Zottman curl (dumbbell)", "biceps", "dumbbell", "weight_reps"],
];

export const LIBRARY: Exercise[] = ROWS.map(
  ([name, muscle, equipment, type]) => ({
    name,
    muscle,
    equipment,
    type,
  }),
);

// Custom exercises live in the app's store; it registers them here so plain helpers (set labels,
// workout set-up) know their type and muscle too.
let custom: Exercise[] = [];
export const registerCustomExercises = (list: Exercise[]) => {
  custom = list;
};

const byName = new Map(LIBRARY.map((e) => [e.name.toLowerCase(), e]));

/** Names used before the library existed, mapped to library names (saved plans and history). */
export const LEGACY_NAMES: Record<string, string> = {
  "Back squat": "Squat (barbell)",
  "Band chest press": "Chest press (band)",
  "Band pulldown": "Lat pulldown (band)",
  "Band row": "Bent over row (band)",
  "Band triceps pushdown": "Triceps pushdown (band)",
  "Barbell curl": "Bicep curl (barbell)",
  "Bench press": "Bench press (barbell)",
  "Box squat": "Squat (bodyweight)",
  "Brisk walk": "Walking",
  "Cable fly": "Cable fly crossovers",
  "Calf raise": "Standing calf raise",
  Deadlift: "Deadlift (barbell)",
  "Dumbbell bench press": "Bench press (dumbbell)",
  "Dumbbell curl": "Bicep curl (dumbbell)",
  "Dumbbell shoulder press": "Shoulder press (dumbbell)",
  "Hammer curl": "Hammer curl (dumbbell)",
  "Hip thrust": "Hip thrust (barbell)",
  "Incline dumbbell press": "Incline bench press (dumbbell)",
  "Lat pulldown": "Lat pulldown (cable)",
  "Lateral raise": "Lateral raise (dumbbell)",
  "Leg curl": "Lying leg curl (machine)",
  "Leg press": "Leg press (machine)",
  "One-arm dumbbell row": "Dumbbell row",
  "Overhead press": "Overhead press (barbell)",
  "Pike push-up": "Pike pushup",
  "Pull-up": "Pull up",
  "Push-up": "Push up",
  "Romanian deadlift": "Romanian deadlift (barbell)",
  "Seated cable row": "Seated cable row - bar grip",
  "Step-up": "Step up",
  "Table row": "Inverted row",
};

/** Rename old exercise names inside saved JSON (plans, history, a workout in progress). */
export function migrateNames(json: string) {
  let out = json;
  for (const [from, to] of Object.entries(LEGACY_NAMES))
    out = out
      .split(`"name":"${from}"`)
      .join(`"name":"${to}"`)
      .split(`"swappedFrom":"${from}"`)
      .join(`"swappedFrom":"${to}"`);
  return out;
}

export function findExercise(name: string): Exercise | undefined {
  const key = name.toLowerCase();
  return custom.find((e) => e.name.toLowerCase() === key) ?? byName.get(key);
}

/** Type of an exercise; unknown names (older logs) fall back to weight and reps. */
export const typeOf = (name: string): ExerciseType =>
  findExercise(name)?.type ?? "weight_reps";

export const muscleOf = (name: string) => {
  const e = findExercise(name);
  return e ? MUSCLE_LABEL[e.muscle] : "Other";
};

export function filterExercises(
  list: Exercise[],
  q: string,
  equipment: Equipment | null,
  muscle: Muscle | null,
) {
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return list.filter(
    (e) =>
      (!equipment || e.equipment === equipment) &&
      (!muscle || e.muscle === muscle || e.other?.includes(muscle)) &&
      words.every((w) =>
        `${e.name} ${MUSCLE_LABEL[e.muscle]}`.toLowerCase().includes(w),
      ),
  );
}

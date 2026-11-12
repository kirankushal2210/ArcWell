// Gyms directory (G-01, G-02; D25, D29): read-only listing with name, area, equipment and hours.
// Sample data only: the real directory comes from a licensed data source (PLAN.md blocker), so these
// are made-up gyms with clearly sample names.

export type Gym = {
  id: string;
  name: string;
  area: string;
  city: string;
  km: number;
  equipment: string[];
  hours: string;
  dayPass?: string;
  women?: boolean;
};

export const GYM_TAGS = [
  "Barbells and racks",
  "Dumbbells to 40 kg",
  "Machines",
  "Cardio",
  "Turf",
  "Pool",
] as const;

export const SAMPLE_GYMS: Gym[] = [
  {
    id: "g1",
    name: "Sample Strength Club",
    area: "Indiranagar",
    city: "Bengaluru",
    km: 1.2,
    equipment: [
      "Barbells and racks",
      "Dumbbells to 40 kg",
      "Machines",
      "Cardio",
    ],
    hours: "5:30 am – 10:30 pm",
    dayPass: "₹400",
  },
  {
    id: "g2",
    name: "Sample Fitness Studio",
    area: "Koramangala",
    city: "Bengaluru",
    km: 2.8,
    equipment: ["Dumbbells to 40 kg", "Machines", "Cardio", "Turf"],
    hours: "6 am – 10 pm",
    dayPass: "₹300",
    women: true,
  },
  {
    id: "g3",
    name: "Sample Barbell House",
    area: "HSR Layout",
    city: "Bengaluru",
    km: 4.1,
    equipment: ["Barbells and racks", "Dumbbells to 40 kg", "Turf"],
    hours: "6 am – 9 pm",
  },
  {
    id: "g4",
    name: "Sample Community Gym",
    area: "Jayanagar",
    city: "Bengaluru",
    km: 5.6,
    equipment: ["Machines", "Cardio"],
    hours: "5 am – 11 pm",
    dayPass: "₹150",
  },
  {
    id: "g5",
    name: "Sample Sports Centre",
    area: "Whitefield",
    city: "Bengaluru",
    km: 9.3,
    equipment: ["Barbells and racks", "Machines", "Cardio", "Pool"],
    hours: "6 am – 10 pm",
    dayPass: "₹500",
  },
];

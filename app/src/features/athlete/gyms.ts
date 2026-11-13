// Gyms directory (G-01, G-02; D25, D29): read-only listing with name, area, equipment and hours.
// Sample data only: the real directory comes from a licensed data source (PLAN.md blocker), so these
// are made-up gyms with clearly sample names. Maps open in the phone's own maps app by a search
// query, so no map SDK or API key is needed.
import { Linking, Platform } from "react-native";

export type Gym = {
  id: string;
  name: string;
  area: string;
  city: string;
  km: number;
  /** Direction from you in degrees, clockwise from north (sample, for the "around you" map). */
  bearing: number;
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
    bearing: 35,
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
    bearing: 165,
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
    bearing: 200,
    name: "Sample Barbell House",
    area: "HSR Layout",
    city: "Bengaluru",
    km: 4.1,
    equipment: ["Barbells and racks", "Dumbbells to 40 kg", "Turf"],
    hours: "6 am – 9 pm",
  },
  {
    id: "g4",
    bearing: 245,
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
    bearing: 80,
    name: "Sample Sports Centre",
    area: "Whitefield",
    city: "Bengaluru",
    km: 9.3,
    equipment: ["Barbells and racks", "Machines", "Cardio", "Pool"],
    hours: "6 am – 10 pm",
    dayPass: "₹500",
  },
];

/** What the maps app searches for. Sample gyms have made-up names, so it searches the area. */
const mapsQuery = (g: Gym) => `${g.area}, ${g.city}`;

/** The phone's maps app on Android (geo:), Google Maps on the web or iPhone. No API key. */
export function openInMaps(g: Gym) {
  const q = encodeURIComponent(mapsQuery(g));
  const web = `https://www.google.com/maps/search/?api=1&query=${q}`;
  if (Platform.OS !== "android") return Linking.openURL(web).catch(() => {});
  return Linking.openURL(`geo:0,0?q=${q}`).catch(() =>
    Linking.openURL(web).catch(() => {}),
  );
}

// Create a custom exercise (F4-08): a photo, name, equipment, primary muscle, other muscles and the
// exercise type, which decides what each set logs. Each choice opens its own list inside the form,
// so it works the same inside a picker sheet and on its own page.
import * as ImagePicker from "expo-image-picker";
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronRight,
  Search,
} from "lucide-react-native";
import { useState } from "react";
import { Image, ScrollView, StyleSheet, TextInput, View } from "react-native";

import {
  Button,
  IconButton,
  PressableScale,
  Text,
} from "@/components/primitives";
import { useCoachData } from "@/features/coach/CoachData";
import { alert } from "@/lib/alert";
import {
  colors,
  fontFamilyFor,
  radius,
  rhythm,
  space,
  textSizes,
} from "@/theme";

import {
  EQUIPMENT,
  EQUIPMENT_LABEL,
  type Equipment,
  type Exercise,
  EXERCISE_TYPES,
  type ExerciseType,
  findExercise,
  MUSCLE_GROUPS,
  MUSCLE_LABEL,
  type Muscle,
  typeLabel,
} from "./library";
import { Sheet, SheetRow } from "./Sheet";

type Choosing = "equipment" | "muscle" | "other" | "type" | null;
const FIELD_LABEL = { kg: "kg", reps: "reps", seconds: "time", km: "distance" };

function Field({
  label,
  value,
  placeholder,
  error,
  onPress,
}: {
  label: string;
  value?: string;
  placeholder: string;
  error?: boolean;
  onPress: () => void;
}) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value ?? placeholder}`}
      style={styles.field}
    >
      <View style={styles.flex}>
        <Text weight="medium">{label}</Text>
        <Text
          variant="label"
          weight="regular"
          tone={value ? "default" : error ? "danger" : "muted"}
        >
          {value ?? (error ? "Choose one" : placeholder)}
        </Text>
      </View>
      <ChevronRight size={18} color={colors.textMuted} />
    </PressableScale>
  );
}

function Choice({
  label,
  sub,
  on,
  onPress,
}: {
  label: string;
  sub?: string;
  on: boolean;
  onPress: () => void;
}) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      style={styles.choice}
    >
      <View style={styles.flex}>
        <Text weight="medium">{label}</Text>
        {sub ? (
          <Text variant="label" weight="regular" tone="muted">
            {sub}
          </Text>
        ) : null}
      </View>
      {on ? <Check size={20} strokeWidth={2.5} color={colors.text} /> : null}
    </PressableScale>
  );
}

export function CreateExercise({
  initialName = "",
  onSaved,
  onCancel,
}: {
  initialName?: string;
  onSaved: (e: Exercise) => void;
  onCancel: () => void;
}) {
  const { addCustomExercise } = useCoachData();
  const [name, setName] = useState(initialName);
  const [image, setImage] = useState<string | undefined>();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [muscle, setMuscle] = useState<Muscle | null>(null);
  const [other, setOther] = useState<Muscle[]>([]);
  const [type, setType] = useState<ExerciseType | null>(null);
  const [choosing, setChoosing] = useState<Choosing>(null);
  const [muscleQ, setMuscleQ] = useState("");
  const [tried, setTried] = useState(false);
  const [photoSheet, setPhotoSheet] = useState(false);

  const clash = findExercise(name.trim());
  const nameError = tried && (!name.trim() || !!clash);

  const pick = async (camera: boolean) => {
    setPhotoSheet(false);
    const perm = camera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      alert(
        camera ? "Camera is off for Arcwell" : "Photos are off for Arcwell",
        "You can turn access on in Settings.",
      );
      return;
    }
    const opts: ImagePicker.ImagePickerOptions = {
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    };
    const res = camera
      ? await ImagePicker.launchCameraAsync(opts)
      : await ImagePicker.launchImageLibraryAsync(opts);
    if (!res.canceled && res.assets[0]) setImage(res.assets[0].uri);
  };

  const save = () => {
    setTried(true);
    if (!name.trim() || clash || !equipment || !muscle || !type) return;
    const e: Exercise = {
      name: name.trim(),
      muscle,
      equipment,
      type,
      other: other.filter((m) => m !== muscle),
      custom: true,
      image,
    };
    addCustomExercise(e);
    onSaved(e);
  };

  if (choosing) {
    const words = muscleQ.trim().toLowerCase();
    const title =
      choosing === "equipment"
        ? "Equipment"
        : choosing === "muscle"
          ? "Primary muscle"
          : choosing === "other"
            ? "Other muscles"
            : "Exercise type";
    return (
      <View style={styles.root}>
        <View style={styles.head}>
          <IconButton
            icon={ArrowLeft}
            accessibilityLabel="Back"
            onPress={() => setChoosing(null)}
          />
          <Text variant="heading" style={styles.flex}>
            {title}
          </Text>
          {choosing === "other" ? (
            <Button
              label="Done"
              variant="ghost"
              onPress={() => setChoosing(null)}
            />
          ) : null}
        </View>
        {choosing === "muscle" || choosing === "other" ? (
          <View style={styles.search}>
            <Search size={18} color={colors.textMuted} />
            <TextInput
              value={muscleQ}
              onChangeText={setMuscleQ}
              placeholder="Search muscles"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              accessibilityLabel="Search muscles"
            />
          </View>
        ) : null}
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
        >
          {choosing === "equipment"
            ? EQUIPMENT.map((q) => (
                <Choice
                  key={q}
                  label={EQUIPMENT_LABEL[q]}
                  on={equipment === q}
                  onPress={() => {
                    setEquipment(q);
                    setChoosing(null);
                  }}
                />
              ))
            : null}
          {choosing === "type"
            ? EXERCISE_TYPES.map((t) => (
                <Choice
                  key={t.value}
                  label={t.label}
                  sub={`${t.example} · logs ${t.fields.map((f) => FIELD_LABEL[f]).join(" and ")}`}
                  on={type === t.value}
                  onPress={() => {
                    setType(t.value);
                    setChoosing(null);
                  }}
                />
              ))
            : null}
          {choosing === "muscle" || choosing === "other"
            ? MUSCLE_GROUPS.map((g) => {
                const list = g.muscles.filter(
                  (m) =>
                    MUSCLE_LABEL[m].toLowerCase().includes(words) &&
                    (choosing === "muscle" || m !== muscle),
                );
                if (!list.length) return null;
                return (
                  <View key={g.title} style={styles.group}>
                    <Text variant="label" tone="muted">
                      {g.title}
                    </Text>
                    {list.map((m) => (
                      <Choice
                        key={m}
                        label={MUSCLE_LABEL[m]}
                        on={
                          choosing === "muscle"
                            ? muscle === m
                            : other.includes(m)
                        }
                        onPress={() => {
                          if (choosing === "muscle") {
                            setMuscle(m);
                            setOther((o) => o.filter((x) => x !== m));
                            setMuscleQ("");
                            setChoosing(null);
                          } else
                            setOther((o) =>
                              o.includes(m)
                                ? o.filter((x) => x !== m)
                                : [...o, m],
                            );
                        }}
                      />
                    ))}
                  </View>
                );
              })
            : null}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.head}>
        <IconButton
          icon={ArrowLeft}
          accessibilityLabel="Back"
          onPress={onCancel}
        />
        <Text variant="heading" style={styles.flex}>
          New exercise
        </Text>
        <Button label="Save" onPress={save} />
      </View>
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        <PressableScale
          onPress={() => setPhotoSheet(true)}
          accessibilityRole="button"
          accessibilityLabel={image ? "Change photo" : "Add a photo"}
          style={styles.photoWrap}
        >
          {image ? (
            <Image source={{ uri: image }} style={styles.photo} />
          ) : (
            <View style={[styles.photo, styles.photoEmpty]}>
              <Camera size={28} color={colors.textMuted} />
            </View>
          )}
          <Text variant="label" weight="medium">
            {image ? "Change photo" : "Add a photo"}
          </Text>
        </PressableScale>

        <View style={styles.flex}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Exercise name"
            placeholderTextColor={colors.textMuted}
            style={[styles.name, nameError && styles.nameError]}
            autoFocus={!initialName}
            accessibilityLabel="Exercise name"
          />
          {nameError ? (
            <Text variant="label" weight="regular" tone="danger">
              {clash
                ? `${clash.name} is already in the library.`
                : "Give it a name."}
            </Text>
          ) : null}
        </View>

        <View style={styles.card}>
          <Field
            label="Equipment"
            value={equipment ? EQUIPMENT_LABEL[equipment] : undefined}
            placeholder="Choose"
            error={tried && !equipment}
            onPress={() => setChoosing("equipment")}
          />
          <Field
            label="Primary muscle"
            value={muscle ? MUSCLE_LABEL[muscle] : undefined}
            placeholder="Choose"
            error={tried && !muscle}
            onPress={() => setChoosing("muscle")}
          />
          <Field
            label="Other muscles"
            value={
              other.length
                ? other.map((m) => MUSCLE_LABEL[m]).join(", ")
                : undefined
            }
            placeholder="Optional"
            onPress={() => setChoosing("other")}
          />
          <Field
            label="Exercise type"
            value={type ? typeLabel(type) : undefined}
            placeholder="What each set logs"
            error={tried && !type}
            onPress={() => setChoosing("type")}
          />
        </View>
        <Text variant="caption" tone="muted">
          Exercises you make show under Your exercises, with the library.
        </Text>
      </ScrollView>

      <Sheet
        visible={photoSheet}
        onClose={() => setPhotoSheet(false)}
        title="Photo"
        sub="A picture of the machine or the setup helps you find it later."
      >
        <SheetRow label="Take a photo" onPress={() => pick(true)} />
        <SheetRow label="Choose from your photos" onPress={() => pick(false)} />
        {image ? (
          <SheetRow
            label="Remove photo"
            tone="danger"
            onPress={() => {
              setImage(undefined);
              setPhotoSheet(false);
            }}
          />
        ) : null}
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, gap: space[1] / 2 },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    paddingHorizontal: space[2],
    paddingBottom: space[2],
  },
  body: { padding: rhythm.gutter, gap: space[4], paddingBottom: space[12] },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    minHeight: 48,
    marginHorizontal: rhythm.gutter,
    paddingHorizontal: space[3],
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
  },
  input: {
    flex: 1,
    fontFamily: fontFamilyFor("regular"),
    fontSize: textSizes.base,
    color: colors.text,
  },
  photoWrap: { alignSelf: "center", alignItems: "center", gap: space[2] },
  photo: { width: 96, height: 96, borderRadius: radius.full },
  photoEmpty: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceRaised,
  },
  name: {
    minHeight: 52,
    paddingHorizontal: space[3],
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    fontFamily: fontFamilyFor("semibold"),
    fontSize: textSizes.lg,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nameError: { borderColor: colors.danger },
  card: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    minHeight: 64,
    paddingHorizontal: space[4],
    paddingVertical: space[2],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  group: { gap: space[1] },
  choice: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    minHeight: 56,
    paddingHorizontal: space[4],
    paddingVertical: space[2],
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
});

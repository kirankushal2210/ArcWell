// dev/gallery: every Phase 2 primitive and feedback component in each state, plus S-03 (form validation).
import {
  ArrowLeft,
  Bell,
  Dumbbell,
  Play,
  Search,
  Trash2,
} from "lucide-react-native";
import { router } from "expo-router";
import { useState, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import {
  Banner,
  EmptyState,
  ErrorState,
  Skeleton,
  SkeletonGroup,
} from "@/components/feedback";
import {
  Avatar,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  ListRow,
  NumberStepper,
  Screen,
  SectionHeader,
  StatusChip,
  Text,
  TextField,
} from "@/components/primitives";
import { rhythm, space } from "@/theme";

export default function GalleryScreen() {
  return (
    <Screen gap={rhythm.section} testID="dev-gallery">
      <View style={styles.head}>
        <IconButton
          icon={ArrowLeft}
          accessibilityLabel="Back"
          onPress={() => router.back()}
        />
        <Text variant="eyebrow" tone="muted">
          Dev · Phase 2
        </Text>
        <Text variant="display">Component gallery</Text>
        <Text tone="muted">
          Draft, not approved or user-tested. Built from DESIGN.md §6 and the
          spec sheet.
        </Text>
      </View>

      <Group title="Buttons">
        <Button label="Start workout" icon={Play} fullWidth onPress={noop} />
        <Button label="Log food" variant="secondary" fullWidth onPress={noop} />
        <Button label="Not now" variant="ghost" fullWidth onPress={noop} />
        <Button
          label="Delete my account"
          variant="destructive"
          icon={Trash2}
          fullWidth
          onPress={noop}
        />
        <Button label="Save" disabled fullWidth />
        <Button label="Save" loading loadingLabel="Saving…" fullWidth />
        <View style={styles.row}>
          <Button label="Send reminder" variant="secondary" onPress={noop} />
          <IconButton
            icon={Bell}
            accessibilityLabel="Notifications"
            variant="outline"
            onPress={noop}
          />
          <IconButton
            icon={Search}
            accessibilityLabel="Search"
            onPress={noop}
          />
          <IconButton
            icon={Search}
            accessibilityLabel="Search (disabled)"
            disabled
          />
        </View>
      </Group>

      <Group title="Text fields">
        <TextField label="Name" defaultValue="Venkatalakshmi Subramanian" />
        <TextField
          label="Body weight"
          placeholder="e.g. 73.8"
          unit="kg"
          keyboardType="decimal-pad"
          helper="Weigh in the morning, before food"
        />
        <TextField
          label="Password"
          defaultValue="1234"
          secureTextEntry
          error="Use at least 8 characters"
        />
        <TextField
          leadingIcon={Search}
          placeholder="Search foods, e.g. dal tadka"
          accessibilityLabel="Search foods"
        />
      </Group>

      <Group title="S-03 · Form validation">
        <SignUpForm />
      </Group>

      <Group title="Number stepper">
        <Stepper />
      </Group>

      <Group title="Chips">
        <PortionChips />
        <View style={styles.wrap}>
          <StatusChip status="active" />
          <StatusChip status="paused" />
          <StatusChip status="leaving" />
          <StatusChip status="completed" />
        </View>
      </Group>

      <Group title="Card, list rows, section header">
        <Card gap={rhythm.cardPad}>
          <SectionHeader
            title="Check-ins"
            pillar="training"
            actionLabel="See all"
            onAction={noop}
          />
          <View>
            <ListRow
              leading={<Avatar name="Priya Sharma" />}
              title="Priya Sharma"
              subtitle="−0.6 kg · 4/4 workouts · 1 question"
              trailing="2 h ago"
              onPress={noop}
            />
            <ListRow
              leading={<Avatar name="Rahul Verma" />}
              title="Rahul Verma"
              subtitle={'+0.2 kg · 2/4 workouts · "knee sore"'}
              trailing="5 h ago"
              onPress={noop}
            />
            <ListRow
              leading={<Avatar name="Venkatalakshmi Subramanian" />}
              title="Venkatalakshmi Subramanian"
              subtitle="No change · 3/3 workouts"
              trailing="Yesterday"
              onPress={noop}
              last
            />
          </View>
        </Card>
        <Card level="surface" gap={rhythm.inGroup}>
          <SectionHeader title="Nutrition" pillar="nutrition" />
          <Text variant="title" numeric>
            1,910 kcal
          </Text>
          <Divider />
          <Text variant="caption" tone="muted">
            A raised card nests inside a surface card:
          </Text>
          <Card level="raised">
            <Text variant="label">Raised · one step up</Text>
          </Card>
        </Card>
      </Group>

      <Group title="Loading · skeleton">
        <SkeletonGroup label="Loading check-ins">
          <Skeleton width="40%" height={20} />
          <Skeleton height={96} shape="card" />
          <Skeleton height={56} shape="card" />
          <Skeleton height={56} shape="card" />
        </SkeletonGroup>
      </Group>

      <Group title="Empty">
        <Card>
          <EmptyState
            icon={Dumbbell}
            title="No workouts yet"
            body="Finished workouts show up here, grouped by week."
            actionLabel="Start today's workout"
            onAction={noop}
          />
        </Card>
      </Group>

      <Group title="Error and banners">
        <ErrorState
          message="Couldn't load your food log. Your entries are safe."
          onRetry={noop}
        />
        <Banner tone="offline" message="Saved on your phone — will sync" />
        <Banner
          tone="warning"
          message="Priya is leaving on 30 Nov. Everything continues until then."
        />
        <Banner message="Check-ins are paused while this client is paused." />
      </Group>
    </Screen>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.group}>
      <Text variant="title" accessibilityRole="header">
        {title}
      </Text>
      <View style={styles.items}>{children}</View>
    </View>
  );
}

/** S-03: checked when leaving a field and on submit; the message sits under the field and says how to fix it. */
function SignUpForm() {
  const [values, setValues] = useState({
    name: "Priya",
    email: "priya@gmail",
    password: "1234",
  });
  const [touched, setTouched] = useState<Record<keyof typeof values, boolean>>({
    name: false,
    email: false,
    password: false,
  });
  const [done, setDone] = useState(false);

  const errors = {
    name: values.name.trim() ? undefined : "Enter your name",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)
      ? undefined
      : "Enter a full email, like name@example.com",
    password:
      values.password.length >= 8 ? undefined : "Use at least 8 characters",
  };
  const show = (k: keyof typeof values) => (touched[k] ? errors[k] : undefined);
  const field = (k: keyof typeof values) => ({
    value: values[k],
    onChangeText: (t: string) => {
      setValues((v) => ({ ...v, [k]: t }));
      setDone(false);
    },
    onBlur: () => setTouched((t) => ({ ...t, [k]: true })),
    error: show(k),
  });

  return (
    <View style={styles.items}>
      <TextField label="Name" autoComplete="name" {...field("name")} />
      <TextField
        label="Email"
        autoComplete="email"
        keyboardType="email-address"
        autoCapitalize="none"
        {...field("email")}
      />
      <TextField
        label="Password"
        autoComplete="new-password"
        secureTextEntry
        {...field("password")}
      />
      <Button
        label="Create account"
        fullWidth
        onPress={() => {
          setTouched({ name: true, email: true, password: true });
          setDone(!errors.name && !errors.email && !errors.password);
        }}
      />
      {done && (
        <Banner message="All fields valid (gallery only, nothing is sent)." />
      )}
    </View>
  );
}

function Stepper() {
  const [kg, setKg] = useState(72.5);
  const [reps, setReps] = useState(8);
  return (
    <View style={styles.items}>
      <NumberStepper
        value={kg}
        onChange={setKg}
        step={2.5}
        decimals={1}
        unit="kg"
        accessibilityLabel="Weight"
      />
      <NumberStepper
        value={reps}
        onChange={setReps}
        min={0}
        max={100}
        unit="reps"
        accessibilityLabel="Reps"
      />
    </View>
  );
}

function PortionChips() {
  const portions = ["½", "1 katori", "1½", "2", "grams"];
  const [portion, setPortion] = useState("1 katori");
  const [filter, setFilter] = useState("Needs attention");
  const filters: [string, number][] = [
    ["Needs attention", 4],
    ["Active", 28],
    ["Paused", 3],
  ];
  return (
    <>
      <View style={styles.wrap}>
        {portions.map((p) => (
          <Chip
            key={p}
            label={p}
            selected={portion === p}
            onPress={() => setPortion(p)}
          />
        ))}
      </View>
      <View style={styles.wrap}>
        {filters.map(([f, n]) => (
          <Chip
            key={f}
            label={f}
            count={n}
            selected={filter === f}
            onPress={() => setFilter(f)}
          />
        ))}
      </View>
    </>
  );
}

const noop = () => {};

const styles = StyleSheet.create({
  head: { gap: space[2] },
  group: { gap: rhythm.cardPad },
  items: { gap: space[3] },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: rhythm.inline,
  },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: rhythm.inline },
});

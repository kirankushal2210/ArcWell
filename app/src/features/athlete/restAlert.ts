// Rest alert (F4-04): a local notification at the end of rest, so it reaches the athlete with the
// screen off or the app in the background. While the app is open the workout screen vibrates
// instead, so the notification stays silent in the foreground. The ongoing Android notification
// with a live countdown (F4-10) needs a foreground service in a development build.
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: false,
    shouldShowList: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

let scheduled: string | null = null;
let asked = false;

export async function cancelRestAlert() {
  const id = scheduled;
  scheduled = null;
  if (id)
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
}

export async function scheduleRestAlert(seconds: number, next: string) {
  await cancelRestAlert();
  if (seconds < 1) return;
  try {
    let perm = await Notifications.getPermissionsAsync();
    if (!perm.granted && !asked) {
      asked = true;
      perm = await Notifications.requestPermissionsAsync();
    }
    if (!perm.granted) return;
    scheduled = await Notifications.scheduleNotificationAsync({
      content: { title: "Rest over", body: `Next: ${next}`, sound: true },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.round(seconds),
      },
    });
  } catch {
    // Notifications unavailable (e.g. permission denied): the in-app timer still vibrates.
  }
}

// Google Play links (D19): subscriptions and refunds are managed in Google Play, never by Arcwell.
import { Linking } from "react-native";

export const ANDROID_PACKAGE = "com.arcwell.app";

/** Opens Google Play's subscription page for Arcwell (works on the web preview too). */
export const openPlaySubscriptions = () =>
  Linking.openURL(
    `https://play.google.com/store/account/subscriptions?package=${ANDROID_PACKAGE}`,
  ).catch(() => {});

/** Arcwell's store listing, for "Update in the Play Store". */
export const openPlayListing = () =>
  Linking.openURL(`market://details?id=${ANDROID_PACKAGE}`).catch(() =>
    Linking.openURL(
      `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`,
    ).catch(() => {}),
  );

/** Tools only for sample and development builds (preview states, reset this phone). */
export const SAMPLE_TOOLS = __DEV__;

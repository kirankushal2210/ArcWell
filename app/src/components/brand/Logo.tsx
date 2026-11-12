// Arcwell logo mark: the pull-up figure (D51). One white master PNG, tinted per use,
// so it follows the theme instead of baking a colour into the file.
import { Image, type ImageStyle, type StyleProp } from "react-native";

import { colors, type ColorRole } from "@/theme";

const mark = require("../../../assets/brand/arcwell-mark.png");
/** Width over height of the trimmed artwork (1034 × 1219). */
const ASPECT = 1034 / 1219;

export type LogoProps = {
  /** Height in dp; width follows the artwork. */
  size?: number;
  tone?: ColorRole;
  style?: StyleProp<ImageStyle>;
};

export function Logo({ size = 32, tone = "text", style }: LogoProps) {
  return (
    <Image
      source={mark}
      accessibilityIgnoresInvertColors
      style={[
        {
          height: size,
          width: Math.round(size * ASPECT),
          tintColor: colors[tone],
        },
        style,
      ]}
    />
  );
}

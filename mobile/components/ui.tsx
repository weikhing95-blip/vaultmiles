// Canonical UI primitives (P1) — token-pure, mirrors src/components/ui.jsx.
// RN-correct shapes. ProgressRing is web-only (needs react-native-svg); mobile
// uses ProgressBar. Every value comes from T.* tokens (constants/theme.ts).
import { useEffect, useRef, type ReactNode } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Animated,
  type ViewStyle,
  type StyleProp,
  type TextInputProps,
} from "react-native";
import { T } from "../constants/theme";

type Level = keyof typeof T.elevation;
type Radius = keyof typeof T.radius;
type SpaceKey = keyof typeof T.space;

/* Surface — elevation-aware container. */
export function Surface({
  level = "e1",
  radius = "lg",
  pad = 4,
  style,
  children,
}: {
  level?: Level;
  radius?: Radius;
  pad?: SpaceKey;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  return (
    <View
      style={[
        T.elevation[level],
        {
          borderWidth: 1,
          borderColor: T.border,
          borderRadius: T.radius[radius],
          padding: T.space[pad],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/* Button — primary / secondary / ghost. ≥44pt tall. */
export function Button({
  variant = "primary",
  full,
  disabled,
  onPress,
  children,
}: {
  variant?: "primary" | "secondary" | "ghost";
  full?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  children?: ReactNode;
}) {
  const variants: Record<string, ViewStyle> = {
    primary: { backgroundColor: T.gold },
    secondary: { backgroundColor: T.surfaceHi, borderWidth: 1, borderColor: T.border },
    ghost: { backgroundColor: "transparent" },
  };
  const fg = variant === "primary" ? T.bg : variant === "secondary" ? T.ink : T.mist;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          minHeight: 44,
          paddingHorizontal: T.space[5],
          borderRadius: T.radius.md,
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.5 : 1,
        },
        variants[variant],
      ]}
    >
      <Text
        style={{ fontFamily: T.body, fontSize: T.type.body.fontSize, fontWeight: "600", color: fg }}
      >
        {children}
      </Text>
    </Pressable>
  );
}

/* Chip / pill — selectable filter token. */
export function Chip({
  active,
  onPress,
  children,
}: {
  active?: boolean;
  onPress?: () => void;
  children?: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        minHeight: 32,
        paddingHorizontal: T.space[3],
        paddingVertical: T.space[1],
        borderRadius: T.radius.pill,
        backgroundColor: active ? T.goldDim : T.surfaceHi,
        borderWidth: 1,
        borderColor: active ? T.gold : T.border,
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontFamily: T.body,
          fontSize: T.type.caption.fontSize,
          color: active ? T.gold : T.mist,
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}

/* Input — token-styled text field. */
export function Input(props: TextInputProps) {
  const { style, ...rest } = props;
  return (
    <TextInput
      placeholderTextColor={T.faint}
      style={[
        {
          minHeight: 44,
          backgroundColor: T.surfaceHi,
          borderWidth: 1,
          borderColor: T.border,
          borderRadius: T.radius.md,
          paddingHorizontal: T.space[3],
          color: T.ink,
          fontFamily: T.body,
          fontSize: T.type.body.fontSize,
        },
        style,
      ]}
      {...rest}
    />
  );
}

/* ProgressBar — thin track + fill. tone = gold | good | warn. */
export function ProgressBar({
  pct = 0,
  tone = "gold",
}: {
  pct?: number;
  tone?: "gold" | "good" | "warn";
}) {
  const fill = { gold: T.gold, good: T.good, warn: T.warn }[tone];
  const w = Math.max(0, Math.min(100, pct));
  return (
    <View
      style={{
        height: 3,
        borderRadius: T.radius.pill,
        backgroundColor: T.border,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          height: "100%",
          width: `${w}%`,
          backgroundColor: fill,
          borderRadius: T.radius.pill,
        }}
      />
    </View>
  );
}

/* Badge — small status label. tone = info | good | warn | gold. */
export function Badge({
  tone = "info",
  children,
}: {
  tone?: "info" | "good" | "warn" | "gold";
  children?: ReactNode;
}) {
  const map = {
    info: { fg: T.info, bg: T.infoDim },
    good: { fg: T.good, bg: T.goodDim },
    warn: { fg: T.warn, bg: T.warnDim },
    gold: { fg: T.goldSoft, bg: T.goldDim },
  };
  const c = map[tone];
  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingHorizontal: T.space[2],
        paddingVertical: T.space[1],
        borderRadius: T.radius.sm,
        backgroundColor: c.bg,
      }}
    >
      <Text
        style={{
          fontFamily: T.body,
          fontSize: T.type.overline.fontSize,
          fontWeight: "500",
          color: c.fg,
        }}
      >
        {children}
      </Text>
    </View>
  );
}

/* EmptyState — designed empty placeholder for any list. */
export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <View
      style={{ alignItems: "center", paddingVertical: T.space[10], paddingHorizontal: T.space[5] }}
    >
      <Text
        style={{
          fontFamily: T.body,
          fontSize: T.type.heading.fontSize,
          fontWeight: "600",
          color: T.ink,
          marginBottom: T.space[2],
        }}
      >
        {title}
      </Text>
      {!!hint && (
        <Text
          style={{
            fontFamily: T.body,
            fontSize: T.type.caption.fontSize,
            color: T.faint,
            textAlign: "center",
            lineHeight: 18,
          }}
        >
          {hint}
        </Text>
      )}
    </View>
  );
}

/* Skeleton — animated loading placeholder. */
export function Skeleton({
  w = "100%",
  h = 16,
  radius = "sm",
}: {
  w?: number | `${number}%`;
  h?: number;
  radius?: Radius;
}) {
  const opacity = useRef(new Animated.Value(0.7)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.7, duration: 750, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return (
    <Animated.View
      style={{
        width: w,
        height: h,
        borderRadius: T.radius[radius],
        backgroundColor: T.surfaceHi,
        opacity,
      }}
    />
  );
}

/* StatHero — the single most important number on a screen. */
export function StatHero({ label, value, unit }: { label?: string; value: string; unit?: string }) {
  return (
    <View style={{ alignItems: "center", paddingVertical: T.space[8] }}>
      {!!label && (
        <Text
          style={{
            fontFamily: T.body,
            fontSize: T.type.overline.fontSize,
            fontWeight: "500",
            letterSpacing: 1.5,
            textTransform: "uppercase",
            color: T.faint,
            marginBottom: T.space[3],
          }}
        >
          {label}
        </Text>
      )}
      <Text style={{ fontFamily: T.display, fontSize: 72, fontWeight: "600", color: T.goldSoft }}>
        {value}
      </Text>
      {!!unit && (
        <Text
          style={{
            fontFamily: T.body,
            fontSize: T.type.overline.fontSize,
            fontWeight: "500",
            letterSpacing: 1.5,
            textTransform: "uppercase",
            color: T.faint,
            marginTop: T.space[2],
          }}
        >
          {unit}
        </Text>
      )}
    </View>
  );
}

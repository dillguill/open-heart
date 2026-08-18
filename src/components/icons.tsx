/**
 * Open Heart icon set — authored SVG, one consistent 1.8px stroke, 24x24 viewBox.
 * The pamphlet world draws its own icons; no unicode glyphs, no emoji (craft floor).
 */
import React from "react";
import type { ColorValue } from "react-native";
import Svg, { Circle, Line, Path, Polyline, Rect } from "react-native-svg";

import { colors } from "../theme/tokens";

interface IconProps {
  size?: number;
  color?: ColorValue;
  strokeWidth?: number;
}

function base(size: number, color: ColorValue, strokeWidth: number) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
}

export function HomeIcon({ size = 24, color = colors.ink, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg {...base(size, color, strokeWidth)}>
      <Path d="M3 10.5 12 3l9 7.5" />
      <Path d="M5 9.5V21h14V9.5" />
      <Path d="M9.5 21v-6h5v6" />
    </Svg>
  );
}

export function RecordsIcon({ size = 24, color = colors.ink, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg {...base(size, color, strokeWidth)}>
      <Rect x="4" y="3" width="16" height="18" rx="2" />
      <Line x1="8" y1="8" x2="16" y2="8" />
      <Line x1="8" y1="12" x2="16" y2="12" />
      <Line x1="8" y1="16" x2="13" y2="16" />
    </Svg>
  );
}

export function TrendsIcon({ size = 24, color = colors.ink, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg {...base(size, color, strokeWidth)}>
      <Polyline points="3 17 9 11 13 14 21 6" />
      <Polyline points="15 6 21 6 21 12" />
    </Svg>
  );
}

export function SettingsIcon({ size = 24, color = colors.ink, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg {...base(size, color, strokeWidth)}>
      <Circle cx="12" cy="12" r="3" />
      <Path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.09a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.09a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1Z" />
    </Svg>
  );
}

export function HeartIcon({ size = 24, color = colors.green, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg {...base(size, color, strokeWidth)}>
      <Path d="M12 20.5s-7.5-4.7-9.3-9.3C1.4 7.6 3.6 4.5 6.8 4.5c2 0 3.6 1.1 4.4 2.7h1.6c.8-1.6 2.4-2.7 4.4-2.7 3.2 0 5.4 3.1 4.1 6.7-1.8 4.6-9.3 9.3-9.3 9.3Z" />
    </Svg>
  );
}

export function FileIcon({ size = 24, color = colors.ink, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg {...base(size, color, strokeWidth)}>
      <Path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <Polyline points="14 3 14 8 19 8" />
      <Line x1="9" y1="13" x2="15" y2="13" />
      <Line x1="9" y1="17" x2="13" y2="17" />
    </Svg>
  );
}

export function ChevronRightIcon({
  size = 24,
  color = colors.ink,
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <Svg {...base(size, color, strokeWidth)}>
      <Polyline points="9 6 15 12 9 18" />
    </Svg>
  );
}

export function ArrowLeftIcon({ size = 24, color = colors.ink, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg {...base(size, color, strokeWidth)}>
      <Line x1="19" y1="12" x2="5" y2="12" />
      <Polyline points="11 6 5 12 11 18" />
    </Svg>
  );
}

export function PlusIcon({ size = 24, color = colors.white, strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...base(size, color, strokeWidth)}>
      <Line x1="12" y1="5" x2="12" y2="19" />
      <Line x1="5" y1="12" x2="19" y2="12" />
    </Svg>
  );
}

export function LockIcon({ size = 24, color = colors.ink, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg {...base(size, color, strokeWidth)}>
      <Rect x="5" y="11" width="14" height="10" rx="2" />
      <Path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Svg>
  );
}

export function ShareIcon({ size = 24, color = colors.ink, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg {...base(size, color, strokeWidth)}>
      <Circle cx="18" cy="5" r="3" />
      <Circle cx="6" cy="12" r="3" />
      <Circle cx="18" cy="19" r="3" />
      <Line x1="8.6" y1="10.5" x2="15.4" y2="6.5" />
      <Line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
    </Svg>
  );
}

export function ActivityIcon({ size = 24, color = colors.green, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg {...base(size, color, strokeWidth)}>
      <Polyline points="3 12 7 12 9.5 5 14 19 16.5 12 21 12" />
    </Svg>
  );
}

export function ShieldIcon({ size = 24, color = colors.green, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg {...base(size, color, strokeWidth)}>
      <Path d="M12 3 5 6v5c0 4.5 3 8.2 7 10 4-1.8 7-5.5 7-10V6Z" />
      <Path d="M9.5 12l1.8 1.8 3.4-3.6" />
    </Svg>
  );
}
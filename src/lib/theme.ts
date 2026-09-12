// src/lib/theme.ts
// Design tokens for StudyOS UI theme
// Primary accent colour: emerald-500 (as confirmed)

export const theme = {
  colors: {
    primary: "#10B981", // emerald-500
    background: "#F9FAFB", // gray-50
    surface: "#FFFFFF", // white
    textPrimary: "#111827", // gray-900
    textSecondary: "#6B7280", // gray-500
    border: "#E5E7EB", // gray-200
    error: "#EF4444", // red-500
    success: "#22C55E", // green-500
    warning: "#F59E0B" // amber-500
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px"
  },
  radii: {
    none: "0px",
    sm: "4px",
    md: "8px",
    lg: "12px",
    full: "9999px"
  }
};

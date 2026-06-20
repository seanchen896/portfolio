import { Anton, Instrument_Serif, JetBrains_Mono } from "next/font/google";

// Massive condensed display — the name, à la the Bill Chien hero.
export const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

// Elegant editorial serif — project + section titles.
export const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

// Technical mono — labels, metadata and short body. Engineering identity.
export const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

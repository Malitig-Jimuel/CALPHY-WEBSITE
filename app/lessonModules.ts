import {
  AudioLines,
  Droplets,
  Lightbulb,
  Ruler,
  Thermometer,
  Zap,
} from "lucide-react";

export const lessons = [
  {
    title: "Measurements & Vectors",
    slug: "measurements-vectors",
    description:
      "Explore physical quantities, measurement systems, significant figures, vectors, and motion.",
    icon: Ruler,
    accent: "sky",
    category: "Mechanics",
  },
  {
    title: "Fluids",
    slug: "fluids",
    description:
      "Study pressure, density, buoyancy, Archimedes' Principle, and the behavior of moving fluids.",
    icon: Droplets,
    accent: "cyan",
    category: "Fluids",
  },
  {
    title: "Temperature & Heat",
    slug: "temperature-heat",
    description:
      "Learn about temperature scales, thermal expansion, and heat energy.",
    icon: Thermometer,
    accent: "orange",
    category: "Thermal Physics",
  },
  {
    title: "Waves & Sound",
    slug: "waves-sound",
    description:
      "Investigate wave properties, frequency, wavelength, and sound.",
    icon: AudioLines,
    accent: "violet",
    category: "Waves",
  },
  {
    title: "Light & Reflection",
    slug: "optics",
    description:
      "Explore reflection, mirrors, image formation, and optics equations.",
    icon: Lightbulb,
    accent: "amber",
    category: "Optics",
  },
  {
    title: "Electric Forces & Field",
    slug: "electricity",
    description:
      "Study electric charges, forces between charges, and electric fields.",
    icon: Zap,
    accent: "emerald",
    category: "Electricity",
  },
] as const;

export const moduleAccentClasses = {
  sky: {
    icon: "text-sky-300",
    iconBackground: "bg-sky-400/10",
    border: "group-hover:border-sky-300/30",
    progress: "bg-sky-300",
    visual: "from-sky-500/20 via-blue-500/10 to-cyan-500/10",
  },
  cyan: {
    icon: "text-cyan-300",
    iconBackground: "bg-cyan-400/10",
    border: "group-hover:border-cyan-300/30",
    progress: "bg-cyan-300",
    visual: "from-cyan-500/20 via-blue-500/10 to-sky-500/10",
  },
  orange: {
    icon: "text-orange-300",
    iconBackground: "bg-orange-400/10",
    border: "group-hover:border-orange-300/30",
    progress: "bg-orange-300",
    visual: "from-orange-500/20 via-rose-500/10 to-sky-500/10",
  },
  violet: {
    icon: "text-violet-300",
    iconBackground: "bg-violet-400/10",
    border: "group-hover:border-violet-300/30",
    progress: "bg-violet-300",
    visual: "from-violet-500/15 via-indigo-500/10 to-sky-500/10",
  },
  amber: {
    icon: "text-amber-300",
    iconBackground: "bg-amber-400/10",
    border: "group-hover:border-amber-300/30",
    progress: "bg-amber-300",
    visual: "from-amber-500/20 via-orange-500/10 to-sky-500/10",
  },
  emerald: {
    icon: "text-emerald-300",
    iconBackground: "bg-emerald-400/10",
    border: "group-hover:border-emerald-300/30",
    progress: "bg-emerald-300",
    visual: "from-emerald-500/20 via-cyan-500/10 to-sky-500/10",
  },
} as const;

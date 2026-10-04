import {
  HeartPulse, Bone, Baby, Brain, Sparkles, Stethoscope,
  Eye, Ear, Activity, Pill, Scissors, Microscope, Syringe,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  HeartPulse, Bone, Baby, Brain, Sparkles, Stethoscope,
  Eye, Ear, Activity, Pill, Scissors, Microscope, Syringe,
};

export function getDepartmentIcon(name: string): LucideIcon {
  return iconMap[name] ?? Stethoscope;
}

const colorMap: Record<string, { bg: string; text: string; border: string; gradient: string; soft: string }> = {
  rose: {
    bg: 'bg-rose-500', text: 'text-rose-600', border: 'border-rose-200',
    gradient: 'from-rose-400 to-rose-600', soft: 'bg-rose-50 text-rose-700',
  },
  amber: {
    bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-200',
    gradient: 'from-amber-400 to-amber-600', soft: 'bg-amber-50 text-amber-700',
  },
  sky: {
    bg: 'bg-sky-500', text: 'text-sky-600', border: 'border-sky-200',
    gradient: 'from-sky-400 to-sky-600', soft: 'bg-sky-50 text-sky-700',
  },
  violet: {
    bg: 'bg-violet-500', text: 'text-violet-600', border: 'border-violet-200',
    gradient: 'from-violet-400 to-violet-600', soft: 'bg-violet-50 text-violet-700',
  },
  emerald: {
    bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-200',
    gradient: 'from-emerald-400 to-emerald-600', soft: 'bg-emerald-50 text-emerald-700',
  },
  teal: {
    bg: 'bg-teal-500', text: 'text-teal-600', border: 'border-teal-200',
    gradient: 'from-teal-400 to-teal-600', soft: 'bg-teal-50 text-teal-700',
  },
  cyan: {
    bg: 'bg-cyan-500', text: 'text-cyan-600', border: 'border-cyan-200',
    gradient: 'from-cyan-400 to-cyan-600', soft: 'bg-cyan-50 text-cyan-700',
  },
  orange: {
    bg: 'bg-orange-500', text: 'text-orange-600', border: 'border-orange-200',
    gradient: 'from-orange-400 to-orange-600', soft: 'bg-orange-50 text-orange-700',
  },
};

export function getColorClasses(color: string) {
  return colorMap[color] ?? colorMap.teal;
}

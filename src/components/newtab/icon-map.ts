"use client";

import {
  Code2,
  Sparkles,
  Briefcase,
  Search,
  BookOpen,
  ShoppingCart,
  GraduationCap,
  Wallet,
  Film,
  Music,
  Globe,
  Folder,
  Server,
  Terminal,
  PenTool,
  Mail,
  Cpu,
  FlaskConical,
  Plane,
  Gamepad2,
  Heart,
  Home,
  Star,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  Code2,
  Sparkles,
  Briefcase,
  Search,
  BookOpen,
  ShoppingCart,
  GraduationCap,
  Wallet,
  Film,
  Music,
  Globe,
  Folder,
  Server,
  Terminal,
  PenTool,
  Mail,
  Cpu,
  FlaskConical,
  Plane,
  Gamepad2,
  Heart,
  Home,
  Star,
};

export const ICON_OPTIONS = Object.keys(ICON_MAP);

export function getIcon(name?: string): LucideIcon {
  if (name && ICON_MAP[name]) return ICON_MAP[name];
  return Folder;
}

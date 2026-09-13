import {
  Bot,
  Cpu,
  CircuitBoard,
  Zap,
  Factory,
  PenTool,
  Trophy,
  Rocket,
  Code2,
  type LucideIcon,
} from "lucide-react";

const RULES: [RegExp, LucideIcon][] = [
  [/drone/i, Rocket],
  [/web|full.?stack/i, Code2],
  [/arduino|esp32|iot/i, CircuitBoard],
  [/embedded/i, Cpu],
  [/electronic/i, Zap],
  [/plc|automation|industrial/i, Factory],
  [/cad|design/i, PenTool],
  [/competition/i, Trophy],
];

export function getTrainingIcon(courseName: string): LucideIcon {
  for (const [pattern, icon] of RULES) {
    if (pattern.test(courseName)) return icon;
  }
  return Bot;
}

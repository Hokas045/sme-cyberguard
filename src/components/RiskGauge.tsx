import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RiskGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const RiskGauge = ({ score, size = "md", showLabel = true }: RiskGaugeProps) => {
  const radius = size === "sm" ? 40 : size === "md" ? 60 : 80;
  const strokeWidth = size === "sm" ? 6 : size === "md" ? 8 : 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (score: number) => {
    if (score <= 30) return "hsl(var(--success))";
    if (score <= 70) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  const getLabel = (score: number) => {
    if (score <= 30) return "Secure";
    if (score <= 70) return "At Risk";
    return "Critical";
  };

  const svgSize = (radius + strokeWidth) * 2;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <svg width={svgSize} height={svgSize} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Animated progress circle */}
          <motion.circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke={getColor(score)}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={cn(
              "font-bold",
              size === "sm" ? "text-2xl" : size === "md" ? "text-4xl" : "text-5xl"
            )}
            style={{ color: getColor(score) }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {score}
          </motion.span>
          {showLabel && (
            <span className="text-xs text-muted-foreground mt-1">Risk Score</span>
          )}
        </div>
      </div>
      {showLabel && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className={cn(
            "font-semibold px-4 py-1 rounded-full",
            score <= 30 && "bg-success/10 text-success",
            score > 30 && score <= 70 && "bg-warning/10 text-warning",
            score > 70 && "bg-destructive/10 text-destructive"
          )}
        >
          {getLabel(score)}
        </motion.div>
      )}
    </div>
  );
};

export default RiskGauge;

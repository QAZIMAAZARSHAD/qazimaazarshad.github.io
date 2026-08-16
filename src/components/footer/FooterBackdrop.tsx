import { motion } from "framer-motion";
import { useAmbientMotion } from "@/hooks/useAmbientMotion";

const DOT_GRID = {
  backgroundImage:
    "radial-gradient(circle, rgba(255,255,255,0.10) 1px, transparent 1px)",
  backgroundSize: "24px 24px",
  WebkitMaskImage:
    "radial-gradient(ellipse 75% 60% at 50% 100%, #000 15%, transparent 78%)",
  maskImage:
    "radial-gradient(ellipse 75% 60% at 50% 100%, #000 15%, transparent 78%)",
};

const HORIZON =
  "radial-gradient(ellipse at 50% 100%, rgba(99,102,241,0.42), rgba(34,211,238,0.13) 42%, transparent 72%)";

export function FooterBackdrop() {
  const ambient = useAmbientMotion();
  // Gated on visibility — the footer is off-screen for most of a visit, so
  // there's no reason to keep the drift running the whole session.
  const drift = (x: number[], y: number[], duration: number) =>
    !ambient
      ? undefined
      : {
          whileInView: { x, y },
          viewport: { once: false, amount: 0 },
          transition: {
            duration,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        };

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0" style={DOT_GRID} />
      <div
        className="absolute inset-x-0 bottom-[-25%] h-[75%]"
        style={{ background: HORIZON }}
      />
      <motion.div
        className="absolute -left-24 top-4 h-72 w-72 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(129,140,248,0.26), transparent 65%)",
        }}
        {...drift([0, 45, 0], [0, -25, 0], 19)}
      />
      <motion.div
        className="absolute -right-20 top-0 h-80 w-80 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(34,211,238,0.2), transparent 65%)",
        }}
        {...drift([0, -35, 0], [0, 30, 0], 23)}
      />
    </div>
  );
}

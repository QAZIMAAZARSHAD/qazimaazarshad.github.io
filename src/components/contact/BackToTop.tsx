import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";

/**
 * Floating "back to top" control. Appears once the user has scrolled past a
 * threshold and smoothly returns them to the top of the page. Fixed to the
 * bottom-right, above most content, with enter/exit animation.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = (): void => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = (): void => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="glass group fixed bottom-6 right-6 z-40 grid h-12 w-12 place-items-center rounded-full text-ink-200 shadow-lg shadow-accent-500/20 transition-colors duration-300 hover:border-accent-400/40 hover:text-white hover:shadow-accent-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
        >
          <ArrowUp
            className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5"
            aria-hidden
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

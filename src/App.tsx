import { MotionConfig } from "framer-motion";
import { AnimatedBackground } from "@/components/effects/AnimatedBackground";
import { ScrollProgress } from "@/components/effects/ScrollProgress";
import { Preloader } from "@/components/effects/Preloader";
import { IntroProvider } from "@/components/effects/IntroProvider";
import { CommandPalette } from "@/components/command/CommandPalette";
import { AiAssistant } from "@/components/ai/AiAssistant";
import { SpotlightEffect } from "@/components/effects/SpotlightEffect";
import { CustomCursor } from "@/components/effects/CustomCursor";
import { SynthwaveMode } from "@/components/effects/SynthwaveMode";
import { SideNav } from "@/components/effects/SideNav";
import { Threshold } from "@/components/threshold/Threshold";
import { Navbar } from "@/sections/Navbar";
import { Hero } from "@/sections/Hero";
import { About } from "@/sections/About";
import { Experience } from "@/sections/Experience";
import { EarlierExperience } from "@/sections/EarlierExperience";
import { Projects } from "@/sections/Projects";
import { Skills } from "@/sections/Skills";
import { Education } from "@/sections/Education";
import { Achievements } from "@/sections/Achievements";
import { Certifications } from "@/sections/Certifications";
import { Hobbies } from "@/sections/Hobbies";
import { Contact } from "@/sections/Contact";
import { Footer } from "@/sections/Footer";

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <IntroProvider>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-xl focus:bg-ink-900 focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-white focus:outline-none focus:ring-2 focus:ring-accent-400/70"
        >
          Skip to content
        </a>
        <Preloader />
        <CommandPalette />
        <AiAssistant />
        <SpotlightEffect />
        <CustomCursor />
        <SynthwaveMode />
        <SideNav />
        <AnimatedBackground />
        <ScrollProgress />
        <Navbar />
        <main id="main">
          <Hero />
          <About />
          <Experience />
          <Skills />
          {/* Everything below the threshold is learning rather than work. */}
          <Threshold />
          <EarlierExperience />
          <Projects />
          <Education />
          <Achievements />
          <Certifications />
          <Hobbies />
          <Contact />
        </main>
        <Footer />
      </IntroProvider>
    </MotionConfig>
  );
}

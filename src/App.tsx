import { MotionConfig } from "framer-motion";
import { AnimatedBackground } from "@/components/effects/AnimatedBackground";
import { ScrollProgress } from "@/components/effects/ScrollProgress";
import { Preloader } from "@/components/effects/Preloader";
import { CommandPalette } from "@/components/command/CommandPalette";
import { AiAssistant } from "@/components/ai/AiAssistant";
import { SpotlightEffect } from "@/components/effects/SpotlightEffect";
import { CustomCursor } from "@/components/effects/CustomCursor";
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
      <Preloader />
      <CommandPalette />
      <AiAssistant />
      <SpotlightEffect />
      <CustomCursor />
      <SideNav />
      <AnimatedBackground />
      <ScrollProgress />
      <Navbar />
      <main>
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
    </MotionConfig>
  );
}

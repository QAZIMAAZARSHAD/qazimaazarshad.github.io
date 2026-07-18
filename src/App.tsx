import { MotionConfig } from "framer-motion";
import { AnimatedBackground } from "@/components/effects/AnimatedBackground";
import { ScrollProgress } from "@/components/effects/ScrollProgress";
import { Preloader } from "@/components/effects/Preloader";
import { CommandPalette } from "@/components/command/CommandPalette";
import { Navbar } from "@/sections/Navbar";
import { Hero } from "@/sections/Hero";
import { About } from "@/sections/About";
import { Experience } from "@/sections/Experience";
import { EarlierExperience } from "@/sections/EarlierExperience";
import { Projects } from "@/sections/Projects";
import { Skills } from "@/sections/Skills";
import { Education } from "@/sections/Education";
import { Achievements } from "@/sections/Achievements";
import { Contact } from "@/sections/Contact";
import { Footer } from "@/sections/Footer";

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Preloader />
      <CommandPalette />
      <AnimatedBackground />
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Experience />
        <EarlierExperience />
        <Projects />
        <Skills />
        <Education />
        <Achievements />
        <Contact />
      </main>
      <Footer />
    </MotionConfig>
  );
}

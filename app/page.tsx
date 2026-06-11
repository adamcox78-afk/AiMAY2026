import Scene1Beginning from '@/components/scenes/Scene1Beginning';
import Scene2Dna from '@/components/scenes/Scene2Dna';
import Scene3RootCause from '@/components/scenes/Scene3RootCause';
import Scene4Hormones from '@/components/scenes/Scene4Hormones';
import Scene5Longevity from '@/components/scenes/Scene5Longevity';
import Scene6Transformation from '@/components/scenes/Scene6Transformation';
import Scene7Experience from '@/components/scenes/Scene7Experience';
import Scene8Treatments from '@/components/scenes/Scene8Treatments';
import FinalScene from '@/components/scenes/FinalScene';
import ProgressRail from '@/components/ProgressRail';

export default function Home() {
  return (
    <main className="relative">
      <ProgressRail />
      <Scene1Beginning />
      <Scene2Dna />
      <Scene3RootCause />
      <Scene4Hormones />
      <Scene5Longevity />
      <Scene6Transformation />
      <Scene7Experience />
      <Scene8Treatments />
      <FinalScene />
    </main>
  );
}

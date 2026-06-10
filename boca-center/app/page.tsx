import Nav from "@/app/components/Nav";
import Scene1Door from "@/app/components/Scene1Door";
import Scene2Reception from "@/app/components/Scene2Reception";
import Scene3Hallway from "@/app/components/Scene3Hallway";
import Scene4Consultation from "@/app/components/Scene4Consultation";
import Scene5Technology from "@/app/components/Scene5Technology";
import Scene6CTA from "@/app/components/Scene6CTA";

export default function Home() {
  return (
    <main>
      <Nav />
      <Scene1Door />
      <Scene2Reception />
      <Scene3Hallway />
      <Scene4Consultation />
      <Scene5Technology />
      <Scene6CTA />
    </main>
  );
}

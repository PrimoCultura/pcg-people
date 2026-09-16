"use client";

import { HomeHero } from "@/components/home/HomeHero";
import { ExploreSection } from "@/components/home/ExploreSection";
import { IntroSection } from "@/components/home/IntroSection";
import { isConvexConfigured } from "@/components/providers/ConvexClientProvider";
import {
  getMockActivePeople,
  useConvexActivePeople,
} from "@/lib/data/usePublicData";

export function HomePageClient() {
  if (!isConvexConfigured()) {
    return (
      <>
        <HomeHero people={getMockActivePeople()} />
        <ExploreSection />
        <IntroSection />
      </>
    );
  }
  return <HomePageFromConvex />;
}

function HomePageFromConvex() {
  const { status, people } = useConvexActivePeople();
  return (
    <>
      <HomeHero people={status === "ready" ? people : []} />
      <ExploreSection />
      <IntroSection />
    </>
  );
}

import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PeoplePageClient } from "@/components/people/PeoplePageClient";
import { PageIntro } from "@/components/ui/PageIntro";

export const metadata: Metadata = {
  title: "Persone",
};

export default function PersonePage() {
  return (
    <section className="pb-14 pt-10 sm:pb-16 sm:pt-12">
      <Container>
        <PageIntro
          eyebrow="Persone · Ruoli · Contatti"
          title="Persone"
          description="Trova colleghi, ruoli, responsabilità e recapiti."
        />
        <PeoplePageClient />
      </Container>
    </section>
  );
}

import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { DepartmentsPageClient } from "@/components/departments/DepartmentsPageClient";
import { PageIntro } from "@/components/ui/PageIntro";

export const metadata: Metadata = {
  title: "Dipartimenti",
};

export default function DipartimentiPage() {
  return (
    <section className="pb-14 pt-10 sm:pb-16 sm:pt-12">
      <Container>
        <PageIntro
          eyebrow="HQ"
          title="Dipartimenti"
          description="Scopri cosa fanno i team di PCG e trova il riferimento corretto."
        />
        <DepartmentsPageClient />
      </Container>
    </section>
  );
}

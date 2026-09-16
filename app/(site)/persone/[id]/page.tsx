import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PersonProfileClient } from "@/components/people/PersonProfileClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Profilo" };
}

export default async function PersonProfilePage(props: PageProps) {
  const { id } = await props.params;

  return (
    <section className="pb-14 pt-8 sm:pb-16 sm:pt-10">
      <Container>
        <PersonProfileClient id={id} />
      </Container>
    </section>
  );
}

import type { Department } from "@/data/department";
import { getPersonById, mockPeople } from "@/data/mockPeople";
import type { Person } from "@/data/types";

/**
 * HQ + Network department catalog.
 * People membership is resolved via Person.departmentId → Department.id.
 */
export const mockDepartments: Department[] = [
  {
    id: "ceo",
    name: "CEO",
    slug: "ceo",
    shortDescription: "Vertice e direzione generale del gruppo.",
    description:
      "La funzione CEO rappresenta il vertice aziendale: indirizzo strategico, governance e coordinamento delle direzioni.",
    headId: "p-014",
    contactFor: ["direzione generale", "governance", "priorità strategiche"],
    tags: ["ceo", "direzione"],
    order: 0,
  },
  {
    id: "finance",
    name: "Finance",
    slug: "finance",
    shortDescription:
      "Pianificazione, controllo di gestione e supporto economico al gruppo.",
    description:
      "Il team Finance guida budget, reporting e amministrazione: è il riferimento per domande economiche, fatture, pagamenti e analisi di performance.",
    headId: "p-002",
    contactFor: [
      "fatture e pagamenti",
      "budget",
      "reporting economico",
      "amministrazione",
      "supporto contabile",
    ],
    tags: ["finance", "budget", "reporting", "amministrazione"],
    order: 1,
  },
  {
    id: "hr",
    name: "HR",
    shortDescription:
      "Persone, recruiting, payroll e relazioni organizzative.",
    description:
      "HR accompagna il ciclo di vita delle persone in PCG: selection, onboarding, sviluppo e amministrazione del personale.",
    headId: "p-001",
    contactFor: [
      "recruiting e selezione",
      "onboarding",
      "payroll e cedolini",
      "politiche HR",
      "sviluppo delle persone",
    ],
    tags: ["hr", "people", "recruiting", "payroll"],
    order: 2,
  },
  {
    id: "marketing",
    name: "Marketing",
    shortDescription:
      "Brand, campagne e comunicazione a supporto del network.",
    description:
      "Marketing cura brand, campagne e contenuti per far crescere la presenza di PCG e supportare le cliniche sul territorio.",
    headId: "p-005",
    contactFor: [
      "campagne e lead generation",
      "brand e comunicazione",
      "digital marketing",
      "contenuti",
      "supporto marketing alle cliniche",
    ],
    tags: ["marketing", "brand", "campagne", "digital"],
    order: 3,
  },
  {
    id: "cultura",
    name: "Cultura",
    shortDescription:
      "Formazione, engagement e cultura di gruppo.",
    description:
      "Cultura promuove apprendimento e appartenenza: formazione, iniziative di engagement e comunicazione interna per HQ e network.",
    headId: "p-003",
    contactFor: [
      "formazione e academy",
      "catalogo corsi",
      "engagement",
      "comunicazione interna",
      "iniziative culturali",
    ],
    tags: ["cultura", "formazione", "academy", "engagement"],
    order: 4,
    organizationalPlacement: "staff",
  },
  {
    id: "operations",
    name: "Operations",
    shortDescription:
      "Processi operativi, assicurazioni e supporto al network.",
    description:
      "Operations coordina processi trasversali, assicurazioni e il collegamento operativo tra HQ e le strutture del network.",
    headId: "p-014",
    contactFor: [
      "processi operativi",
      "assicurazioni e sinistri",
      "convenzioni",
      "supporto alle cliniche",
      "governance di network",
    ],
    tags: ["operations", "assicurazioni", "network", "processi"],
    order: 5,
  },
  {
    id: "it",
    name: "IT",
    shortDescription:
      "Strumenti digitali, accessi e piattaforma PrimoUp.",
    description:
      "IT garantisce strumenti, accessi e evoluzione dei sistemi digitali del gruppo, con particolare attenzione a PrimoUp e al supporto quotidiano.",
    headId: "p-010",
    contactFor: [
      "supporto IT e accessi",
      "hardware e postazioni",
      "PrimoUp",
      "applicazioni e requisiti",
      "strumenti digitali",
    ],
    tags: ["it", "digital", "primoup", "supporto"],
    order: 6,
  },
  {
    id: "legal",
    name: "Legal",
    shortDescription:
      "Contratti, compliance e questioni legali del gruppo.",
    description:
      "Legal supporta PCG su contratti, privacy e compliance, offrendo un punto di riferimento chiaro per le questioni giuridiche.",
    headId: "p-009",
    contactFor: [
      "contratti",
      "compliance",
      "privacy",
      "questioni legali",
    ],
    tags: ["legal", "compliance", "privacy", "contratti"],
    order: 7,
  },
  {
    id: "network",
    name: "Network",
    shortDescription:
      "District Manager, Area Manager e cliniche sul territorio.",
    description:
      "Il Network collega HQ e cliniche attraverso District e Area Manager, con responsabilità territoriali e operative.",
    headId: "p-014",
    contactFor: [
      "district e area manager",
      "performance di rete",
      "cliniche assegnate",
      "supporto territoriale",
    ],
    tags: ["network", "cliniche", "territorio"],
    // No order → excluded from HQ department directory
  },
];

export function getDepartmentById(id: string): Department | undefined {
  return mockDepartments.find((department) => department.id === id);
}

/** HQ departments shown on /dipartimenti, sorted by order. */
export function getHqDepartments(): Department[] {
  return mockDepartments
    .filter((department) => typeof department.order === "number")
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getDepartmentName(departmentId: string): string {
  return getDepartmentById(departmentId)?.name ?? departmentId;
}

export function getDepartmentMembers(departmentId: string): Person[] {
  return mockPeople
    .filter((person) => person.departmentId === departmentId)
    .sort((a, b) =>
      `${a.lastName} ${a.firstName}`.localeCompare(
        `${b.lastName} ${b.firstName}`,
        "it",
      ),
    );
}

export function getDepartmentHead(
  department: Department,
): Person | undefined {
  if (!department.headId) return undefined;
  return getPersonById(department.headId);
}

/** Departments that currently have members, for people-directory filters. */
export function getDepartmentsWithMembers(): Department[] {
  const usedIds = new Set(mockPeople.map((person) => person.departmentId));
  return mockDepartments
    .filter((department) => usedIds.has(department.id))
    .sort((a, b) => a.name.localeCompare(b.name, "it"));
}

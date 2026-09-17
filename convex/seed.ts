/**
 * One-time development seed from former mock fixtures.
 * Safe to call multiple times: skips when meta.seedVersion is already set.
 */
import { v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { now } from "./lib/validators";

const SEED_KEY = "seedVersion";
const SEED_VERSION = "v1-mock-migration";

type SeedDept = {
  oldId: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  contactFor: string[];
  tags: string[];
  order?: number;
  headOldId?: string;
  organizationalPlacement?: "line" | "staff";
};

type SeedPerson = {
  oldId: string;
  firstName: string;
  lastName: string;
  role: string;
  departmentOldId: string;
  managerOldId?: string;
  type: "hq" | "network";
  networkRole?: "head" | "district-manager" | "area-manager";
  districtOldId?: string;
  email: string;
  phone?: string;
  location?: string;
  shortDescription?: string;
  responsibilities: string[];
  tags: string[];
  isOrgRoot?: boolean;
};

type SeedDistrict = {
  oldId: string;
  name: string;
  slug: string;
  shortName?: string;
  managerOldId: string;
  description?: string;
  order?: number;
};

type SeedClinic = {
  oldId: string;
  name: string;
  slug: string;
  city: string;
  region?: string;
  address?: string;
  districtOldId: string;
  areaManagerOldId: string;
  order?: number;
};

const DEPARTMENTS: SeedDept[] = [
  {
    oldId: "finance",
    name: "Finance",
    slug: "finance",
    shortDescription:
      "Pianificazione, controllo di gestione e supporto economico al gruppo.",
    description:
      "Il team Finance guida budget, reporting e amministrazione: è il riferimento per domande economiche, fatture, pagamenti e analisi di performance.",
    contactFor: [
      "fatture e pagamenti",
      "budget",
      "reporting economico",
      "amministrazione",
      "supporto contabile",
    ],
    tags: ["finance", "budget", "reporting", "amministrazione"],
    order: 1,
    headOldId: "p-002",
  },
  {
    oldId: "hr",
    name: "HR",
    slug: "hr",
    shortDescription: "Persone, recruiting, payroll e relazioni organizzative.",
    description:
      "HR accompagna il ciclo di vita delle persone in PCG: selection, onboarding, sviluppo e amministrazione del personale.",
    contactFor: [
      "recruiting e selezione",
      "onboarding",
      "payroll e cedolini",
      "politiche HR",
      "sviluppo delle persone",
    ],
    tags: ["hr", "people", "recruiting", "payroll"],
    order: 2,
    headOldId: "p-001",
  },
  {
    oldId: "marketing",
    name: "Marketing",
    slug: "marketing",
    shortDescription: "Brand, campagne e comunicazione a supporto del network.",
    description:
      "Marketing cura brand, campagne e contenuti per far crescere la presenza di PCG e supportare le cliniche sul territorio.",
    contactFor: [
      "campagne e lead generation",
      "brand e comunicazione",
      "digital marketing",
      "contenuti",
      "supporto marketing alle cliniche",
    ],
    tags: ["marketing", "brand", "campagne", "digital"],
    order: 3,
    headOldId: "p-005",
  },
  {
    oldId: "cultura",
    name: "Cultura",
    slug: "cultura",
    shortDescription: "Formazione, engagement e cultura di gruppo.",
    description:
      "Cultura promuove apprendimento e appartenenza: formazione, iniziative di engagement e comunicazione interna per HQ e network.",
    contactFor: [
      "formazione e academy",
      "catalogo corsi",
      "engagement",
      "comunicazione interna",
      "iniziative culturali",
    ],
    tags: ["cultura", "formazione", "academy", "engagement"],
    order: 4,
    headOldId: "p-003",
    organizationalPlacement: "staff",
  },
  {
    oldId: "operations",
    name: "Operations",
    slug: "operations",
    shortDescription:
      "Processi operativi, assicurazioni e supporto al network.",
    description:
      "Operations coordina processi trasversali, assicurazioni e il collegamento operativo tra HQ e le strutture del network.",
    contactFor: [
      "processi operativi",
      "assicurazioni e sinistri",
      "convenzioni",
      "supporto alle cliniche",
      "governance di network",
    ],
    tags: ["operations", "assicurazioni", "network", "processi"],
    order: 5,
    headOldId: "p-014",
  },
  {
    oldId: "it",
    name: "IT",
    slug: "it",
    shortDescription: "Strumenti digitali, accessi e piattaforma PrimoUp.",
    description:
      "IT garantisce strumenti, accessi e evoluzione dei sistemi digitali del gruppo, con particolare attenzione a PrimoUp e al supporto quotidiano.",
    contactFor: [
      "supporto IT e accessi",
      "hardware e postazioni",
      "PrimoUp",
      "applicazioni e requisiti",
      "strumenti digitali",
    ],
    tags: ["it", "digital", "primoup", "supporto"],
    order: 6,
    headOldId: "p-010",
  },
  {
    oldId: "legal",
    name: "Legal",
    slug: "legal",
    shortDescription: "Contratti, compliance e questioni legali del gruppo.",
    description:
      "Legal supporta PCG su contratti, privacy e compliance, offrendo un punto di riferimento chiaro per le questioni giuridiche.",
    contactFor: ["contratti", "compliance", "privacy", "questioni legali"],
    tags: ["legal", "compliance", "privacy", "contratti"],
    order: 7,
    headOldId: "p-009",
  },
  {
    oldId: "network",
    name: "Network",
    slug: "network",
    shortDescription:
      "District Manager, Area Manager e cliniche sul territorio.",
    description:
      "Il Network collega HQ e cliniche attraverso District e Area Manager, con responsabilità territoriali e operative.",
    contactFor: [
      "district e area manager",
      "performance di rete",
      "cliniche assegnate",
      "supporto territoriale",
    ],
    tags: ["network", "cliniche", "territorio"],
    headOldId: "p-014",
  },
];

const PEOPLE: SeedPerson[] = [
  {
    oldId: "p-001",
    firstName: "Giulia",
    lastName: "Martini",
    role: "HR Business Partner",
    departmentOldId: "hr",
    type: "hq",
    email: "giulia.martini@pcg.example",
    phone: "+39 011 000 1001",
    location: "Torino · HQ",
    shortDescription:
      "Supporta i team HQ su percorsi di crescita, onboarding e relazioni organizzative.",
    responsibilities: [
      "recruiting",
      "onboarding",
      "politiche HR",
      "sviluppo delle persone",
    ],
    tags: ["hr", "recruiting", "onboarding", "people"],
  },
  {
    oldId: "p-002",
    firstName: "Marco",
    lastName: "Bianchi",
    role: "Head of Finance",
    departmentOldId: "finance",
    type: "hq",
    email: "marco.bianchi@pcg.example",
    phone: "+39 011 000 1002",
    location: "Torino · HQ",
    shortDescription:
      "Guida pianificazione finanziaria, reporting e controllo di gestione del gruppo.",
    responsibilities: [
      "budget",
      "reporting",
      "controlli finanziari",
      "chiarimenti finance",
    ],
    tags: ["finance", "budget", "reporting", "cfo office"],
  },
  {
    oldId: "p-003",
    firstName: "Elena",
    lastName: "Russo",
    role: "Responsabile Formazione",
    departmentOldId: "cultura",
    type: "hq",
    email: "elena.russo@pcg.example",
    phone: "+39 011 000 1003",
    location: "Torino · HQ",
    shortDescription:
      "Progetta e coordina i percorsi formativi per HQ, cliniche e network.",
    responsibilities: [
      "formazione",
      "catalogo corsi",
      "academy",
      "sviluppo competenze",
    ],
    tags: ["formazione", "academy", "learning", "cultura"],
  },
  {
    oldId: "p-004",
    firstName: "Andrea",
    lastName: "Conti",
    role: "Specialista Assicurazioni",
    departmentOldId: "operations",
    managerOldId: "p-014",
    type: "hq",
    email: "andrea.conti@pcg.example",
    phone: "+39 011 000 1004",
    location: "Torino · HQ",
    shortDescription:
      "Gestisce pratiche assicurative, convenzioni e supporto alle cliniche.",
    responsibilities: [
      "assicurazioni",
      "sinistri",
      "convenzioni",
      "coperture cliniche",
    ],
    tags: ["assicurazioni", "operations", "convenzioni"],
  },
  {
    oldId: "p-005",
    firstName: "Chiara",
    lastName: "Ferrari",
    role: "Marketing Manager",
    departmentOldId: "marketing",
    type: "hq",
    email: "chiara.ferrari@pcg.example",
    phone: "+39 011 000 1005",
    location: "Torino · HQ",
    shortDescription:
      "Coordina campagne, brand e attività di comunicazione per il network.",
    responsibilities: [
      "marketing",
      "campagne",
      "brand",
      "comunicazione",
      "lead generation",
    ],
    tags: ["marketing", "brand", "campagne", "comunicazione"],
  },
  {
    oldId: "p-006",
    firstName: "Luca",
    lastName: "Esposito",
    role: "Talent Acquisition Specialist",
    departmentOldId: "hr",
    managerOldId: "p-001",
    type: "hq",
    email: "luca.esposito@pcg.example",
    phone: "+39 011 000 1006",
    location: "Torino · HQ",
    shortDescription:
      "Cura selection e recruiting per ruoli HQ e posizioni chiave del network.",
    responsibilities: ["recruiting", "selezione", "job posting", "colloqui"],
    tags: ["recruiting", "talent", "hr", "selezione"],
  },
  {
    oldId: "p-007",
    firstName: "Francesca",
    lastName: "Romano",
    role: "Area Manager",
    departmentOldId: "network",
    managerOldId: "p-008",
    type: "network",
    networkRole: "area-manager",
    districtOldId: "nord",
    email: "francesca.romano@pcg.example",
    phone: "+39 011 000 1007",
    location: "Torino · Network",
    shortDescription:
      "Supervisiona le cliniche assegnate e supporta i team sul territorio.",
    responsibilities: [
      "area manager",
      "performance cliniche",
      "supporto territoriale",
      "network operativo",
    ],
    tags: ["area manager", "network", "cliniche", "territorio"],
  },
  {
    oldId: "p-008",
    firstName: "Davide",
    lastName: "Galli",
    role: "District Manager",
    departmentOldId: "network",
    managerOldId: "p-014",
    type: "network",
    networkRole: "district-manager",
    districtOldId: "nord",
    email: "davide.galli@pcg.example",
    phone: "+39 011 000 1008",
    location: "Milano · Network",
    shortDescription:
      "Coordina gli Area Manager del distretto Nord e allinea obiettivi di rete.",
    responsibilities: [
      "district manager",
      "governance di rete",
      "obiettivi distrettuali",
      "escalation cliniche",
    ],
    tags: ["district manager", "network", "distretto"],
  },
  {
    oldId: "p-009",
    firstName: "Sara",
    lastName: "Moretti",
    role: "Legal Counsel",
    departmentOldId: "legal",
    type: "hq",
    email: "sara.moretti@pcg.example",
    phone: "+39 011 000 1009",
    location: "Torino · HQ",
    shortDescription:
      "Supporta contratti, compliance e questioni legali del gruppo.",
    responsibilities: ["contratti", "compliance", "privacy", "questioni legali"],
    tags: ["legal", "compliance", "contratti", "privacy"],
  },
  {
    oldId: "p-010",
    firstName: "Paolo",
    lastName: "Ricci",
    role: "IT Service Desk Lead",
    departmentOldId: "it",
    type: "hq",
    email: "paolo.ricci@pcg.example",
    phone: "+39 011 000 1010",
    location: "Torino · HQ",
    shortDescription:
      "Punto di riferimento per strumenti digitali, accessi e supporto IT.",
    responsibilities: [
      "supporto IT",
      "accessi",
      "hardware",
      "strumenti digitali",
    ],
    tags: ["it", "digital", "supporto", "primoup"],
  },
  {
    oldId: "p-011",
    firstName: "Valentina",
    lastName: "Costa",
    role: "Controller",
    departmentOldId: "finance",
    managerOldId: "p-002",
    type: "hq",
    email: "valentina.costa@pcg.example",
    phone: "+39 011 000 1011",
    location: "Torino · HQ",
    shortDescription:
      "Segue analisi di costo, forecast e supporto al controllo di gestione.",
    responsibilities: ["forecast", "analisi costi", "report mensili", "finance"],
    tags: ["finance", "controlling", "forecast"],
  },
  {
    oldId: "p-012",
    firstName: "Stefano",
    lastName: "De Luca",
    role: "People Experience Specialist",
    departmentOldId: "cultura",
    managerOldId: "p-003",
    type: "hq",
    email: "stefano.deluca@pcg.example",
    phone: "+39 011 000 1012",
    location: "Torino · HQ",
    shortDescription:
      "Cura iniziative di engagement, comunicazione interna e cultura di gruppo.",
    responsibilities: [
      "engagement",
      "comunicazione interna",
      "cultura",
      "iniziative persone",
    ],
    tags: ["cultura", "engagement", "people"],
  },
  {
    oldId: "p-013",
    firstName: "Martina",
    lastName: "Greco",
    role: "Digital Marketing Specialist",
    departmentOldId: "marketing",
    managerOldId: "p-005",
    type: "hq",
    email: "martina.greco@pcg.example",
    phone: "+39 011 000 1013",
    location: "Torino · HQ",
    shortDescription:
      "Gestisce campagne digitali, performance ads e contenuti per le cliniche.",
    responsibilities: ["digital marketing", "ads", "contenuti", "performance"],
    tags: ["marketing", "digital", "ads"],
  },
  {
    oldId: "p-014",
    firstName: "Roberto",
    lastName: "Fontana",
    role: "Head of Network Operations",
    departmentOldId: "operations",
    type: "hq",
    networkRole: "head",
    email: "roberto.fontana@pcg.example",
    phone: "+39 011 000 1014",
    location: "Torino · HQ",
    shortDescription:
      "Coordina Operations e il network territoriale: District Manager, processi e supporto alle cliniche.",
    responsibilities: [
      "processi operativi",
      "network",
      "district manager",
      "supporto cliniche",
      "operations",
    ],
    tags: ["operations", "network", "hq"],
    isOrgRoot: true,
  },
  {
    oldId: "p-015",
    firstName: "Ilaria",
    lastName: "Serra",
    role: "IT Systems Analyst",
    departmentOldId: "it",
    managerOldId: "p-010",
    type: "hq",
    email: "ilaria.serra@pcg.example",
    phone: "+39 011 000 1015",
    location: "Torino · HQ",
    shortDescription:
      "Analizza esigenze applicative e supporta l’evoluzione di PrimoUp.",
    responsibilities: ["primoup", "applicazioni", "analisi requisiti", "IT"],
    tags: ["it", "primoup", "sistemi"],
  },
  {
    oldId: "p-016",
    firstName: "Alessandro",
    lastName: "Vitale",
    role: "District Manager",
    departmentOldId: "network",
    managerOldId: "p-014",
    type: "network",
    networkRole: "district-manager",
    districtOldId: "centro",
    email: "alessandro.vitale@pcg.example",
    phone: "+39 011 000 1016",
    location: "Roma · Network",
    shortDescription:
      "Coordina Area Manager e performance del distretto Centro.",
    responsibilities: [
      "district manager",
      "performance di rete",
      "governance territoriale",
    ],
    tags: ["district manager", "network", "centro"],
  },
  {
    oldId: "p-017",
    firstName: "Silvia",
    lastName: "Lombardi",
    role: "Area Manager",
    departmentOldId: "network",
    managerOldId: "p-008",
    type: "network",
    networkRole: "area-manager",
    districtOldId: "nord",
    email: "silvia.lombardi@pcg.example",
    phone: "+39 011 000 1017",
    location: "Milano · Network",
    shortDescription:
      "Supporta le cliniche dell’area Lombardia su obiettivi e operatività.",
    responsibilities: [
      "area manager",
      "cliniche Lombardia",
      "supporto manageriale",
    ],
    tags: ["area manager", "network", "lombardia"],
  },
  {
    oldId: "p-018",
    firstName: "Giorgio",
    lastName: "Marchetti",
    role: "Area Manager",
    departmentOldId: "network",
    managerOldId: "p-016",
    type: "network",
    networkRole: "area-manager",
    districtOldId: "centro",
    email: "giorgio.marchetti@pcg.example",
    phone: "+39 011 000 1018",
    location: "Roma · Network",
    shortDescription:
      "Segue le cliniche del Lazio e coordina i referenti locali.",
    responsibilities: [
      "area manager",
      "cliniche Lazio",
      "coordinamento locale",
    ],
    tags: ["area manager", "network", "lazio"],
  },
  {
    oldId: "p-021",
    firstName: "Michele",
    lastName: "Rinaldi",
    role: "District Manager",
    departmentOldId: "network",
    managerOldId: "p-014",
    type: "network",
    networkRole: "district-manager",
    districtOldId: "sud",
    email: "michele.rinaldi@pcg.example",
    phone: "+39 011 000 1021",
    location: "Napoli · Network",
    shortDescription: "Coordina Area Manager e performance del distretto Sud.",
    responsibilities: [
      "district manager",
      "performance di rete",
      "governance territoriale",
    ],
    tags: ["district manager", "network", "sud"],
  },
  {
    oldId: "p-019",
    firstName: "Anna",
    lastName: "Barbieri",
    role: "Area Manager",
    departmentOldId: "network",
    managerOldId: "p-021",
    type: "network",
    networkRole: "area-manager",
    districtOldId: "sud",
    email: "anna.barbieri@pcg.example",
    phone: "+39 011 000 1019",
    location: "Napoli · Network",
    shortDescription:
      "Coordina le cliniche del Sud e supporta i team sul campo.",
    responsibilities: [
      "area manager",
      "cliniche Sud",
      "supporto operativo",
      "network",
    ],
    tags: ["area manager", "network", "sud"],
  },
  {
    oldId: "p-020",
    firstName: "Federica",
    lastName: "Neri",
    role: "Payroll Specialist",
    departmentOldId: "hr",
    managerOldId: "p-001",
    type: "hq",
    email: "federica.neri@pcg.example",
    phone: "+39 011 000 1020",
    location: "Torino · HQ",
    shortDescription:
      "Gestisce cicli payroll, cedolini e supporto amministrativo alle persone.",
    responsibilities: ["payroll", "cedolini", "amministrazione HR", "contratti"],
    tags: ["hr", "payroll", "amministrazione"],
  },
];

const DISTRICTS: SeedDistrict[] = [
  {
    oldId: "nord",
    name: "District Nord",
    slug: "nord",
    shortName: "Nord",
    managerOldId: "p-008",
    description:
      "Copre le strutture del Nord Italia, con focus su Piemonte e Lombardia.",
    order: 1,
  },
  {
    oldId: "centro",
    name: "District Centro",
    slug: "centro",
    shortName: "Centro",
    managerOldId: "p-016",
    description:
      "Coordina le cliniche del Centro Italia, con riferimento sul Lazio.",
    order: 2,
  },
  {
    oldId: "sud",
    name: "District Sud",
    slug: "sud",
    shortName: "Sud",
    managerOldId: "p-021",
    description:
      "Segue le cliniche del Sud Italia e supporta i team sul territorio.",
    order: 3,
  },
];

const CLINICS: SeedClinic[] = [
  { oldId: "cl-to-centro", name: "Torino Centro", slug: "torino-centro", city: "Torino", region: "Piemonte", address: "Via Roma 12", districtOldId: "nord", areaManagerOldId: "p-007", order: 1 },
  { oldId: "cl-to-mirafiori", name: "Torino Mirafiori", slug: "torino-mirafiori", city: "Torino", region: "Piemonte", districtOldId: "nord", areaManagerOldId: "p-007", order: 2 },
  { oldId: "cl-asti", name: "Asti", slug: "asti", city: "Asti", region: "Piemonte", districtOldId: "nord", areaManagerOldId: "p-007", order: 3 },
  { oldId: "cl-alessandria", name: "Alessandria", slug: "alessandria", city: "Alessandria", region: "Piemonte", districtOldId: "nord", areaManagerOldId: "p-007", order: 4 },
  { oldId: "cl-cuneo", name: "Cuneo", slug: "cuneo", city: "Cuneo", region: "Piemonte", districtOldId: "nord", areaManagerOldId: "p-007", order: 5 },
  { oldId: "cl-mi-duomo", name: "Milano Duomo", slug: "milano-duomo", city: "Milano", region: "Lombardia", districtOldId: "nord", areaManagerOldId: "p-017", order: 6 },
  { oldId: "cl-mi-navigli", name: "Milano Navigli", slug: "milano-navigli", city: "Milano", region: "Lombardia", districtOldId: "nord", areaManagerOldId: "p-017", order: 7 },
  { oldId: "cl-monza", name: "Monza", slug: "monza", city: "Monza", region: "Lombardia", districtOldId: "nord", areaManagerOldId: "p-017", order: 8 },
  { oldId: "cl-bergamo", name: "Bergamo", slug: "bergamo", city: "Bergamo", region: "Lombardia", districtOldId: "nord", areaManagerOldId: "p-017", order: 9 },
  { oldId: "cl-como", name: "Como", slug: "como", city: "Como", region: "Lombardia", districtOldId: "nord", areaManagerOldId: "p-017", order: 10 },
  { oldId: "cl-roma-prati", name: "Roma Prati", slug: "roma-prati", city: "Roma", region: "Lazio", districtOldId: "centro", areaManagerOldId: "p-018", order: 11 },
  { oldId: "cl-roma-eur", name: "Roma Eur", slug: "roma-eur", city: "Roma", region: "Lazio", districtOldId: "centro", areaManagerOldId: "p-018", order: 12 },
  { oldId: "cl-roma-tiburtina", name: "Roma Tiburtina", slug: "roma-tiburtina", city: "Roma", region: "Lazio", districtOldId: "centro", areaManagerOldId: "p-018", order: 13 },
  { oldId: "cl-tivoli", name: "Tivoli", slug: "tivoli", city: "Tivoli", region: "Lazio", districtOldId: "centro", areaManagerOldId: "p-018", order: 14 },
  { oldId: "cl-frosinone", name: "Frosinone", slug: "frosinone", city: "Frosinone", region: "Lazio", districtOldId: "centro", areaManagerOldId: "p-018", order: 15 },
  { oldId: "cl-napoli", name: "Napoli Centro", slug: "napoli-centro", city: "Napoli", region: "Campania", districtOldId: "sud", areaManagerOldId: "p-019", order: 16 },
  { oldId: "cl-salerno", name: "Salerno", slug: "salerno", city: "Salerno", region: "Campania", districtOldId: "sud", areaManagerOldId: "p-019", order: 17 },
  { oldId: "cl-bari", name: "Bari", slug: "bari", city: "Bari", region: "Puglia", districtOldId: "sud", areaManagerOldId: "p-019", order: 18 },
  { oldId: "cl-lecce", name: "Lecce", slug: "lecce", city: "Lecce", region: "Puglia", districtOldId: "sud", areaManagerOldId: "p-019", order: 19 },
  { oldId: "cl-catania", name: "Catania", slug: "catania", city: "Catania", region: "Sicilia", districtOldId: "sud", areaManagerOldId: "p-019", order: 20 },
];

export const run = mutation({
  args: { force: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const existingSeedMeta = await ctx.db
      .query("meta")
      .withIndex("by_key", (q) => q.eq("key", SEED_KEY))
      .unique();

    if (
      existingSeedMeta &&
      existingSeedMeta.value === SEED_VERSION &&
      !args.force
    ) {
      return {
        skipped: true,
        message: "Seed già eseguito. Usa force:true solo in sviluppo.",
      };
    }

    if (args.force) {
      // Full wipe — never reuse IDs from documents deleted here.
      for (const clinic of await ctx.db.query("clinics").collect()) {
        await ctx.db.delete(clinic._id);
      }
      for (const district of await ctx.db.query("districts").collect()) {
        await ctx.db.delete(district._id);
      }
      for (const person of await ctx.db.query("people").collect()) {
        await ctx.db.delete(person._id);
      }
      for (const dept of await ctx.db.query("departments").collect()) {
        await ctx.db.delete(dept._id);
      }
      for (const m of await ctx.db.query("meta").collect()) {
        await ctx.db.delete(m._id);
      }
    }

    const timestamp = now();
    const deptMap = new Map<string, Id<"departments">>();
    const peopleMap = new Map<string, Id<"people">>();
    const districtMap = new Map<string, Id<"districts">>();

    for (const dept of DEPARTMENTS) {
      const id = await ctx.db.insert("departments", {
        name: dept.name,
        slug: dept.slug,
        shortDescription: dept.shortDescription,
        description: dept.description,
        contactFor: dept.contactFor,
        tags: dept.tags,
        order: dept.order,
        organizationalPlacement: dept.organizationalPlacement,
        active: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      deptMap.set(dept.oldId, id);
    }

    for (const person of PEOPLE) {
      const departmentId = deptMap.get(person.departmentOldId);
      if (!departmentId) {
        throw new Error(
          `Seed: dipartimento «${person.departmentOldId}» mancante per persona «${person.oldId}».`,
        );
      }
      const id = await ctx.db.insert("people", {
        firstName: person.firstName,
        lastName: person.lastName,
        role: person.role,
        departmentId,
        type: person.type,
        networkRole: person.networkRole,
        email: person.email,
        phone: person.phone,
        location: person.location,
        shortDescription: person.shortDescription,
        responsibilities: person.responsibilities,
        tags: person.tags,
        active: true,
        isOrgRoot: person.isOrgRoot,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      peopleMap.set(person.oldId, id);
    }

    // Resolve managerId on freshly inserted people only
    for (const person of PEOPLE) {
      const id = peopleMap.get(person.oldId);
      if (!id) {
        throw new Error(
          `Seed: persona «${person.oldId}» non presente in peopleMap dopo gli insert.`,
        );
      }
      if (!person.managerOldId) continue;
      const managerId = peopleMap.get(person.managerOldId);
      if (!managerId) {
        throw new Error(
          `Seed: manager «${person.managerOldId}» mancante per persona «${person.oldId}».`,
        );
      }
      await ctx.db.patch(id, { managerId, updatedAt: timestamp });
    }

    for (const district of DISTRICTS) {
      const managerId = peopleMap.get(district.managerOldId);
      if (!managerId) {
        throw new Error(
          `Seed: District Manager «${district.managerOldId}» mancante per distretto «${district.oldId}».`,
        );
      }
      const id = await ctx.db.insert("districts", {
        name: district.name,
        slug: district.slug,
        shortName: district.shortName,
        managerId,
        description: district.description,
        order: district.order,
        active: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      districtMap.set(district.oldId, id);
    }

    // Network people → districtId
    for (const person of PEOPLE) {
      if (!person.districtOldId) continue;
      const id = peopleMap.get(person.oldId);
      if (!id) {
        throw new Error(
          `Seed: persona «${person.oldId}» non presente in peopleMap per districtId.`,
        );
      }
      const districtId = districtMap.get(person.districtOldId);
      if (!districtId) {
        throw new Error(
          `Seed: distretto «${person.districtOldId}» mancante per persona «${person.oldId}».`,
        );
      }
      await ctx.db.patch(id, { districtId, updatedAt: timestamp });
    }

    // Department heads
    for (const dept of DEPARTMENTS) {
      if (!dept.headOldId) continue;
      const deptId = deptMap.get(dept.oldId);
      if (!deptId) {
        throw new Error(
          `Seed: dipartimento «${dept.oldId}» non presente in deptMap per headId.`,
        );
      }
      const headId = peopleMap.get(dept.headOldId);
      if (!headId) {
        throw new Error(
          `Seed: head «${dept.headOldId}» mancante per dipartimento «${dept.oldId}».`,
        );
      }
      await ctx.db.patch(deptId, { headId, updatedAt: timestamp });
    }

    for (const clinic of CLINICS) {
      const districtId = districtMap.get(clinic.districtOldId);
      const areaManagerId = peopleMap.get(clinic.areaManagerOldId);
      if (!districtId) {
        throw new Error(
          `Seed: distretto «${clinic.districtOldId}» mancante per clinica «${clinic.oldId}».`,
        );
      }
      if (!areaManagerId) {
        throw new Error(
          `Seed: Area Manager «${clinic.areaManagerOldId}» mancante per clinica «${clinic.oldId}».`,
        );
      }
      await ctx.db.insert("clinics", {
        name: clinic.name,
        slug: clinic.slug,
        city: clinic.city,
        region: clinic.region,
        address: clinic.address,
        districtId,
        areaManagerId,
        active: true,
        order: clinic.order,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    // Always write a fresh meta row after force wipe; never patch a pre-wipe id.
    if (args.force) {
      await ctx.db.insert("meta", {
        key: SEED_KEY,
        value: SEED_VERSION,
        updatedAt: timestamp,
      });
    } else if (existingSeedMeta) {
      await ctx.db.patch(existingSeedMeta._id, {
        value: SEED_VERSION,
        updatedAt: timestamp,
      });
    } else {
      await ctx.db.insert("meta", {
        key: SEED_KEY,
        value: SEED_VERSION,
        updatedAt: timestamp,
      });
    }

    return {
      skipped: false,
      departments: deptMap.size,
      people: peopleMap.size,
      districts: districtMap.size,
      clinics: CLINICS.length,
    };
  },
});

export const clearSeedFlag = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("meta")
      .withIndex("by_key", (q) => q.eq("key", SEED_KEY))
      .unique();
    if (existing) await ctx.db.delete(existing._id);
  },
});

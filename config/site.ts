export const siteConfig = {
  /** App product name — change here if rebranded (e.g. to "PCG Connect"). */
  appName: "PCG People",
  organizationName: "Primo Caredent Group",
  organizationShortName: "PCG",
  description:
    "Scopri chi fa cosa in PCG, trova il riferimento che ti serve e naviga la nostra organizzazione.",
  nav: [
    { label: "Persone", href: "/persone" },
    { label: "Dipartimenti", href: "/dipartimenti" },
    { label: "Organigramma", href: "/organizzazione" },
    { label: "Network", href: "/network" },
  ],
  footer: {
    privacyHref: "#",
    contactsHref: "#",
  },
} as const;

export type NavItem = (typeof siteConfig.nav)[number];

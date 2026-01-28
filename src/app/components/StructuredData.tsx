type StructuredDataProps = {
  data: Record<string, unknown>;
};

function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}

export function WebsiteSchema() {
  return (
    <StructuredData
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Yamalverse",
        url: "https://yamalverse.com",
        description:
          "Track Lamine Yamal goals, assists, appearances, trophies, and milestones with a clean, football-focused dashboard.",
      }}
    />
  );
}

export function PersonSchema() {
  return (
    <StructuredData
      data={{
        "@context": "https://schema.org",
        "@type": "Person",
        name: "Lamine Yamal",
        birthDate: "2007-07-13",
        nationality: "Spanish",
        description:
          "Lamine Yamal is a Spanish footballer known for his performances with FC Barcelona and Spain.",
        affiliation: {
          "@type": "SportsTeam",
          name: "FC Barcelona",
        },
      }}
    />
  );
}

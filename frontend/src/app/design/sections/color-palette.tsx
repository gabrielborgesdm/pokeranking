const pokemonColors = [
  { name: "Pokemon Red", variable: "pokemon-red", class: "bg-pokemon-red" },
  {
    name: "Pokemon Red Light",
    variable: "pokemon-red-light",
    class: "bg-pokemon-red-light",
  },
  {
    name: "Pokemon Red Dark",
    variable: "pokemon-red-dark",
    class: "bg-pokemon-red-dark",
  },
  {
    name: "Pokemon Yellow",
    variable: "pokemon-yellow",
    class: "bg-pokemon-yellow",
  },
  {
    name: "Pokemon Yellow Light",
    variable: "pokemon-yellow-light",
    class: "bg-pokemon-yellow-light",
  },
  {
    name: "Pokemon Yellow Dark",
    variable: "pokemon-yellow-dark",
    class: "bg-pokemon-yellow-dark",
  },
  { name: "Pokemon Blue", variable: "pokemon-blue", class: "bg-pokemon-blue" },
  {
    name: "Pokemon Blue Light",
    variable: "pokemon-blue-light",
    class: "bg-pokemon-blue-light",
  },
  {
    name: "Pokemon Blue Dark",
    variable: "pokemon-blue-dark",
    class: "bg-pokemon-blue-dark",
  },
  { name: "Pokemon Navy", variable: "pokemon-navy", class: "bg-pokemon-navy" },
];

const semanticColors = [
  { name: "Primary", variable: "primary", class: "bg-primary" },
  { name: "Secondary", variable: "secondary", class: "bg-secondary" },
  { name: "Accent", variable: "accent", class: "bg-accent" },
  { name: "Muted", variable: "muted", class: "bg-muted" },
  { name: "Destructive", variable: "destructive", class: "bg-destructive" },
];

export function ColorPalette() {
  return (
    <section className="space-y-8">
      <h2 className="text-2xl font-semibold">Color Palette</h2>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Pokemon Brand Colors</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {pokemonColors.map((color) => (
            <div key={color.variable} className="space-y-2">
              <div className={`${color.class} h-20 rounded-lg shadow-md`} />
              <div className="text-sm">
                <p className="font-medium">{color.name}</p>
                <p className="text-muted-foreground font-mono text-xs">
                  --{color.variable}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Semantic Colors</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {semanticColors.map((color) => (
            <div key={color.variable} className="space-y-2">
              <div className={`${color.class} h-20 rounded-lg shadow-md`} />
              <div className="text-sm">
                <p className="font-medium">{color.name}</p>
                <p className="text-muted-foreground font-mono text-xs">
                  --{color.variable}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

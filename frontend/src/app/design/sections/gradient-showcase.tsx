const brandGradients = [
  {
    name: "Pokemon Red",
    class: "gradient-pokemon-red",
    description: "Light to dark red",
  },
  {
    name: "Pokemon Yellow",
    class: "gradient-pokemon-yellow",
    description: "Light to dark yellow",
  },
  {
    name: "Pokemon Blue",
    class: "gradient-pokemon-blue",
    description: "Light to dark blue",
  },
  {
    name: "Pokeball",
    class: "gradient-pokeball",
    description: "Classic Pokeball design",
  },
  {
    name: "Sunset",
    class: "gradient-pokemon-sunset",
    description: "Yellow to red",
  },
  {
    name: "Ocean",
    class: "gradient-pokemon-ocean",
    description: "Blue to navy",
  },
];

const typeGradients = [
  {
    name: "Grass Type",
    class: "gradient-type-grass",
    description: "Emerald to green",
  },
  {
    name: "Water Type",
    class: "gradient-type-water",
    description: "Blue to cyan",
  },
  {
    name: "Fire Type",
    class: "gradient-type-fire",
    description: "Orange to red",
  },
  {
    name: "Electric Type",
    class: "gradient-type-electric",
    description: "Yellow to amber",
  },
  {
    name: "Special",
    class: "gradient-type-special",
    description: "Red to pink",
  },
];

export function GradientShowcase() {
  return (
    <section className="space-y-8">
      <h2 className="text-2xl font-semibold">Gradients</h2>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Pokemon Type Gradients</h3>
          <p className="text-sm text-muted-foreground">
            For ranking cards and type indicators
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {typeGradients.map((gradient) => (
              <div key={gradient.name} className="space-y-2">
                <div
                  className={`${gradient.class} h-24 rounded-xl shadow-lg flex items-end p-3`}
                >
                  <span className="font-semibold text-sm">#1</span>
                </div>
                <div className="text-sm">
                  <p className="font-medium">{gradient.name}</p>
                  <p className="text-muted-foreground font-mono text-xs">
                    .{gradient.class}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Brand Gradients</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {brandGradients.map((gradient) => (
              <div key={gradient.name} className="space-y-2">
                <div
                  className={`${gradient.class} h-32 rounded-lg shadow-md`}
                />
                <div className="text-sm">
                  <p className="font-medium">{gradient.name}</p>
                  <p className="text-muted-foreground">{gradient.description}</p>
                  <p className="text-muted-foreground font-mono text-xs">
                    .{gradient.class}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

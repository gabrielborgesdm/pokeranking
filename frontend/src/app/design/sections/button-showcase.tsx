import { Button } from "@/components/ui/button";

export function ButtonShowcase() {
  return (
    <section className="space-y-8">
      <h2 className="text-2xl font-semibold">Buttons</h2>

      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Variants</h3>
          <div className="flex flex-wrap gap-4">
            <Button>Primary (Default)</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Sizes</h3>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">+</Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Pokemon Themed</h3>
          <div className="flex flex-wrap gap-4">
            <Button className="bg-pokemon-red hover:bg-pokemon-red-dark">
              Catch Pokemon
            </Button>
            <Button className="bg-pokemon-blue hover:bg-pokemon-blue-dark">
              Water Type
            </Button>
            <Button className="bg-pokemon-yellow hover:bg-pokemon-yellow-dark text-pokemon-navy">
              Electric Type
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

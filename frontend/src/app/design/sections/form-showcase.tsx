import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function FormShowcase() {
  return (
    <section className="space-y-8">
      <h2 className="text-2xl font-semibold">Form Components</h2>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Inputs</h3>

          <div className="space-y-2">
            <Label htmlFor="pokemon-name">Pokemon Name</Label>
            <Input id="pokemon-name" placeholder="Enter Pokemon name..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Describe your Pokemon..." />
          </div>

          <div className="space-y-2">
            <Label>Pokemon Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fire">Fire</SelectItem>
                <SelectItem value="water">Water</SelectItem>
                <SelectItem value="grass">Grass</SelectItem>
                <SelectItem value="electric">Electric</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Toggles & Choices</h3>

          <div className="flex items-center space-x-2">
            <Checkbox id="shiny" />
            <Label htmlFor="shiny">Shiny Pokemon</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="notifications" />
            <Label htmlFor="notifications">Enable notifications</Label>
          </div>

          <div className="space-y-2">
            <Label>Starter Pokemon</Label>
            <RadioGroup defaultValue="bulbasaur">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bulbasaur" id="bulbasaur" />
                <Label htmlFor="bulbasaur">Bulbasaur</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="charmander" id="charmander" />
                <Label htmlFor="charmander">Charmander</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="squirtle" id="squirtle" />
                <Label htmlFor="squirtle">Squirtle</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
    </section>
  );
}

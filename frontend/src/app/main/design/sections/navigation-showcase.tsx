import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function NavigationShowcase() {
  return (
    <section className="space-y-8">
      <h2 className="text-2xl font-semibold">Navigation Components</h2>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Tabs</h3>
          <Tabs defaultValue="pokemon" className="w-full">
            <TabsList>
              <TabsTrigger value="pokemon">Pokemon</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="pokedex">Pokedex</TabsTrigger>
            </TabsList>
            <TabsContent value="pokemon" className="p-4 border rounded-lg mt-2">
              Your Pokemon team appears here.
            </TabsContent>
            <TabsContent value="items" className="p-4 border rounded-lg mt-2">
              Your bag items appear here.
            </TabsContent>
            <TabsContent value="pokedex" className="p-4 border rounded-lg mt-2">
              Your Pokedex entries appear here.
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Badges</h3>
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge className="bg-pokemon-red">Fire</Badge>
            <Badge className="bg-pokemon-blue">Water</Badge>
            <Badge className="bg-pokemon-yellow text-pokemon-navy">
              Electric
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Dropdown Menu</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Open Menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Pokemon Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View Summary</DropdownMenuItem>
              <DropdownMenuItem>Give Item</DropdownMenuItem>
              <DropdownMenuItem>Check Moves</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Release Pokemon
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </section>
  );
}

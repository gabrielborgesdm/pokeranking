import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const pokemonData = [
  { id: 1, name: "Bulbasaur", type: "Grass/Poison", hp: 45 },
  { id: 4, name: "Charmander", type: "Fire", hp: 39 },
  { id: 7, name: "Squirtle", type: "Water", hp: 44 },
  { id: 25, name: "Pikachu", type: "Electric", hp: 35 },
];

export function DataDisplayShowcase() {
  return (
    <section className="space-y-8">
      <h2 className="text-2xl font-semibold">Data Display Components</h2>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Cards</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Pikachu</CardTitle>
                <CardDescription>#025 - Electric Type</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  It raises its tail to check its surroundings. The tail is
                  sometimes struck by lightning in this pose.
                </p>
              </CardContent>
              <CardFooter>
                <Badge className="bg-pokemon-yellow text-pokemon-navy">
                  Electric
                </Badge>
              </CardFooter>
            </Card>

            <Card className="border-pokemon-red/50 bg-pokemon-red/5">
              <CardHeader>
                <CardTitle>Charizard</CardTitle>
                <CardDescription>#006 - Fire/Flying Type</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  It spits fire that is hot enough to melt boulders. Known to
                  cause forest fires unintentionally.
                </p>
              </CardContent>
              <CardFooter className="gap-2">
                <Badge className="bg-pokemon-red">Fire</Badge>
                <Badge variant="secondary">Flying</Badge>
              </CardFooter>
            </Card>

            <Card className="border-pokemon-blue/50 bg-pokemon-blue/5">
              <CardHeader>
                <CardTitle>Blastoise</CardTitle>
                <CardDescription>#009 - Water Type</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  It crushes its foe under its heavy body to cause fainting. In
                  a pinch, it will withdraw inside its shell.
                </p>
              </CardContent>
              <CardFooter>
                <Badge className="bg-pokemon-blue">Water</Badge>
              </CardFooter>
            </Card>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Avatars</h3>
          <div className="flex gap-4">
            <Avatar>
              <AvatarImage src="/pokemon/pikachu.png" alt="Pikachu" />
              <AvatarFallback className="bg-pokemon-yellow text-pokemon-navy">
                PK
              </AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage src="/pokemon/charizard.png" alt="Charizard" />
              <AvatarFallback className="bg-pokemon-red text-white">
                CH
              </AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage src="/pokemon/blastoise.png" alt="Blastoise" />
              <AvatarFallback className="bg-pokemon-blue text-white">
                BL
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">HP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pokemonData.map((pokemon) => (
                <TableRow key={pokemon.id}>
                  <TableCell className="font-medium">{pokemon.id}</TableCell>
                  <TableCell>{pokemon.name}</TableCell>
                  <TableCell>{pokemon.type}</TableCell>
                  <TableCell className="text-right">{pokemon.hp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Skeleton Loading</h3>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

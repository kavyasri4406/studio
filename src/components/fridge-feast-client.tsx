
'use client';

import { useState, type FormEvent } from 'react';
import {
  getRecipeSuggestions,
  getRecipeDetails,
  type RecipeDetails,
} from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  UtensilsCrossed,
  ArrowLeft,
  Clock,
  Flame,
  Soup,
  Search,
} from 'lucide-react';

type ViewState =
  | 'initial'
  | 'loadingSuggestions'
  | 'suggestionsLoaded'
  | 'loadingRecipe'
  | 'recipeLoaded';

export function FridgeFeastClient() {
  const [view, setView] = useState<ViewState>('initial');
  const [ingredients, setIngredients] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recipe, setRecipe] = useState<RecipeDetails | null>(null);
  const { toast } = useToast();

  const handleSuggestionSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setView('loadingSuggestions');
    const result = await getRecipeSuggestions(ingredients);
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
      setView('initial');
    } else if (result.suggestions) {
      setSuggestions(result.suggestions);
      setView('suggestionsLoaded');
    }
  };

  const handleRecipeSelect = async (recipeName: string) => {
    setView('loadingRecipe');
    const result = await getRecipeDetails(recipeName);
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
      setView('suggestionsLoaded');
    } else {
      setRecipe(result as RecipeDetails);
      setView('recipeLoaded');
    }
  };

  const handleBackToSuggestions = () => {
    setRecipe(null);
    setView('suggestionsLoaded');
  };

  const handleNewSearch = () => {
    setIngredients('');
    setSuggestions([]);
    setRecipe(null);
    setView('initial');
  };

  const isLoading =
    view === 'loadingSuggestions' || view === 'loadingRecipe';

  return (
    <Card className="w-full shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">
          What's in your fridge?
        </CardTitle>
        <CardDescription>
          Enter your ingredients, separated by commas, to discover delicious
          recipes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {view !== 'recipeLoaded' && view !== 'loadingRecipe' && (
          <form
            onSubmit={handleSuggestionSubmit}
            className="flex flex-col sm:flex-row gap-2 mb-6"
          >
            <Input
              name="ingredients"
              placeholder="e.g., chicken breast, tomatoes, basil"
              className="flex-grow"
              required
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {view === 'loadingSuggestions' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : <Search className="mr-2 h-4 w-4" />}
              Find Recipes
            </Button>
          </form>
        )}

        {view === 'loadingSuggestions' && (
          <div className="text-center p-8 animate-in fade-in duration-300">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">
              Searching for the best recipes...
            </p>
          </div>
        )}

        {view === 'suggestionsLoaded' && (
          <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-headline font-semibold">
                Recipe Suggestions
              </h3>
              <Button variant="outline" size="sm" onClick={handleNewSearch}>
                New Search
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions.map((recipeName) => (
                <Card
                  key={recipeName}
                  onClick={() => handleRecipeSelect(recipeName)}
                  className="cursor-pointer hover:shadow-md hover:border-primary transition-all"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UtensilsCrossed className="w-5 h-5 text-accent" />
                      <span>{recipeName}</span>
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {view === 'loadingRecipe' && (
          <div className="text-center p-8 animate-in fade-in duration-300">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Preparing your recipe...</p>
          </div>
        )}

        {view === 'recipeLoaded' && recipe && (
          <div className="animate-in fade-in-50 duration-500">
            <Button
              variant="ghost"
              onClick={handleBackToSuggestions}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Suggestions
            </Button>
            <h2 className="text-3xl font-bold font-headline mb-2">
              {recipe.title}
            </h2>
            <p className="text-muted-foreground mb-6">{recipe.description}</p>

            <div className="flex flex-wrap gap-4 mb-6 text-sm">
              <Badge variant="secondary" className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> Prep: {recipe.prepTime}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2">
                <Flame className="w-4 h-4" /> Cook: {recipe.cookTime}
              </Badge>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <h3 className="text-xl font-semibold font-headline mb-3 border-b pb-2">
                  Ingredients
                </h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {recipe.ingredients.map((ing) => (
                    <li key={ing}>{ing}</li>
                  ))}
                </ul>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-xl font-semibold font-headline mb-3 border-b pb-2">
                  Instructions
                </h3>
                <ol className="list-decimal list-inside space-y-4">
                  {recipe.instructions.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}

        {view === 'initial' && (
          <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
            <Soup className="mx-auto h-12 w-12" />
            <p className="mt-4">Your recipe suggestions will appear here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

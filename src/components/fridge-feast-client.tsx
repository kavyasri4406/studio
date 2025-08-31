
'use client';

import { useState, type FormEvent, useEffect } from 'react';
import Image from 'next/image';
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
  Star,
  BookHeart,
} from 'lucide-react';

type ViewState =
  | 'initial'
  | 'loadingSuggestions'
  | 'suggestionsLoaded'
  | 'loadingRecipe'
  | 'recipeLoaded'
  | 'viewingFavorites';

export function FridgeFeastClient() {
  const [view, setView] = useState<ViewState>('initial');
  const [ingredients, setIngredients] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recipe, setRecipe] = useState<RecipeDetails | null>(null);
  const [favorites, setFavorites] = useState<RecipeDetails[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem('favoriteRecipes');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Failed to parse favorites from localStorage', error);
      // If parsing fails, it's safer to start with an empty list
      setFavorites([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
    } catch (error) {
      console.error('Failed to save favorites to localStorage', error);
    }
  }, [favorites]);

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

  const handleFavoriteRecipeSelect = (selectedRecipe: RecipeDetails) => {
    setRecipe(selectedRecipe);
    setView('recipeLoaded');
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

  const toggleFavorite = (recipeToToggle: RecipeDetails) => {
    const isFavorite = favorites.some(
      (fav) => fav.title === recipeToToggle.title
    );
    if (isFavorite) {
      setFavorites(
        favorites.filter((fav) => fav.title !== recipeToToggle.title)
      );
      toast({
        title: 'Removed from Favorites',
        description: `${recipeToToggle.title} has been removed from your favorites.`,
      });
    } else {
      setFavorites([...favorites, recipeToToggle]);
      toast({
        title: 'Added to Favorites!',
        description: `${recipeToToggle.title} has been saved to your favorites.`,
      });
    }
  };

  const handleViewFavorites = () => {
    setView('viewingFavorites');
  };

  const isLoading =
    view === 'loadingSuggestions' || view === 'loadingRecipe';

  const isCurrentRecipeFavorite =
    recipe && favorites.some((fav) => fav.title === recipe.title);

  return (
    <Card className="w-full shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">
          {view === 'viewingFavorites'
            ? 'Your Favorite Recipes'
            : "What's in your fridge?"}
        </CardTitle>
        <CardDescription>
          {view === 'viewingFavorites'
            ? 'Here are the recipes you saved for later.'
            : 'Enter your ingredients, separated by commas, to discover delicious recipes.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {view !== 'recipeLoaded' &&
          view !== 'loadingRecipe' &&
          view !== 'viewingFavorites' && (
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
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
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

        {(view === 'suggestionsLoaded' || view === 'initial') && (
          <div className="flex justify-end mb-4">
            {favorites.length > 0 && view !== 'viewingFavorites' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewFavorites}
              >
                <BookHeart className="mr-2 h-4 w-4" />
                View Favorites ({favorites.length})
              </Button>
            )}
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

        {view === 'viewingFavorites' && (
          <div className="animate-in fade-in duration-500">
            <div className="flex justify-end items-center mb-4">
              <Button variant="outline" size="sm" onClick={handleNewSearch}>
                New Search
              </Button>
            </div>
            {favorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favorites.map((favRecipe) => (
                  <Card
                    key={favRecipe.title}
                    onClick={() => handleFavoriteRecipeSelect(favRecipe)}
                    className="cursor-pointer hover:shadow-md hover:border-primary transition-all"
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        <span>{favRecipe.title}</span>
                      </CardTitle>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                <BookHeart className="mx-auto h-12 w-12" />
                <p className="mt-4">You haven't saved any favorites yet.</p>
              </div>
            )}
          </div>
        )}

        {view === 'loadingRecipe' && (
          <div className="text-center p-8 animate-in fade-in duration-300">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">
              Preparing your recipe... this might take a moment.
            </p>
          </div>
        )}

        {view === 'recipeLoaded' && recipe && (
          <div className="animate-in fade-in-50 duration-500">
            <div className="flex justify-between items-start mb-4">
              <Button
                variant="ghost"
                onClick={
                  suggestions.length > 0
                    ? handleBackToSuggestions
                    : handleViewFavorites
                }
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to {suggestions.length > 0 ? 'Suggestions' : 'Favorites'}
              </Button>
              <Button
                variant={isCurrentRecipeFavorite ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleFavorite(recipe)}
              >
                <Star
                  className={`mr-2 h-4 w-4 ${
                    isCurrentRecipeFavorite ? 'text-yellow-400 fill-yellow-400' : ''
                  }`}
                />
                {isCurrentRecipeFavorite
                  ? 'Saved to Favorites'
                  : 'Save to Favorites'}
              </Button>
            </div>

            {recipe.imageUrl && (
              <div className="mb-6 rounded-lg overflow-hidden shadow-lg aspect-video relative">
                <Image
                  src={recipe.imageUrl}
                  alt={`An image of ${recipe.title}`}
                  fill
                  style={{ objectFit: 'cover' }}
                  data-ai-hint="recipe food"
                />
              </div>
            )}

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
                  {recipe.instructions.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}

        {view === 'initial' && !isLoading && (
          <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
            <Soup className="mx-auto h-12 w-12" />
            <p className="mt-4">Your recipe suggestions will appear here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

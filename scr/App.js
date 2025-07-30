import React, { useState } from 'react';
import { ChefHat, Plus, X, Sparkles, Clock, Users, Search } from 'lucide-react';

const RecipeAIApp = () => {
  const [ingredients, setIngredients] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState('exact');

  const addIngredient = () => {
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim().toLowerCase())) {
      setIngredients([...ingredients, currentIngredient.trim().toLowerCase()]);
      setCurrentIngredient('');
    }
  };

  const removeIngredient = (ingredient) => {
    setIngredients(ingredients.filter(ing => ing !== ingredient));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addIngredient();
    }
  };

  const searchRecipes = async () => {
    if (ingredients.length === 0) return;
    
    setLoading(true);
    setRecipes([]);

    try {
      const searchTypeText = {
        'exact': 'uniquement avec ces ingrédients',
        'few': 'avec ces ingrédients plus 1-2 ingrédients supplémentaires maximum',
        'flexible': 'utilisant au moins la moitié de ces ingrédients'
      };

      const prompt = `Tu es un chef cuisinier expert. L'utilisateur a les ingrédients suivants : ${ingredients.join(', ')}.

Propose-moi 3 recettes ${searchTypeText[searchType]}. Pour chaque recette, réponds UNIQUEMENT avec un objet JSON valide dans ce format exact :

{
  "recipes": [
    {
      "name": "Nom de la recette",
      "description": "Description courte et appétissante",
      "ingredients": ["ingrédient 1", "ingrédient 2"],
      "instructions": ["étape 1", "étape 2", "étape 3"],
      "cookingTime": "20 minutes",
      "servings": 4,
      "difficulty": "Facile",
      "matchScore": 90
    }
  ]
}

IMPORTANT : Ta réponse doit être UNIQUEMENT ce JSON, sans aucun texte avant ou après. Ne commence pas par \`\`\`json et ne termine pas par \`\`\`.`;

      const response = await window.claude.complete(prompt);
      
      try {
        const parsedResponse = JSON.parse(response);
        if (parsedResponse.recipes && Array.isArray(parsedResponse.recipes)) {
          setRecipes(parsedResponse.recipes);
        } else {
          throw new Error('Format de réponse invalide');
        }
      } catch (parseError) {
        console.error('Erreur de parsing:', parseError);
        console.log('Réponse brute:', response);
        setRecipes([{
          name: "Erreur de traitement",
          description: "Impossible de traiter la réponse de l'IA. Veuillez réessayer.",
          ingredients: [],
          instructions: [],
          cookingTime: "N/A",
          servings: 0,
          difficulty: "N/A",
          matchScore: 0
        }]);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setRecipes([{
        name: "Erreur de connexion",
        description: "Impossible de se connecter au service de recettes. Veuillez réessayer.",
        ingredients: [],
        instructions: [],
        cookingTime: "N/A",
        servings: 0,
        difficulty: "N/A",
        matchScore: 0
      }]);
    }
    
    setLoading(false);
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case 'facile': return 'text-green-600 bg-green-100';
      case 'moyen': case 'moyenne': return 'text-yellow-600 bg-yellow-100';
      case 'difficile': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMatchColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <ChefHat className="w-12 h-12 text-orange-500 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Assistant Culinaire IA</h1>
          </div>
          <p className="text-lg text-gray-600">Découvrez des recettes délicieuses avec vos ingrédients</p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Vos ingrédients disponibles</h2>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={currentIngredient}
              onChange={(e) => setCurrentIngredient(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ajoutez un ingrédient..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              onClick={addIngredient}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
          </div>

          {/* Ingredients List */}
          {ingredients.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ingredient, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                  >
                    {ingredient}
                    <button
                      onClick={() => removeIngredient(ingredient)}
                      className="ml-1 hover:text-orange-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Search Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de recherche :</label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSearchType('exact')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  searchType === 'exact' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Uniquement ces ingrédients
              </button>
              <button
                onClick={() => setSearchType('few')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  searchType === 'few' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                + 1-2 ingrédients
              </button>
              <button
                onClick={() => setSearchType('flexible')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  searchType === 'flexible' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Utilisation flexible
              </button>
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={searchRecipes}
            disabled={ingredients.length === 0 || loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg font-medium"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Trouver des recettes
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        {recipes.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-orange-500" />
              Recettes suggérées
            </h2>
            
            {recipes.map((recipe, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-800">{recipe.name}</h3>
                    {recipe.matchScore && (
                      <span className={`text-sm font-medium ${getMatchColor(recipe.matchScore)}`}>
                        {recipe.matchScore}% compatible
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-4">{recipe.description}</p>
                  
                  <div className="flex gap-4 mb-4 flex-wrap">
                    {recipe.cookingTime && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        {recipe.cookingTime}
                      </div>
                    )}
                    {recipe.servings && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        {recipe.servings} portions
                      </div>
                    )}
                    {recipe.difficulty && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                        {recipe.difficulty}
                      </span>
                    )}
                  </div>

                  {recipe.ingredients && recipe.ingredients.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Ingrédients :</h4>
                      <div className="flex flex-wrap gap-1">
                        {recipe.ingredients.map((ingredient, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                            {ingredient}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {recipe.instructions && recipe.instructions.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Instructions :</h4>
                      <ol className="list-decimal list-inside space-y-1 text-gray-700">
                        {recipe.instructions.map((instruction, idx) => (
                          <li key={idx} className="text-sm leading-relaxed">{instruction}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {ingredients.length === 0 && (
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Ajoutez des ingrédients pour commencer à découvrir de délicieuses recettes !</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeAIApp;
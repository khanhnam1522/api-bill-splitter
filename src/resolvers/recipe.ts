import { Recipe } from "../entities/Recipe";
import {
  Arg,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { isAuth } from "../middleware/auth";
import { Item } from "../entities/Item";

@Resolver()
export class RecipeResolver {
  //get all recipes
  @Query(() => [Recipe])
  @UseMiddleware(isAuth)
  recipes(): Promise<Recipe[]> {
    return Recipe.find();
  }

  //get a single recipe by id
  @Query(() => Recipe, { nullable: true })
  @UseMiddleware(isAuth)
  recipe(@Arg("id") id: number): Promise<Recipe | undefined> {
    return Recipe.findOne(id);
  }

  //create a new recipe
  @Mutation(() => Recipe)
  @UseMiddleware(isAuth)
  async createRecipe(
    @Arg("name") name: string,
    @Arg("ingredients", () => [Item], { nullable : true }) ingredients: Item[],
    @Arg("notes", () => String, { nullable : true }) notes: string,
    @Arg("cookingInstructions", () => String, { nullable : true }) cookingInstructions: string,
    ): Promise<Recipe> {
    // 2 sql queries
    return Recipe.create({name, ingredients, notes, cookingInstructions}).save();
  }

  //edit a recipe
  @Mutation(() => Recipe, { nullable: true })
  @UseMiddleware(isAuth)
  async editRecipe(
    @Arg("id") id: number,
    @Arg("name") name: string,
  ): Promise<Recipe | null> {
    const recipe = await Recipe.findOne(id);
    if (!recipe) {
      return null;
    }
    if (name) {
      await Recipe.update({id}, {name})
    }
    return recipe;
  }

  //delete a recipe
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteRecipe(
    @Arg("id") id: number  
  ): Promise<boolean> {
    await Recipe.delete(id)
    return true;
  }
}
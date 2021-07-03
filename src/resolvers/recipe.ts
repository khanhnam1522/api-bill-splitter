import { Recipe } from "../entities/Recipe";
import {
  Arg,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { isAuth } from "../middleware/auth";
import { ItemRecipe } from "../entities/ItemRecipe";
import { In } from "typeorm";

@InputType()
class RecipeInput {
  @Field()
  name: string;

  @Field()
  cookingInstruction: string;

  @Field()
  notes: string;

  @Field((type) => [Number])
  items: number[];
}

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
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async createNewRecipe(@Arg("data") data: RecipeInput): Promise<boolean> {
    const { name, notes, cookingInstruction, items } = data;
    const batchItems = await ItemRecipe.find({
      where: {
        itemId: In(items),
      },
    });
    console.log(batchItems);
    return true;
    // return Recipe.create({ name, notes, cookingInstruction, batchItems }).save();
  }

  //edit a recipe
  @Mutation(() => Recipe, { nullable: true })
  @UseMiddleware(isAuth)
  async editRecipe(
    @Arg("id") id: number,
    @Arg("name") name: string
  ): Promise<Recipe | null> {
    const recipe = await Recipe.findOne(id);
    if (!recipe) {
      return null;
    }
    if (name) {
      await Recipe.update({ id }, { name });
    }
    return recipe;
  }

  //delete a recipe
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteRecipe(@Arg("id") id: number): Promise<boolean> {
    await Recipe.delete(id);
    return true;
  }
}

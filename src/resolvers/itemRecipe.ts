
import { Arg, Int, Mutation, Query, Resolver } from "type-graphql";
import { Item } from "../entities/Item";
import { Recipe } from "../entities/Recipe";
import { ItemRecipe } from "../entities/ItemRecipe";

@Resolver()
export class ItemRecipeResolver {
    @Mutation(() => Item)
    async createItem(@Arg("name") name: string) {
        return Item.create({name}).save();
    }

    @Mutation(() => Recipe)
    async createRecipe(@Arg("name") name: string) {
        return Item.create({name}).save();
    }

    @Mutation(() => Boolean)
    async addItemRecipe(
        @Arg("itemId", () => Int) itemId: number,
        @Arg("recipeId", () => Int) recipeId: number,
    ) {
        await ItemRecipe.create({ itemId, recipeId }).save();
        return true;
    }

    // @Mutation(() => Boolean)
    // async deleteItemRecipe(
    //     @Arg("recipeId", () => Int) itemId: number,
    // ) {
    //     await ItemRecipe.create({ itemId, recipeId }).save();
    //     return true;
    // }

    @Query(() => [Item])
    async items() {
        return Item.find();
    }

    @Query(() => [Recipe])
    async recipes() {
        return Recipe.find();
    }
}
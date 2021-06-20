import {
    BaseEntity,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryColumn
  } from "typeorm";
import { Item } from "./Item";
import { Recipe } from "./Recipe";

@Entity()
export class ItemRecipe extends BaseEntity {
    @PrimaryColumn()
    itemId: number;

    @PrimaryColumn()
    recipeId: number;

    @ManyToOne(() => Item, item => item.recipeConnection)
    @JoinColumn({name: "itemId"})
    item: Promise<Item>;

    @ManyToOne(() => Recipe, recipe => recipe.itemConnection)
    @JoinColumn({name:"recipeId"})
    recipe: Promise<Recipe>
}
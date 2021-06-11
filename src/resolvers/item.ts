import { Item } from "../entities/Item";
import {
    Arg,
    Int,
    Mutation,
    Query,
    Resolver,
    Root,
    UseMiddleware,
  } from "type-graphql";
  import { isAuth } from "../middleware/auth";

@Resolver()
export class ItemResolver {
    // get all items
    @Query(() => [Item])
    @UseMiddleware(isAuth)
    items(): Promise<Item[]> {
        return Item.find();
    }

    //get a single item by id
    @Query(() => Item, { nullable: true })
    @UseMiddleware(isAuth)
    item(@Arg("id") id: number): Promise<Item| undefined> {
        return Item.findOne(id);
    }

    // create a new item
    @Mutation(() => Item)
    @UseMiddleware(isAuth)
    async createItem(
        @Arg("name") name: string,
        @Arg("quantity", () => Int , { nullable: true })  quantity: number,
        @Arg("expiringDate", () => String, { nullable: true }) expiringDate: Date,
        @Arg("isLiquid") isLiquid: boolean,
        ): Promise<Item> {
        // 2 sql queries
        return await Item.create({name, quantity, expiringDate, isLiquid}).save();
    }

    // edit an item
    @Mutation(() => Item, { nullable: true })
    @UseMiddleware(isAuth)
    async editItem(
        @Arg("id") id: number,
        @Arg("name", () => String) name: string,
        @Arg("quantity", () => Int , { nullable: true })  quantity: number,
        @Arg("expiringDate", () => String , { nullable: true })  expiringDate: Date,
    ): Promise<Item | null> {
        const item = await Item.findOne(id);
        if (!item) {
            return null;
        }
        if (name) {
            await Item.update({id}, {name})
        }
        else if (quantity) {
            await Item.update({id}, {quantity})
        }
        else if (expiringDate) {
            await Item.update({id}, {expiringDate})
        }
        return item;
    }
    // delete an item
    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async deleteItem(
        @Arg("id") id: number  
    ): Promise<boolean> {
        await Item.delete(id);
        return true;
    }
}
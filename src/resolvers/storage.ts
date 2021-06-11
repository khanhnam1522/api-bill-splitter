import { Storage } from "../entities/Storage";
import {
  Arg,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { isAuth } from "../middleware/auth";

@Resolver()
export class StorageResolver {
  //get all storages
  @Query(() => [Storage])
  @UseMiddleware(isAuth)
  storages(): Promise<Storage[]> {
    return Storage.find();
  }

  //get a single storage by id
  @Query(() => Storage, { nullable: true })
  @UseMiddleware(isAuth)
  storage(@Arg("id") id: number): Promise<Storage | undefined> {
    return Storage.findOne(id);
  }

  //create a new storage
  @Mutation(() => Storage)
  @UseMiddleware(isAuth)
  async createStorage(
    @Arg("name") name: string ): Promise<Storage> {
    // 2 sql queries
    return Storage.create({name}).save();
  }

  //edit a bill
  @Mutation(() => Storage, { nullable: true })
  @UseMiddleware(isAuth)
  async editStorage(
    @Arg("id") id: number,
    @Arg("name") name: string,
  ): Promise<Storage | null> {
    const storage = await Storage.findOne(id);
    if (!storage) {
      return null;
    }
    if (name) {
      await Storage.update({id}, {name})
    }
    return storage;
  }

  //delete a storage
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteStorage(
    @Arg("id") id: number  
  ): Promise<boolean> {
    await Storage.delete(id)
    return true;
  }
}
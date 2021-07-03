import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { ItemRecipe } from "./ItemRecipe"

@ObjectType()
@Entity()
export class Item extends BaseEntity{
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column()
  name: string;

  @Field(() => Int)
  @Column({nullable: true, default: 0})
  quantity: number;

  @Field(() => String)
  @Column({nullable: true})
  expiringDate: Date;

  @Field()
  @Column()
  isLiquid: Boolean;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => Int)
  @Column({default: 1})
  creatorId: number;

  @OneToMany(() => ItemRecipe, ir => ir.recipe)
  recipeConnection: Promise<ItemRecipe>[];
}

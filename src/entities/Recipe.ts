import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable, ManyToOne } from "typeorm";
import { ItemRecipe } from "./ItemRecipe";

@ObjectType()
@Entity()
export class Recipe extends BaseEntity{
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column({unique: true})
  name: string;

  @Field(() => String)
  @Column()
  cookingInstructions: string;

  @Field(() => String)
  @Column()
  notes: string;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ItemRecipe, ir => ir.item)
  itemConnection: Promise<ItemRecipe>[];
}
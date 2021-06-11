import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany } from "typeorm";
import { Item } from "../entities/Item";

@ObjectType()
@Entity()
export class Recipe extends BaseEntity{
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column({unique: true})
  name: string;

  @Field(() => [Item])
  @Column({
      array: true
  })
  ingredients: Item[];

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
}
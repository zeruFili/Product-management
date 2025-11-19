import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum Category {
  ELECTRONICS = 'Electronics',
  FASHION = 'Fashion',
  HOME = 'Home',
  TOYS = 'Toys',
}

@Schema({
  timestamps: true,
})
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  stock: number;

  @Prop({ enum: Category, required: true })
  category: Category;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
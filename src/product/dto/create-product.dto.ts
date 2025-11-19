import { Category } from '../schemas/product.schema';

export class CreateProductDto {
  readonly name: string;          // Updated from title to name
  readonly description: string;
  readonly price: number;
  readonly stock: number;        // Added stock field
  readonly category: Category;
}
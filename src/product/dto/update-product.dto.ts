import { Category } from '../schemas/product.schema';

export class UpdateProductDto {
  readonly name?: string;        // Updated from title to name and made optional
  readonly description?: string; // Made optional
  readonly price?: number;       // Made optional
  readonly stock?: number;       // Made optional
  readonly category?: Category;   // Made optional
}
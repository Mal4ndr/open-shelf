import { ItemAvailabilityType } from '../schemas/item.schema';

export class CreateItemDto {
  name!: string;
  description?: string;
  image?: string;
  availability?: ItemAvailabilityType[];
}

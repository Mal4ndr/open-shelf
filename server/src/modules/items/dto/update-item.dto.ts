import { ItemAvailabilityType } from '../schemas/item.schema';

export class UpdateItemDto {
  name?: string;
  description?: string;
  image?: string;
  availability?: ItemAvailabilityType[];
}

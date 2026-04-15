import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Item, ItemDocument } from './schemas/item.schema';
import { Model } from 'mongoose';
import { UpdateItemDto } from './dto/update-item.dto';
import { GetItemsDto } from './dto/get-items.dto';

@Injectable()
export class ItemsService {
  constructor(@InjectModel(Item.name) private itemModel: Model<ItemDocument>) {}

  async getItems(query: GetItemsDto) {
    const filter: any = {};

    if (query.status) {
      filter.status = query.status;
    }

    if (query.ownerId) {
      filter.ownerId = query.ownerId;
    }

    return await this.itemModel.find(filter);
  }

  async getMyItems(userId: string) {
    return await this.itemModel.find({
      ownerId: userId,
    });
  }

  async getItem(itemId: string) {
    const item = await this.itemModel.findById(itemId);

    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found`);
    }

    return item;
  }

  async createItem(createItemDto: CreateItemDto, userId: string) {
    const item = await this.itemModel.create({
      ...createItemDto,
      ownerId: userId,
    });

    return item;
  }

  async updateItem(
    itemId: string,
    updateItemDto: UpdateItemDto,
    userId: string,
  ) {
    const updatedItem = await this.itemModel.findOneAndUpdate(
      {
        _id: itemId,
        ownerId: userId,
      },
      { $set: updateItemDto },
      { new: true },
    );

    if (!updatedItem) {
      throw new NotFoundException('Item not found or access denied');
    }

    return updatedItem;
  }

  async deleteItem(itemId: string, userId: string) {
    const deletedItem = await this.itemModel.findOneAndDelete({
      _id: itemId,
      ownerId: userId,
    });

    if (!deletedItem) {
      throw new NotFoundException('Item not found or access denied');
    }

    return deletedItem;
  }
}

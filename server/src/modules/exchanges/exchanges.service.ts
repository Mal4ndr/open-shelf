import { ForbiddenException, Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Exchange,
  ExchangeDocument,
  ExchangeStatus,
} from './schemas/exchange.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateExchangeDto } from './dto/create-exchange.dto';
import {
  Item,
  ItemAvailabilityType,
  ItemDocument,
  ItemStatus,
} from '../items/schemas/item.schema';

@Injectable()
export class ExchangesService {
  constructor(
    @InjectModel(Exchange.name)
    private exchangeModel: Model<ExchangeDocument>,

    @InjectModel(Item.name)
    private itemModel: Model<ItemDocument>,
  ) {}

  async createExchange(
    createExchangeDto: CreateExchangeDto,
    initiatorId: string,
  ) {
    const { itemId } = createExchangeDto;

    //#region Item existence and availability check
    const item = await this.itemModel.findById(itemId);

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    if (item.status !== ItemStatus.AVAILABLE) {
      throw new BadRequestException('Item not available');
    }

    if (!item.availability.includes(ItemAvailabilityType.EXCHANGE)) {
      throw new BadRequestException('Item not available for exchange');
    }
    //#endregion

    //#region Initiator check
    if (item.ownerId.toString() === initiatorId) {
      throw new BadRequestException('You cannot request your own item');
    }
    //#endregion

    //#region Prevent duplicate exchange for item
    const existingExchange = await this.exchangeModel.findOne({
      itemId,
      status: { $in: [ExchangeStatus.REQUESTED, ExchangeStatus.ACTIVE] },
    });

    if (existingExchange) {
      throw new BadRequestException(
        'Exchange request for this item already exists',
      );
    }
    //#endregion

    //#region Create exchange
    const exchange = await this.exchangeModel.create({
      initiatorId,
      responderId: item.ownerId,
      itemId,
      status: ExchangeStatus.REQUESTED,
    });

    return exchange;
    //#endregion
  }

  async acceptExchange(exchangeId: string, userId: string) {
    const exchange = await this.exchangeModel.findById(exchangeId);

    //#region Exchange existence, permission and status check
    if (!exchange) {
      throw new NotFoundException('Exchange not found');
    }

    if (exchange.responderId.toString() !== userId) {
      throw new ForbiddenException('Only owner can accept exchange');
    }

    if (exchange.status !== ExchangeStatus.REQUESTED) {
      throw new BadRequestException('Exchange already processed');
    }
    //#endregion

    //#region Item existence and availability check
    const item = await this.itemModel.findById(exchange.itemId);

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    if (item.status !== ItemStatus.AVAILABLE) {
      throw new BadRequestException('Item not available');
    }
    //#endregion

    //#region Reject other existing exchanges
    await this.exchangeModel.updateMany(
      {
        itemId: exchange.itemId,
        status: ExchangeStatus.REQUESTED,
        initiatorId: { $ne: exchange.initiatorId },
      },
      {
        $set: { status: ExchangeStatus.REJECTED },
      },
    );
    //#endregion

    //#region Exchange and item status change
    exchange.status = ExchangeStatus.ACTIVE;
    await exchange.save();

    await this.itemModel.findByIdAndUpdate(exchange.itemId, {
      status: ItemStatus.BORROWED,
    });
    //#endregion

    return exchange;
  }

  async getMyExchanges(userId: string) {
    return this.exchangeModel
      .find({
        $or: [{ initiatorId: userId }, { responderId: userId }],
      })
      .populate({
        path: 'itemId',
        select: 'name status ownerId image',
      })
      .sort({ createdAt: -1 });
  }

  async rejectExchange(exchangeId: string, userId: string) {
    const exchange = await this.exchangeModel.findById(exchangeId);

    if (!exchange) {
      throw new NotFoundException('Exchange not found');
    }

    if (exchange.responderId.toString() !== userId) {
      throw new ForbiddenException('Only owner can reject exchange');
    }

    if (exchange.status !== ExchangeStatus.REQUESTED) {
      throw new BadRequestException('Only requested exchange can be rejected');
    }

    exchange.status = ExchangeStatus.CANCELED;
    await exchange.save();

    return exchange;
  }

  async cancelExchange(exchangeId: string, userId: string) {
    const exchange = await this.exchangeModel.findById(exchangeId);

    if (!exchange) {
      throw new NotFoundException('Exchange not found');
    }

    if (exchange.initiatorId.toString() !== userId) {
      throw new ForbiddenException('Only initator can cancel exchange');
    }

    if (exchange.status !== ExchangeStatus.REQUESTED) {
      throw new BadRequestException("You can't cancel processed exchange");
    }

    exchange.status = ExchangeStatus.CANCELED;
    await exchange.save();

    return exchange;
  }

  async completeExchange(exchangeId: string, userId: string) {
    const exchange = await this.exchangeModel.findById(exchangeId);

    if (!exchange) {
      throw new NotFoundException('Exchange not found');
    }

    if (exchange.responderId.toString() !== userId) {
      throw new ForbiddenException('Only owner can complete exchange');
    }

    if (exchange.status !== ExchangeStatus.ACTIVE) {
      throw new BadRequestException(
        "You can't complete exchange if it's not active",
      );
    }

    const item = await this.itemModel.findById(exchange.itemId);

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    item.status = ItemStatus.AVAILABLE;
    await item.save();

    exchange.status = ExchangeStatus.COMPLETED;
    await exchange.save();

    return exchange;
  }
}

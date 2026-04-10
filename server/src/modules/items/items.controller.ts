import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateItemDto } from './dto/create-item.dto';
import { ItemsService } from './items.service';
import { UpdateItemDto } from './dto/update-item.dto';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  getItems() {
    return this.itemsService.getItems();
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  getMyItems(@Req() req: any) {
    return this.itemsService.getMyItems(req.user.userId);
  }

  @Get(':id')
  getItem(@Param('id') id: string) {
    return this.itemsService.getItem(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createItem(@Body() createItemDto: CreateItemDto, @Req() req: any) {
    return this.itemsService.createItem(createItemDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateItem(
    @Param('id') id: string,
    @Body() updateItemDto: UpdateItemDto,
    @Req() req: any,
  ) {
    return this.itemsService.updateItem(id, updateItemDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteItem(@Param('id') id: string, @Req() req: any) {
    return this.itemsService.deleteItem(id, req.user.userId);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, Headers, UseGuards } from '@nestjs/common';
import { TodosService } from './todos.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('todos')
@UseGuards(RolesGuard)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  async findAll(@Headers('authorization') auth: string) {
    return this.todosService.findAll(auth);
  }

  @Post()
  async create(@Headers('authorization') auth: string, @Body() body: any) {
    return this.todosService.create(auth, body);
  }

  @Patch(':id')
  async update(@Headers('authorization') auth: string, @Param('id') id: string, @Body() body: any) {
    return this.todosService.update(auth, id, body);
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Headers('authorization') auth: string, @Param('id') id: string) {
    return this.todosService.remove(auth, id);
  }

  @Post('bulk-delete')
  @Roles('admin')
  async bulkDelete(@Headers('authorization') auth: string, @Body() body: { ids: string[] }) {
    return this.todosService.removeMany(auth, body.ids || []);
  }
}

import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TodosService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  private verifyToken(authHeader?: string) {
    if (!authHeader) throw new UnauthorizedException('Missing Authorization header');
    const [type, token] = authHeader.split(' ');
    if (!token || type !== 'Bearer') throw new UnauthorizedException('Invalid Authorization header');
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async findAll(authHeader?: string) {
    const payload: any = this.verifyToken(authHeader);
    const userId = payload.sub;
    const role = payload.role || 'user';
    if (role === 'admin') {
      // admin can view all todos
      return this.prisma.todo.findMany();
    }
    return this.prisma.todo.findMany({ where: { userId } });
  }

  async create(authHeader: string, data: { name: string }) {
    const payload: any = this.verifyToken(authHeader);
    const userId = payload.sub;
    return this.prisma.todo.create({ data: { name: data.name, userId } });
  }

  async update(authHeader: string, id: string, data: { name?: string; completed?: boolean }) {
    const payload: any = this.verifyToken(authHeader);
    const userId = payload.sub;
    const role = payload.role || 'user';

    const todo = await this.prisma.todo.findUnique({ where: { id } });
    if (!todo) throw new NotFoundException('Todo not found');
    // allow update if owner or admin
    if (todo.userId !== userId && role !== 'admin') throw new NotFoundException('Todo not found');

    return this.prisma.todo.update({ where: { id }, data });
  }

  async remove(authHeader: string, id: string) {
    const payload: any = this.verifyToken(authHeader);
    const userId = payload.sub;
    const role = payload.role || 'user';

    const todo = await this.prisma.todo.findUnique({ where: { id } });
    if (!todo) throw new NotFoundException('Todo not found');

    // admins can delete any todo; regular users can delete only their own (though controller already restricts delete to admin)
    if (role !== 'admin' && todo.userId !== userId) throw new NotFoundException('Todo not found');

    await this.prisma.todo.delete({ where: { id } });
    return { message: 'Deleted' };
  }

  async removeMany(authHeader: string, ids: string[]) {
    const payload: any = this.verifyToken(authHeader);
    const userId = payload.sub;
    const role = payload.role || 'user';

    if (!Array.isArray(ids) || ids.length === 0) {
      return { deleted: 0 };
    }

    // Admins can delete any of the provided ids; regular users only their own
    const where: any = { id: { in: ids } };
    if (role !== 'admin') where.userId = userId;

    const result = await this.prisma.todo.deleteMany({ where });

    return { deleted: result.count };
  }
}

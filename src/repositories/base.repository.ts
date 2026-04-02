type PrismaDelegate = {
  findUnique: (args: any) => Promise<any>;
  findFirst: (args: any) => Promise<any>;
  findMany: (args?: any) => Promise<any[]>;
  create: (args: any) => Promise<any>;
  update: (args: any) => Promise<any>;
  delete: (args: any) => Promise<any>;
  count: (args?: any) => Promise<number>;
};

export abstract class BaseRepository<
  T,
  CreateInput,
  UpdateInput,
  WhereUniqueInput,
  WhereInput = Partial<T>
> {
  constructor(protected readonly model: PrismaDelegate) {}

  findOne(where: WhereUniqueInput): Promise<T | null> {
    return this.model.findUnique({ where });
  }

  findFirst(where: WhereInput): Promise<T | null> {
    return this.model.findFirst({ where });
  }

  findMany(where?: WhereInput): Promise<T[]> {
    return this.model.findMany({ where });
  }

  create(data: CreateInput): Promise<T> {
    return this.model.create({ data });
  }

  update(where: WhereUniqueInput, data: UpdateInput): Promise<T> {
    return this.model.update({ where, data });
  }

  delete(where: WhereUniqueInput): Promise<T> {
    return this.model.delete({ where });
  }

  count(where?: WhereInput): Promise<number> {
    return this.model.count({ where });
  }
}

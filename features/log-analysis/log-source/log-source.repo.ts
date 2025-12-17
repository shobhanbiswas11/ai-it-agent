export interface LogSourceEntityBase {
  userId: string;
  type: string;
  name: string;
  description?: string;
  config: Record<string, any>;
}

export interface LogSourceEntity extends LogSourceEntityBase {
  id: string;
}

export const logSourceRepo = {
  create(props: LogSourceEntityBase): Promise<LogSourceEntity> {
    throw new Error("Method not implemented.");
  },

  update(
    id: string,
    props: Partial<LogSourceEntityBase>
  ): Promise<LogSourceEntity> {
    throw new Error("Method not implemented.");
  },

  getById(id: string): Promise<LogSourceEntity | null> {
    throw new Error("Method not implemented.");
  },

  getByOwnerId(ownerId: string): Promise<LogSourceEntity[]> {
    throw new Error("Method not implemented.");
  },

  delete(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  },
};

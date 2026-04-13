export const computeObjectId = (entityId: string): string =>
  entityId.includes(".") ? entityId.split(".")[1] : entityId;

import { Model, Document } from "mongoose";

type TenantQuery = Record<string, unknown>;

export function withTenantScope(tenantId: string, query: TenantQuery = {}): TenantQuery {
  return { ...query, tenantId };
}

export async function findByTenant<T extends Document>(
  model: Model<T>,
  tenantId: string,
  query: TenantQuery = {}
) {
  return model.find(withTenantScope(tenantId, query));
}

export async function findOneByTenant<T extends Document>(
  model: Model<T>,
  tenantId: string,
  query: TenantQuery = {}
) {
  return model.findOne(withTenantScope(tenantId, query));
}

export async function countByTenant<T extends Document>(
  model: Model<T>,
  tenantId: string,
  query: TenantQuery = {}
) {
  return model.countDocuments(withTenantScope(tenantId, query));
}

export function assertTenantAccess(
  documentTenantId: string | undefined,
  requestTenantId: string
): void {
  if (documentTenantId !== requestTenantId) {
    throw new Error("TENANT_ACCESS_DENIED");
  }
}

export function getR2Prefix(tenantId: string): string {
  return `tenants/${tenantId}`;
}

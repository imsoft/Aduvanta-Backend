import { SetMetadata } from '@nestjs/common';
import type { Permission } from '../../modules/permissions/permission.codes.js';

export const PERMISSION_KEY = 'required_permission';

export const RequirePermission = (permission: Permission) =>
  SetMetadata(PERMISSION_KEY, permission);

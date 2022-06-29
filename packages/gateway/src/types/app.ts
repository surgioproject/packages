import { Request } from 'express';

import { Role } from '../constants/role';

export interface UserContext {
  readonly accessToken: string;
  readonly roles: Array<Role>;
}

export interface EnrichedRequest extends Request {
  user?: UserContext;
}

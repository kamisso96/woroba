import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Recupere l'ID de la boutique active injectee par ShopAccessGuard.
 *
 * Usage :
 *   findAll(@CurrentShop() shopId: string) { ... }
 */
export const CurrentShop = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.shopId;
  },
);

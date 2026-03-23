import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { Session } from '../../common/decorators/session.decorator.js';
import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import type { ActiveSession } from '../../common/types/session.types.js';
import { PERMISSION } from '../permissions/permission.codes.js';
import { SubscriptionsService } from './subscriptions.service.js';
import { AssignSubscriptionDto } from './dto/assign-subscription.dto.js';
import { CreateCheckoutDto } from './dto/create-checkout.dto.js';
import { ChangePlanDto } from './dto/change-plan.dto.js';

@Controller()
@UseGuards(AuthGuard, PermissionsGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  @RequirePermission(PERMISSION.BILLING_READ)
  async listPlans() {
    return this.subscriptionsService.listPlans();
  }

  @Get('subscriptions/my')
  @RequirePermission(PERMISSION.BILLING_READ)
  async getMySubscription(
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.subscriptionsService.getSubscription(organizationId);
  }

  @Post('subscriptions')
  @RequirePermission(PERMISSION.PLANS_READ)
  async assignPlan(
    @Headers('x-organization-id') organizationId: string,
    @Body() dto: AssignSubscriptionDto,
    @Session() session: ActiveSession,
  ) {
    return this.subscriptionsService.assignPlan(
      organizationId,
      dto,
      session.user.id,
    );
  }

  @Post('subscriptions/checkout')
  @RequirePermission(PERMISSION.BILLING_MANAGE)
  async createCheckout(
    @Headers('x-organization-id') organizationId: string,
    @Body() dto: CreateCheckoutDto,
    @Session() session: ActiveSession,
  ) {
    return this.subscriptionsService.createCheckoutSession(
      organizationId,
      dto,
      session.user.id,
      session.user.email,
      session.user.name,
    );
  }

  @Post('subscriptions/portal')
  @RequirePermission(PERMISSION.BILLING_MANAGE)
  async createPortal(@Headers('x-organization-id') organizationId: string) {
    return this.subscriptionsService.createPortalSession(organizationId);
  }

  @Post('subscriptions/change-plan')
  @RequirePermission(PERMISSION.BILLING_MANAGE)
  async changePlan(
    @Headers('x-organization-id') organizationId: string,
    @Body() dto: ChangePlanDto,
    @Session() session: ActiveSession,
  ) {
    return this.subscriptionsService.changePlan(
      organizationId,
      dto,
      session.user.id,
    );
  }

  @Post('subscriptions/cancel')
  @RequirePermission(PERMISSION.BILLING_MANAGE)
  async cancelSubscription(
    @Headers('x-organization-id') organizationId: string,
    @Session() session: ActiveSession,
  ) {
    return this.subscriptionsService.cancelSubscription(
      organizationId,
      session.user.id,
    );
  }

  @Post('subscriptions/resume')
  @RequirePermission(PERMISSION.BILLING_MANAGE)
  async resumeSubscription(
    @Headers('x-organization-id') organizationId: string,
    @Session() session: ActiveSession,
  ) {
    return this.subscriptionsService.resumeSubscription(
      organizationId,
      session.user.id,
    );
  }
}

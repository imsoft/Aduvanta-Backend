import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { AppConfigModule } from './config/config.module.js';
import { AppConfigService } from './config/config.service.js';
import { DatabaseModule } from './database/database.module.js';
import { RedisModule } from './redis/redis.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { OrganizationsModule } from './modules/organizations/organizations.module.js';
import { MembershipsModule } from './modules/memberships/memberships.module.js';
import { PermissionsModule } from './modules/permissions/permissions.module.js';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { StorageModule } from './modules/storage/storage.module.js';
import { ClientsModule } from './modules/clients/clients.module.js';
import { ClientContactsModule } from './modules/client-contacts/client-contacts.module.js';
import { ClientAddressesModule } from './modules/client-addresses/client-addresses.module.js';
import { OperationsModule } from './modules/operations/operations.module.js';
import { OperationCommentsModule } from './modules/operation-comments/operation-comments.module.js';
import { DocumentCategoriesModule } from './modules/document-categories/document-categories.module.js';
import { DocumentsModule } from './modules/documents/documents.module.js';
import { OperationChargesModule } from './modules/operation-charges/operation-charges.module.js';
import { OperationAdvancesModule } from './modules/operation-advances/operation-advances.module.js';
import { OperationFinanceModule } from './modules/operation-finance/operation-finance.module.js';
import { ComplianceRuleSetsModule } from './modules/compliance-rule-sets/compliance-rule-sets.module.js';
import { ComplianceDocumentRequirementsModule } from './modules/compliance-document-requirements/compliance-document-requirements.module.js';
import { ComplianceStatusRulesModule } from './modules/compliance-status-rules/compliance-status-rules.module.js';
import { OperationComplianceModule } from './modules/operation-compliance/operation-compliance.module.js';
import { ClientPortalAccessModule } from './modules/client-portal-access/client-portal-access.module.js';
import { PortalModule } from './modules/portal/portal.module.js';
import { IntegrationsModule } from './modules/integrations/integrations.module.js';
import { IntegrationDeliveriesModule } from './modules/integration-deliveries/integration-deliveries.module.js';
import { ExportsModule } from './modules/exports/exports.module.js';
import { ImportsModule } from './modules/imports/imports.module.js';
import { TariffClassificationModule } from './modules/tariff-classification/tariff-classification.module.js';
import { CustomsEntriesModule } from './modules/customs-entries/customs-entries.module.js';
import { CustomsOperationsModule } from './modules/customs-operations/customs-operations.module.js';
import { CustomsValuationModule } from './modules/customs-valuation/customs-valuation.module.js';
import { EDocumentsModule } from './modules/e-documents/e-documents.module.js';
import { BillingModule } from './modules/billing/billing.module.js';
import { TreasuryModule } from './modules/treasury/treasury.module.js';
import { DocumentManagementModule } from './modules/document-management/document-management.module.js';
import { WarehouseModule } from './modules/warehouse/warehouse.module.js';
import { CupoLettersModule } from './modules/cupo-letters/cupo-letters.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { AnalyticsModule } from './modules/analytics/analytics.module.js';
import { UnitConverterModule } from './modules/unit-converter/unit-converter.module.js';
import { AiModule } from './modules/ai/ai.module.js';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module.js';
import { UsageModule } from './modules/usage/usage.module.js';
import { FeatureFlagsModule } from './modules/feature-flags/feature-flags.module.js';

@Module({
  imports: [
    AppConfigModule,
    // Global rate limiting: 200 requests per minute per IP by default.
    // Individual endpoints can override with @Throttle() decorator.
    ThrottlerModule.forRoot([
      {
        name: 'global',
        ttl: 60_000,
        limit: 200,
      },
    ]),
    LoggerModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        pinoHttp: {
          level: config.get('NODE_ENV') === 'production' ? 'info' : 'debug',
          transport:
            config.get('NODE_ENV') !== 'production'
              ? { target: 'pino-pretty' }
              : undefined,
        },
      }),
    }),
    DatabaseModule,
    RedisModule,
    StorageModule,
    AuthModule,
    UsersModule,
    MembershipsModule,
    PermissionsModule,
    AuditLogsModule,
    OrganizationsModule,
    ClientsModule,
    ClientContactsModule,
    ClientAddressesModule,
    OperationsModule,
    OperationCommentsModule,
    DocumentCategoriesModule,
    DocumentsModule,
    OperationChargesModule,
    OperationAdvancesModule,
    OperationFinanceModule,
    ComplianceRuleSetsModule,
    ComplianceDocumentRequirementsModule,
    ComplianceStatusRulesModule,
    OperationComplianceModule,
    ClientPortalAccessModule,
    PortalModule,
    IntegrationsModule,
    IntegrationDeliveriesModule,
    ExportsModule,
    ImportsModule,
    TariffClassificationModule,
    CustomsEntriesModule,
    CustomsOperationsModule,
    CustomsValuationModule,
    EDocumentsModule,
    BillingModule,
    TreasuryModule,
    DocumentManagementModule,
    WarehouseModule,
    CupoLettersModule,
    NotificationsModule,
    AnalyticsModule,
    UnitConverterModule,
    AiModule,
    SubscriptionsModule,
    UsageModule,
    FeatureFlagsModule,
    HealthModule,
  ],
  providers: [
    // Apply rate limiting globally to all routes.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}

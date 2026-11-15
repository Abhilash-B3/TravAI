export const PERMISSIONS = {
  // PMS Operations
  PMS_ROOM_VIEW: 'pms:room:view',
  PMS_ROOM_ASSIGN: 'pms:room:assign',
  PMS_ROOM_STATUS_UPDATE: 'pms:room:status_update',
  
  // Reservations
  RESERVATION_VIEW: 'reservation:view',
  RESERVATION_CREATE: 'reservation:create',
  RESERVATION_CHECKIN: 'reservation:checkin',
  RESERVATION_CHECKOUT: 'reservation:checkout',
  RESERVATION_CANCEL: 'reservation:cancel',
  
  // Inventory & Yield
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_ALLOCATE: 'inventory:allocate',
  INVENTORY_RESTRICTION_UPDATE: 'inventory:restriction:update',
  
  // Revenue & Pricing
  REVENUE_RATE_VIEW: 'revenue:rate:view',
  REVENUE_AI_RECOMMENDATION_VIEW: 'revenue:ai:view',
  REVENUE_AI_OVERRIDE: 'revenue:ai:override',
  
  // Finance & Folio
  FOLIO_VIEW: 'finance:folio:view',
  FOLIO_CHARGE_POST: 'finance:folio:charge',
  FOLIO_PAYMENT_POST: 'finance:folio:payment',
  FOLIO_REFUND: 'finance:folio:refund',
  FOLIO_CLOSE: 'finance:folio:close',
  
  // Governance & Audits
  AUDIT_LOG_VIEW: 'governance:audit:view',
  TENANT_CONFIG_MANAGE: 'governance:tenant:manage',
};

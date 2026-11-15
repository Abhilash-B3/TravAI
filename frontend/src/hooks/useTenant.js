import { useAuthContext } from '../store/authContext';

export function useTenant() {
  const {
    activeOrg,
    activeProperty,
    activeOrgId,
    activePropertyId,
    activeCorporateId,
    organizations,
    properties,
    switchContext,
  } = useAuthContext();

  return {
    organization: activeOrg,
    property: activeProperty,
    organizationId: activeOrgId,
    propertyId: activePropertyId,
    corporateAccountId: activeCorporateId,
    organizations,
    properties,
    switchContext,
  };
}

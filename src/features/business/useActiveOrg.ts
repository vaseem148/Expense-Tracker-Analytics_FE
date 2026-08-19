import { useEffect } from 'react';
import { useOrgs } from '@/api/queries';
import { useUi } from '@/store/ui';

/**
 * Resolves the org the user is looking at. Defaults to the first membership so
 * business pages are never empty just because nothing was picked yet.
 */
export function useActiveOrg() {
  const { data: orgs, isLoading } = useOrgs();
  const { activeOrgId, setActiveOrg } = useUi();

  useEffect(() => {
    if (!orgs?.length) return;
    const stillValid = orgs.some((o) => o.orgId === activeOrgId);
    if (!activeOrgId || !stillValid) setActiveOrg(orgs[0].orgId);
  }, [orgs, activeOrgId, setActiveOrg]);

  const org = orgs?.find((o) => o.orgId === activeOrgId) ?? orgs?.[0];
  return { orgs: orgs ?? [], org, orgId: org?.orgId, isLoading, setActiveOrg };
}

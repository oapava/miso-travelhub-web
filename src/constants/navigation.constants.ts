import { B2CRoutes, B2BRoutes, type RouteConfig } from '@/types';

export const B2C_NAVIGATION: RouteConfig[] = [
  { path: B2CRoutes.HOME, titleKey: 'navigation.home' },
  { path: B2CRoutes.DESTINATIONS, titleKey: 'navigation.destinations' },
  { path: B2CRoutes.PACKAGES, titleKey: 'navigation.packages' },
  { path: B2CRoutes.ABOUT, titleKey: 'navigation.about' },
  { path: B2CRoutes.CONTACT, titleKey: 'navigation.contact' },
];

export const B2B_NAVIGATION: RouteConfig[] = [
  { path: B2BRoutes.DASHBOARD, titleKey: 'navigation.business' },
  { path: B2BRoutes.SERVICES, titleKey: 'navigation.services' },
  { path: B2BRoutes.PARTNERS, titleKey: 'navigation.partners' },
  { path: B2BRoutes.CONTACT, titleKey: 'navigation.contact' },
];

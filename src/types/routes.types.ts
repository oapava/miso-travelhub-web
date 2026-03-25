/**
 * Route path constants for B2C and B2B sections
 */
export enum B2CRoutes {
  HOME = '/',
  DESTINATIONS = '/destinations',
  PACKAGES = '/packages',
  ABOUT = '/about',
  CONTACT = '/contact',
}

export enum B2BRoutes {
  DASHBOARD = '/business',
  SERVICES = '/business/services',
  PARTNERS = '/business/partners',
  CONTACT = '/business/contact',
}

export interface RouteConfig {
  path: string;
  titleKey: string;
  isProtected?: boolean;
}

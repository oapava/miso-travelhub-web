/**
 * Common shared types across the application
 */

export interface BaseComponentProps {
  className?: string;
  dataTestId?: string;
}

export interface ChildrenProps {
  children: React.ReactNode;
}

export type SupportedLanguage = 'es' | 'en';

export type PortalType = 'b2c' | 'b2b';

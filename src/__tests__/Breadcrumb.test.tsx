import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb';

const renderBreadcrumb = (items: { label: string; path?: string }[], testId?: string) =>
  render(
    <MemoryRouter>
      <Breadcrumb items={items} dataTestId={testId} />
    </MemoryRouter>,
  );

describe('Breadcrumb', () => {
  it('renders navigation with aria-label Breadcrumb', () => {
    renderBreadcrumb([{ label: 'Home' }]);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  });

  it('renders all item labels', () => {
    renderBreadcrumb([
      { label: 'Home', path: '/' },
      { label: 'Account', path: '/account' },
      { label: 'Settings' },
    ]);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders intermediate items with links when path is provided', () => {
    renderBreadcrumb([
      { label: 'Home', path: '/' },
      { label: 'Profile' },
    ]);
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
  });

  it('does not render last item as a link', () => {
    renderBreadcrumb([
      { label: 'Home', path: '/' },
      { label: 'Account', path: '/account' },
      { label: 'Settings' },
    ]);
    expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument();
  });

  it('marks last item with aria-current="page"', () => {
    renderBreadcrumb([{ label: 'Home', path: '/' }, { label: 'Current' }]);
    const current = screen.getByText('Current');
    expect(current).toHaveAttribute('aria-current', 'page');
  });

  it('does not apply aria-current to intermediate items', () => {
    renderBreadcrumb([
      { label: 'Home', path: '/' },
      { label: 'Notifications' },
    ]);
    const link = screen.getByRole('link', { name: 'Home' });
    expect(link).not.toHaveAttribute('aria-current');
  });

  it('renders a single item as current page', () => {
    renderBreadcrumb([{ label: 'Only' }]);
    expect(screen.getByText('Only')).toHaveAttribute('aria-current', 'page');
  });

  it('sets data-testid on navigation element', () => {
    renderBreadcrumb([{ label: 'Home' }], 'breadcrumb-test');
    expect(screen.getByTestId('breadcrumb-test')).toBeInTheDocument();
  });

  it('links point to the correct path', () => {
    renderBreadcrumb([{ label: 'Home', path: '/home' }, { label: 'End' }]);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/home');
  });
});

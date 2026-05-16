import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { B2BRoutes } from '@/types';
import './B2BSidebar.scss';

interface B2BSidebarProps {
  userEmail?: string;
  userRole?: string;
  onLogout?: () => void;
  dataTestId?: string;
}

// `key` drives the stable data-testid; `labelKey` is the i18n translation key.
const B2B_MENU_ITEMS = [
  { path: B2BRoutes.DASHBOARD,            key: 'dashboard',         labelKey: 'b2b.sidebar.dashboard',        icon: '⊕' },
  { path: '/business/booking-manager',    key: 'booking-manager',   labelKey: 'b2b.sidebar.bookingManager',   icon: '⊕' },
  { path: '/business/financial-reports',  key: 'financial-reports', labelKey: 'b2b.sidebar.financialReports', icon: '⊕' },
  { path: '/business/prices-manager',     key: 'prices-manager',    labelKey: 'b2b.sidebar.pricesManager',    icon: '⊕' },
];

const B2BSidebar: React.FC<B2BSidebarProps> = ({
  userEmail = 'admin@travelhub.com',
  userRole = 'Admin',
  onLogout,
  dataTestId,
}) => {
  const { t } = useTranslation();

  return (
    <aside className="b2b-sidebar" data-testid={dataTestId}>
      <div className="b2b-sidebar__content">
        <h3 className="b2b-sidebar__title">{t('b2b.sidebar.menu')}</h3>
        <nav className="b2b-sidebar__nav" aria-label={t('b2b.sidebar.businessNavigation')}>
          <ul className="b2b-sidebar__menu">
            {B2B_MENU_ITEMS.map((menuItem) => (
              <li key={menuItem.path} className="b2b-sidebar__menu-item">
                <NavLink
                  to={menuItem.path}
                  end={menuItem.path === B2BRoutes.DASHBOARD}
                  className={({ isActive }) =>
                    `b2b-sidebar__link ${isActive ? 'b2b-sidebar__link--active' : ''}`
                  }
                  data-testid={`b2b-sidebar-${menuItem.key}`}
                >
                  <span className="b2b-sidebar__link-icon" aria-hidden="true">
                    {menuItem.icon}
                  </span>
                  {t(menuItem.labelKey)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="b2b-sidebar__footer">
        <div className="b2b-sidebar__user-card">
          <div className="b2b-sidebar__user-avatar">
            <span className="b2b-sidebar__user-avatar-placeholder">
              {userEmail.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="b2b-sidebar__user-info">
            <span className="b2b-sidebar__user-email">{userEmail}</span>
            <span className="b2b-sidebar__user-role">{userRole}</span>
          </div>
        </div>
        <button
          type="button"
          className="b2b-sidebar__logout"
          onClick={onLogout}
          data-testid="b2b-sidebar-logout"
        >
          {t('b2b.sidebar.logout')}
        </button>
      </div>
    </aside>
  );
};

export default B2BSidebar;

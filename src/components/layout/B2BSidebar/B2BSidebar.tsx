import { NavLink } from 'react-router-dom';
import { B2BRoutes } from '@/types';
import './B2BSidebar.scss';

interface B2BSidebarProps {
  userEmail?: string;
  userRole?: string;
  onLogout?: () => void;
  dataTestId?: string;
}

const B2B_MENU_ITEMS = [
  { path: B2BRoutes.DASHBOARD, label: 'Dashboard', icon: '⊕' },
  { path: '/business/booking-manager', label: 'Booking Manager', icon: '⊕' },
  { path: '/business/financial-reports', label: 'Financial Reports', icon: '⊕' },
  { path: '/business/prices-manager', label: 'Prices Manager', icon: '⊕' },
];

const B2BSidebar: React.FC<B2BSidebarProps> = ({
  userEmail = 'admin@travelhub.com',
  userRole = 'Admin',
  onLogout,
  dataTestId,
}) => {
  return (
    <aside className="b2b-sidebar" data-testid={dataTestId}>
      <div className="b2b-sidebar__content">
        <h3 className="b2b-sidebar__title">Menu</h3>
        <nav className="b2b-sidebar__nav" aria-label="Business navigation">
          <ul className="b2b-sidebar__menu">
            {B2B_MENU_ITEMS.map((menuItem) => (
              <li key={menuItem.path} className="b2b-sidebar__menu-item">
                <NavLink
                  to={menuItem.path}
                  end={menuItem.path === B2BRoutes.DASHBOARD}
                  className={({ isActive }) =>
                    `b2b-sidebar__link ${isActive ? 'b2b-sidebar__link--active' : ''}`
                  }
                  data-testid={`b2b-sidebar-${menuItem.label.toLowerCase().replace(/\s/g, '-')}`}
                >
                  <span className="b2b-sidebar__link-icon" aria-hidden="true">
                    {menuItem.icon}
                  </span>
                  {menuItem.label}
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
          ← Logout
        </button>
      </div>
    </aside>
  );
};

export default B2BSidebar;

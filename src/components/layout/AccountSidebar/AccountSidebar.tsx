import { NavLink } from 'react-router-dom';
import './AccountSidebar.scss';

interface AccountSidebarProps {
  userName: string;
  userEmail: string;
  onLogout?: () => void;
  dataTestId?: string;
}

const ACCOUNT_MENU_ITEMS = [
  { path: '/account', labelKey: 'My information', icon: '★' },
  { path: '/account/bookings', labelKey: 'Bookings', icon: '📋' },
  { path: '/account/notifications', labelKey: 'Notifications', icon: '🔔' },
  { path: '/account/security', labelKey: 'Security', icon: '🔒' },
];

const AccountSidebar: React.FC<AccountSidebarProps> = ({
  userName,
  userEmail,
  onLogout,
  dataTestId,
}) => {

  return (
    <aside className="account-sidebar" data-testid={dataTestId}>
      <div className="account-sidebar__header">
        <h2 className="account-sidebar__title">Your Account</h2>
        <p className="account-sidebar__user-info">
          {userName} &nbsp; {userEmail}
        </p>
      </div>

      <nav className="account-sidebar__nav" aria-label="Account navigation">
        <ul className="account-sidebar__menu">
          {ACCOUNT_MENU_ITEMS.map((menuItem) => (
            <li key={menuItem.path} className="account-sidebar__menu-item">
              <NavLink
                to={menuItem.path}
                end={menuItem.path === '/account'}
                className={({ isActive }) =>
                  `account-sidebar__link ${isActive ? 'account-sidebar__link--active' : ''}`
                }
                data-testid={`account-sidebar-${menuItem.labelKey.toLowerCase().replace(/\s/g, '-')}`}
              >
                <span className="account-sidebar__link-icon" aria-hidden="true">
                  {menuItem.icon}
                </span>
                {menuItem.labelKey}
              </NavLink>
            </li>
          ))}
          <li className="account-sidebar__menu-item">
            <button
              type="button"
              className="account-sidebar__link account-sidebar__logout"
              onClick={onLogout}
              data-testid="account-sidebar-logout"
            >
              <span className="account-sidebar__link-icon" aria-hidden="true">→</span>
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default AccountSidebar;

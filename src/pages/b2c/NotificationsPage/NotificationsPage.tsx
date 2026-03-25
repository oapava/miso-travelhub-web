import React, { useState } from 'react';
import { Header, SearchBar, AccountSidebar, Footer } from '@/components/layout';
import { Breadcrumb, Toggle } from '@/components/ui';
import './NotificationsPage.scss';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState({
    whatsapp: true,
    email: false,
    sms: true,
  });

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const notificationSettings = [
    {
      id: 'whatsapp' as const,
      label: 'Whatsapp Notifications',
      description: 'Receive booking confirmations and updates via WhatsApp',
    },
    {
      id: 'email' as const,
      label: 'Email Notifications',
      description: 'Receive booking confirmations and updates via email',
    },
    {
      id: 'sms' as const,
      label: 'SMS Notifications',
      description: 'Receive booking confirmations and updates via SMS',
    },
  ];

  return (
    <div className="notifications-page" data-testid="notifications-page">
      <Header isLoggedIn={true} user={{ name: 'John Doe' }} />
      <div className="notifications-page__search-bar-wrapper">
        <SearchBar variant="compact" />
      </div>

      <div className="notifications-page__container">
        <Breadcrumb
          items={[
            { label: 'Home', path: '/' },
            { label: 'Account', path: '/account' },
            { label: 'Notifications' },
          ]}
        />

        <div className="notifications-page__content">
          <AccountSidebar
            userName="John Doe"
            userEmail="johndoe@example.com"
            dataTestId="notifications-sidebar"
          />

          <main className="notifications-page__main" data-testid="notifications-main">
            <div className="notifications-page__header">
              <h1 className="notifications-page__title">Configuration</h1>
              <p className="notifications-page__subtitle">Notifications</p>
            </div>

            <div className="notifications-page__settings-list" data-testid="notifications-list">
              {notificationSettings.map((setting) => (
                <div
                  key={setting.id}
                  className="notifications-page__setting-item"
                  data-testid={`notification-setting-${setting.id}`}
                >
                  <div className="notifications-page__setting-info">
                    <h3 className="notifications-page__setting-label">{setting.label}</h3>
                    <p className="notifications-page__setting-description">
                      {setting.description}
                    </p>
                  </div>
                  <Toggle
                    isActive={notifications[setting.id]}
                    onToggle={() => handleToggle(setting.id)}
                    label={setting.label}
                    dataTestId={`toggle-${setting.id}`}
                  />
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NotificationsPage;

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Header, AccountSidebar, Footer } from '@/components/layout';
import { Breadcrumb, Toggle } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import './NotificationsPage.scss';

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

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
      label: t('notifications.whatsappLabel'),
      description: t('notifications.whatsappDesc'),
    },
    {
      id: 'email' as const,
      label: t('notifications.emailLabel'),
      description: t('notifications.emailDesc'),
    },
    {
      id: 'sms' as const,
      label: t('notifications.smsLabel'),
      description: t('notifications.smsDesc'),
    },
  ];

  return (
    <div className="notifications-page" data-testid="notifications-page">
      <Header />

      <div className="notifications-page__container">
        <Breadcrumb
          items={[
            { label: t('breadcrumb.home'), path: '/' },
            { label: t('breadcrumb.account'), path: '/account' },
            { label: t('breadcrumb.notifications') },
          ]}
        />

        <div className="notifications-page__content">
          <AccountSidebar
            userName={user?.nombre ?? ''}
            userEmail={user?.email ?? ''}
            dataTestId="notifications-sidebar"
          />

          <main className="notifications-page__main" data-testid="notifications-main">
            <div className="notifications-page__header">
              <h1 className="notifications-page__title">{t('notifications.title')}</h1>
              <p className="notifications-page__subtitle">{t('notifications.subtitle')}</p>
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

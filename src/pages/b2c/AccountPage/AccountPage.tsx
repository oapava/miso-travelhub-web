import React, { useState } from 'react';
import { Header, AccountSidebar, Footer } from '@/components/layout';
import { Breadcrumb, Input, Select, Button } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import './AccountPage.scss';

const AccountPage: React.FC = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.nombre ?? '',
    username: user?.username ?? '',
    password: '',
    country: user?.pais ?? '',
    language: user?.idioma ?? '',
    phone: user?.telefono ?? '',
    currency: user?.moneda_preferida?.toLowerCase() ?? '',
    status: 'active',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const countryOptions = [
    { value: 'france', label: 'France' },
    { value: 'usa', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'germany', label: 'Germany' },
    { value: 'colombia', label: 'Colombia' },
    { value: 'spain', label: 'Spain' },
  ];

  const languageOptions = [
    { value: 'en', label: 'EN' },
    { value: 'es', label: 'ES' },
    { value: 'fr', label: 'FR' },
    { value: 'de', label: 'DE' },
  ];

  const currencyOptions = [
    { value: 'eur', label: 'EUR' },
    { value: 'usd', label: 'USD' },
    { value: 'gbp', label: 'GBP' },
    { value: 'cop', label: 'COP' },
  ];

  const statusOptions = [
    { value: 'active', label: 'ACTIVE' },
    { value: 'inactive', label: 'INACTIVE' },
  ];

  return (
    <div className="account-page" data-testid="account-page">
      <Header />

      <div className="account-page__container">
        <Breadcrumb
          items={[
            { label: 'Home', path: '/' },
            { label: 'Account', path: '/account' },
          ]}
        />

        <div className="account-page__content">
          <AccountSidebar
            userName={user?.nombre ?? ''}
            userEmail={user?.email ?? ''}
            dataTestId="account-sidebar"
          />

          <main id="main-content" className="account-page__main" data-testid="account-main">
            <div className="account-page__header">
              <h1 className="account-page__title">Account</h1>
              <p className="account-page__subtitle">Information</p>
            </div>

            <form className="account-page__form" data-testid="account-form">
              {/* Name and Username Row */}
              <div className="account-page__form-row">
                <Input
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  dataTestId="account-name"
                />
                <Input
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  dataTestId="account-username"
                />
              </div>

              {/* Password Row */}
              <div className="account-page__password-row">
                <Input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  dataTestId="account-password"
                  disabled
                />
                <Button
                  variant="primary"
                  dataTestId="account-change-password"
                  className="account-page__change-btn"
                >
                  CHANGE
                </Button>
              </div>

              {/* Country and Language Row */}
              <div className="account-page__form-row">
                <Select
                  options={countryOptions}
                  placeholder="Country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  dataTestId="account-country"
                />
                <Select
                  options={languageOptions}
                  placeholder="Language"
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  dataTestId="account-language"
                />
              </div>

              {/* Phone Field */}
              <Input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                dataTestId="account-phone"
              />

              {/* Currency and Status Row */}
              <div className="account-page__form-row">
                <Select
                  options={currencyOptions}
                  placeholder="Currency"
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  dataTestId="account-currency"
                />
                <Select
                  options={statusOptions}
                  placeholder="Status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  dataTestId="account-status"
                />
              </div>

              {/* Save Button — right-aligned */}
              <div className="account-page__form-actions">
                <Button
                  variant="primary"
                  dataTestId="account-save"
                  className="account-page__save-btn"
                >
                  SAVE
                </Button>
              </div>
            </form>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AccountPage;

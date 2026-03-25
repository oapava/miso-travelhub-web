import React, { useState } from 'react';
import { Header, SearchBar, AccountSidebar, Footer } from '@/components/layout';
import { Breadcrumb, Input, Select, Button } from '@/components/ui';
import './AccountPage.scss';

const AccountPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: 'John Doe',
    username: 'johndoe',
    password: '••••••••',
    country: 'france',
    language: 'en',
    phone: '+33 6 12 34 56 78',
    currency: 'eur',
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
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'es', label: 'Español' },
  ];

  const currencyOptions = [
    { value: 'eur', label: 'EUR (€)' },
    { value: 'usd', label: 'USD ($)' },
    { value: 'gbp', label: 'GBP (£)' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  return (
    <div className="account-page" data-testid="account-page">
      <Header isLoggedIn={true} user={{ name: formData.name }} />
      <div className="account-page__search-bar-wrapper">
        <SearchBar variant="compact" />
      </div>

      <div className="account-page__container">
        <Breadcrumb
          items={[
            { label: 'Home', path: '/' },
            { label: 'Account', path: '/account' },
          ]}
        />

        <div className="account-page__content">
          <AccountSidebar
            userName={formData.name}
            userEmail="johndoe@example.com"
            dataTestId="account-sidebar"
          />

          <main className="account-page__main" data-testid="account-main">
            <div className="account-page__header">
              <h1 className="account-page__title">Account</h1>
              <p className="account-page__subtitle">Information</p>
            </div>

            <form className="account-page__form" data-testid="account-form">
              {/* Name and Username Row */}
              <div className="account-page__form-row">
                <div className="account-page__form-group">
                  <label className="account-page__form-label">Name</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    dataTestId="account-name"
                  />
                </div>
                <div className="account-page__form-group">
                  <label className="account-page__form-label">Username</label>
                  <Input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    dataTestId="account-username"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="account-page__form-group account-page__password-group">
                <label className="account-page__form-label">Password</label>
                <div className="account-page__password-row">
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    dataTestId="account-password"
                    disabled
                  />
                  <Button
                    variant="secondary"
                    dataTestId="account-change-password"
                  >
                    CHANGE
                  </Button>
                </div>
              </div>

              {/* Country and Language Row */}
              <div className="account-page__form-row">
                <div className="account-page__form-group">
                  <label className="account-page__form-label">Country</label>
                  <Select
                    options={countryOptions}
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    dataTestId="account-country"
                  />
                </div>
                <div className="account-page__form-group">
                  <label className="account-page__form-label">Language</label>
                  <Select
                    options={languageOptions}
                    value={formData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    dataTestId="account-language"
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div className="account-page__form-group">
                <label className="account-page__form-label">Phone</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  dataTestId="account-phone"
                />
              </div>

              {/* Currency and Status Row */}
              <div className="account-page__form-row">
                <div className="account-page__form-group">
                  <label className="account-page__form-label">Currency</label>
                  <Select
                    options={currencyOptions}
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    dataTestId="account-currency"
                  />
                </div>
                <div className="account-page__form-group">
                  <label className="account-page__form-label">Status</label>
                  <Select
                    options={statusOptions}
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    dataTestId="account-status"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="account-page__form-actions">
                <Button
                  variant="primary"
                  dataTestId="account-save"
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

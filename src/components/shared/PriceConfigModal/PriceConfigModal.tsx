import { useState } from 'react';
import { Modal } from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Toggle } from '@/components/ui';
import './PriceConfigModal.scss';

interface PriceConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (config: PriceConfig) => void;
  dataTestId?: string;
}

interface PriceConfig {
  pricePerNight: string;
  isActive: boolean;
  offerPercent: string;
  offerStartDate: string;
  offerEndDate: string;
}

const PriceConfigModal: React.FC<PriceConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  dataTestId = 'price-config-modal',
}) => {
  const [pricePerNight, setPricePerNight] = useState('56');
  const [isActive, setIsActive] = useState(true);
  const [offerPercent, setOfferPercent] = useState('10');
  const [offerStartDate, setOfferStartDate] = useState('');
  const [offerEndDate, setOfferEndDate] = useState('');

  const handleSave = () => {
    const config: PriceConfig = {
      pricePerNight,
      isActive,
      offerPercent,
      offerStartDate,
      offerEndDate,
    };
    onSave?.(config);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="medium"
      dataTestId={dataTestId}
      className="price-config-modal"
    >
      <div className="price-config-modal__container" data-testid={`${dataTestId}-container`}>
        {/* Title */}
        <div className="price-config-modal__title-section" data-testid={`${dataTestId}-title-section`}>
          <h2 className="price-config-modal__title" data-testid={`${dataTestId}-title`}>
            La Perla, Medellín. Colombia
          </h2>
        </div>

        {/* Two Column Layout */}
        <div className="price-config-modal__content" data-testid={`${dataTestId}-content`}>
          {/* Left Column - General Configuration */}
          <div className="price-config-modal__column price-config-modal__column--left" data-testid={`${dataTestId}-general-config`}>
            <h3 className="price-config-modal__section-subtitle" data-testid={`${dataTestId}-general-title`}>
              General Configuration
            </h3>

            <div className="price-config-modal__form-group" data-testid={`${dataTestId}-price-group`}>
              <label className="price-config-modal__label" htmlFor={`${dataTestId}-price-input`}>
                Price Per night
              </label>
              <div className="price-config-modal__input-wrapper">
                <span className="price-config-modal__currency">$</span>
                <Input
                  id={`${dataTestId}-price-input`}
                  type="number"
                  value={pricePerNight}
                  onChange={(e) => setPricePerNight(e.target.value)}
                  dataTestId={`${dataTestId}-price-input`}
                  placeholder="0"
                  className="price-config-modal__input"
                />
              </div>
            </div>

            <div className="price-config-modal__form-group" data-testid={`${dataTestId}-active-group`}>
              <label className="price-config-modal__label" htmlFor={`${dataTestId}-toggle`}>
                Is this place Active?
              </label>
              <Toggle
                isActive={isActive}
                onToggle={() => setIsActive(!isActive)}
                label="Place active status"
                dataTestId={`${dataTestId}-toggle`}
              />
            </div>
          </div>

          {/* Right Column - Offer Configuration */}
          <div className="price-config-modal__column price-config-modal__column--right" data-testid={`${dataTestId}-offer-config`}>
            <h3 className="price-config-modal__section-subtitle" data-testid={`${dataTestId}-offer-title`}>
              Offer Configuration
            </h3>

            <div className="price-config-modal__form-group" data-testid={`${dataTestId}-percent-group`}>
              <label className="price-config-modal__label" htmlFor={`${dataTestId}-offer-input`}>
                Offer Percent
              </label>
              <div className="price-config-modal__input-wrapper">
                <Input
                  id={`${dataTestId}-offer-input`}
                  type="number"
                  value={offerPercent}
                  onChange={(e) => setOfferPercent(e.target.value)}
                  dataTestId={`${dataTestId}-offer-input`}
                  placeholder="0"
                  className="price-config-modal__input"
                />
                <span className="price-config-modal__percent">%</span>
              </div>
            </div>

            <div className="price-config-modal__form-group" data-testid={`${dataTestId}-date-range-group`}>
              <label className="price-config-modal__label">Range of offer</label>
              <div className="price-config-modal__date-range" data-testid={`${dataTestId}-date-range`}>
                <Input
                  type="date"
                  value={offerStartDate}
                  onChange={(e) => setOfferStartDate(e.target.value)}
                  dataTestId={`${dataTestId}-start-date`}
                  placeholder="Start date"
                  className="price-config-modal__date-input"
                />
                <span className="price-config-modal__date-separator">to</span>
                <Input
                  type="date"
                  value={offerEndDate}
                  onChange={(e) => setOfferEndDate(e.target.value)}
                  dataTestId={`${dataTestId}-end-date`}
                  placeholder="End date"
                  className="price-config-modal__date-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="price-config-modal__actions" data-testid={`${dataTestId}-actions`}>
          <Button
            variant="primary"
            size="medium"
            onClick={handleSave}
            dataTestId={`${dataTestId}-save-btn`}
          >
            SAVE
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PriceConfigModal;

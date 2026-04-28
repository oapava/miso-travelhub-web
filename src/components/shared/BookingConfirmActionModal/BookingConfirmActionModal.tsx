import { Modal } from '@/components/ui';
import { Button } from '@/components/ui';
import './BookingConfirmActionModal.scss';

interface BookingConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataTestId?: string;
  // Optional — static defaults keep existing tests green
  clientName?: string;
  hotelName?: string;
}

const BookingConfirmActionModal: React.FC<BookingConfirmActionModalProps> = ({
  isOpen,
  onClose,
  dataTestId = 'booking-confirm-action-modal',
  clientName = 'Carlos',
  hotelName = 'La Perla, Medellín',
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="small"
      dataTestId={dataTestId}
      className="booking-confirm-action-modal"
    >
      <div
        className="booking-confirm-action-modal__container"
        data-testid={`${dataTestId}-container`}
      >
        <div
          className="booking-confirm-action-modal__content"
          data-testid={`${dataTestId}-content`}
        >
          <h2
            className="booking-confirm-action-modal__title"
            data-testid={`${dataTestId}-title`}
          >
            You have confirm{' '}
            <span className="booking-confirm-action-modal__title-bold">{clientName}'s</span>{' '}
            Booking
          </h2>

          <p
            className="booking-confirm-action-modal__subtitle"
            data-testid={`${dataTestId}-subtitle`}
          >
            Reserved: {hotelName}
          </p>
        </div>

        <div
          className="booking-confirm-action-modal__actions"
          data-testid={`${dataTestId}-actions`}
        >
          <Button
            variant="primary"
            size="small"
            onClick={onClose}
            dataTestId={`${dataTestId}-close-btn`}
          >
            CLOSE
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BookingConfirmActionModal;

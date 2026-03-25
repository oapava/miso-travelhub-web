import { Modal } from '@/components/ui';
import { Button } from '@/components/ui';
import './BookingCancelModal.scss';

interface BookingCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  dataTestId?: string;
}

const BookingCancelModal: React.FC<BookingCancelModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  dataTestId = 'booking-cancel-modal',
}) => {

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="small"
      dataTestId={dataTestId}
      className="booking-cancel-modal"
    >
      <div className="booking-cancel-modal__container" data-testid={`${dataTestId}-container`}>
        <div className="booking-cancel-modal__content" data-testid={`${dataTestId}-content`}>
          <h2 className="booking-cancel-modal__title" data-testid={`${dataTestId}-title`}>
            Are you sure to Cancel <span className="booking-cancel-modal__title-bold">Carlos's</span> Booking?
          </h2>

          <p className="booking-cancel-modal__subtitle" data-testid={`${dataTestId}-subtitle`}>
            Reserved: La Perla, Medellín
          </p>
        </div>

        <div className="booking-cancel-modal__actions" data-testid={`${dataTestId}-actions`}>
          <Button
            variant="primary"
            size="medium"
            fullWidth
            onClick={handleConfirm}
            dataTestId={`${dataTestId}-confirm-btn`}
          >
            CONFIRM
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BookingCancelModal;

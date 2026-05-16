import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Button, Input } from '@/components/ui';
import {
  inventoryService,
  HabitacionInventario,
  Tarifa,
  CreateTarifaRequest,
} from '@/services/inventory.service';
import './TarifaDetailModal.scss';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DiscountType = 'pct' | 'fixed';

// ─── Pure helpers (exported for unit tests) ───────────────────────────────────

export function formatDate(isoDate: string | null | undefined): string {
  if (!isoDate) return '—';
  try {
    return new Date(isoDate).toLocaleDateString();
  } catch {
    return isoDate;
  }
}

/** Convert UI discount → API decimal (0–1). */
export function toApiDiscount(
  type: DiscountType,
  discount: number,
  price: number,
): number {
  if (type === 'pct') return discount / 100;
  return price > 0 ? Math.min(1, discount / price) : 0;
}

/** Compute the final price the traveler will see. */
export function computeFinalPrice(
  price: number,
  type: DiscountType,
  discount: number,
): number {
  return type === 'pct'
    ? price * (1 - discount / 100)
    : price - discount;
}

/** Validate the price / discount combination. Returns an i18n key or null. */
export function validateDiscount(
  priceStr: string,
  type: DiscountType,
  discountStr: string,
): string | null {
  const price    = Number(priceStr);
  const discount = Number(discountStr);

  if (!priceStr.trim() || price <= 0) return 'b2b.prices.modal.errorPriceZero';

  if (type === 'pct') {
    if (discount < 0 || discount > 100) return 'b2b.prices.modal.errorDiscountRange';
    if (computeFinalPrice(price, 'pct', discount) < 0) return 'b2b.prices.modal.errorNegativePrice';
  } else {
    if (discount < 0)     return 'b2b.prices.modal.errorDiscountRange';
    if (discount >= price) return 'b2b.prices.modal.errorFixedExceedsPrice';
  }

  return null;
}

// ─── Sub-component: discount type + value fields ──────────────────────────────

interface DiscountFieldsProps {
  type: DiscountType;
  value: string;
  testIdPrefix: string;
  onTypeChange: (t: DiscountType) => void;
  onValueChange: (v: string) => void;
  t: (k: string) => string;
}

function DiscountFields({
  type, value, testIdPrefix, onTypeChange, onValueChange, t,
}: DiscountFieldsProps) {
  return (
    <div className="tariff-detail-modal__discount-fields">
      <select
        className="tariff-detail-modal__discount-type-select"
        value={type}
        onChange={e => onTypeChange(e.target.value as DiscountType)}
        data-testid={`${testIdPrefix}-discount-type`}
        aria-label={t('b2b.prices.modal.discountTypeLabel')}
      >
        <option value="pct">{t('b2b.prices.modal.discountTypePct')}</option>
        <option value="fixed">{t('b2b.prices.modal.discountTypeFixed')}</option>
      </select>
      <Input
        type="number"
        min="0"
        max={type === 'pct' ? '100' : undefined}
        value={value}
        className='tariff-detail-modal__discount-input'
        onChange={e => onValueChange(e.target.value)}
        dataTestId={`${testIdPrefix}-discount-value`}
        placeholder={type === 'pct' ? '0–100' : '0'}
      />
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TarifaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: HabitacionInventario | null;
  accessToken: string;
  dataTestId?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const TarifaDetailModal: React.FC<TarifaDetailModalProps> = ({
  isOpen,
  onClose,
  room,
  accessToken,
  dataTestId = 'tariff-detail-modal',
}) => {
  const { t } = useTranslation();

  // ── Tariff data ──────────────────────────────────────────────────────────
  const [baseTariff,  setBaseTariff]  = useState<Tarifa | null>(null);
  const [variations,  setVariations]  = useState<Tarifa[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  // ── Add-variation form ───────────────────────────────────────────────────
  const [formPrice,        setFormPrice]        = useState('');
  const [formDiscountType, setFormDiscountType] = useState<DiscountType>('pct');
  const [formDiscount,     setFormDiscount]     = useState('');
  const [formStartDate,    setFormStartDate]    = useState('');
  const [formEndDate,      setFormEndDate]      = useState('');
  const [formError,        setFormError]        = useState<string | null>(null);
  const [formLoading,      setFormLoading]      = useState(false);

  // ── Inline edit state ────────────────────────────────────────────────────
  const [editingId,        setEditingId]        = useState<string | null>(null);
  const [editPrice,        setEditPrice]        = useState('');
  const [editDiscountType, setEditDiscountType] = useState<DiscountType>('pct');
  const [editDiscount,     setEditDiscount]     = useState('');
  const [editStartDate,    setEditStartDate]    = useState('');
  const [editEndDate,      setEditEndDate]      = useState('');
  const [editError,        setEditError]        = useState<string | null>(null);
  const [editLoading,      setEditLoading]      = useState(false);

  // ── Delete error ─────────────────────────────────────────────────────────
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ── Load tariffs when modal opens ────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !room) return;

    setLoading(true);
    setError(null);
    setDeleteError(null);
    setBaseTariff(null);
    setVariations([]);
    setEditingId(null);

    Promise.all([
      inventoryService.getBaseTariff(room.id, accessToken),
      inventoryService.getRoomTariffs(room.id, accessToken),
    ])
      .then(([base, allTariffs]) => {
        setBaseTariff(base);
        setVariations(allTariffs.filter(t => t.fechaInicio != null));
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'b2b.prices.modal.errorTariffs');
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, room, accessToken]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const resetAddForm = () => {
    setFormPrice('');
    setFormDiscountType('pct');
    setFormDiscount('');
    setFormStartDate('');
    setFormEndDate('');
    setFormError(null);
  };

  const handleClose = () => {
    resetAddForm();
    setDeleteError(null);
    setEditingId(null);
    setEditError(null);
    onClose();
  };

  // ── Start inline edit ────────────────────────────────────────────────────

  const handleStartEdit = (v: Tarifa) => {
    setEditingId(v.id);
    setEditPrice(String(v.precioBase));
    setEditDiscountType('pct');
    setEditDiscount(String(v.descuento * 100));
    setEditStartDate(v.fechaInicio ? v.fechaInicio.split('T')[0] : '');
    setEditEndDate(v.fechaFin   ? v.fechaFin.split('T')[0]   : '');
    setEditError(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditError(null);
  };

  // ── Save inline edit (PATCH) ─────────────────────────────────────────────

  const handleSaveEdit = async (tariffId: string) => {
    const validationKey = validateDiscount(editPrice, editDiscountType, editDiscount);
    if (validationKey) {
      setEditError(t(validationKey));
      return;
    }
    if (!editStartDate || !editEndDate) {
      setEditError(t('b2b.prices.modal.errorNegativePrice')); // reuse or add specific key
      return;
    }

    setEditLoading(true);
    setEditError(null);

    const price    = Number(editPrice);
    const apiDiscount = toApiDiscount(editDiscountType, Number(editDiscount), price);

    try {
      const updated = await inventoryService.patchTariff(
        tariffId,
        {
          precioBase:  price,
          descuento:   apiDiscount,
          fechaInicio: `${editStartDate}T00:00:00+00:00`,
          fechaFin:    `${editEndDate}T23:59:59+00:00`,
        },
        accessToken,
      );
      setVariations(prev => prev.map(v => v.id === tariffId ? updated : v));
      setEditingId(null);
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : t('b2b.prices.modal.updateError'));
    } finally {
      setEditLoading(false);
    }
  };

  // ── Add variation (POST) ─────────────────────────────────────────────────

  const handleAdd = async () => {
    if (!room) return;

    const validationKey = validateDiscount(formPrice, formDiscountType, formDiscount);
    if (validationKey) {
      setFormError(t(validationKey));
      return;
    }
    if (!formStartDate || !formEndDate) return;

    setFormLoading(true);
    setFormError(null);

    const price       = Number(formPrice);
    const apiDiscount = toApiDiscount(formDiscountType, Number(formDiscount), price);

    const request: CreateTarifaRequest = {
      habitacionId: room.id,
      precioBase:   price,
      descuento:    apiDiscount,
      fechaInicio:  `${formStartDate}T00:00:00+00:00`,
      fechaFin:     `${formEndDate}T23:59:59+00:00`,
    };

    try {
      await inventoryService.createTariff(room.id, request, accessToken);
      const allTariffs = await inventoryService.getRoomTariffs(room.id, accessToken);
      setVariations(allTariffs.filter(t => t.fechaInicio != null));
      resetAddForm();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : t('b2b.prices.modal.saveError'));
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete variation ─────────────────────────────────────────────────────

  const handleDelete = async (tariffId: string) => {
    setDeleteError(null);
    try {
      await inventoryService.deleteTariff(tariffId, accessToken);
      setVariations(prev => prev.filter(v => v.id !== tariffId));
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : t('b2b.prices.modal.deleteError'));
    }
  };

  // ── Derived values ───────────────────────────────────────────────────────

  const baseFinalPrice = baseTariff
    ? baseTariff.precioBase * (1 - baseTariff.descuento)
    : 0;

  const addFormFinalPrice =
    formPrice && formDiscount
      ? computeFinalPrice(Number(formPrice), formDiscountType, Number(formDiscount))
      : null;

  const canAddSubmit =
    !formLoading &&
    formPrice.trim() !== '' &&
    formDiscount.trim() !== '' &&
    formStartDate !== '' &&
    formEndDate !== '';

  const canSaveEdit =
    !editLoading &&
    editPrice.trim() !== '' &&
    editDiscount.trim() !== '' &&
    editStartDate !== '' &&
    editEndDate !== '';

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="large"
      dataTestId={dataTestId}
      className="tariff-detail-modal"
    >
      <div
        className="tariff-detail-modal__container"
        data-testid={`${dataTestId}-container`}
      >
        {/* ── Header ── */}
        <div className="tariff-detail-modal__header" data-testid={`${dataTestId}-header`}>
          <h2 className="tariff-detail-modal__title" data-testid={`${dataTestId}-title`}>
            {room?.tipo ?? room?.id ?? '—'}
          </h2>
          {room?.tipo && (
            <span
              className="tariff-detail-modal__room-type"
              data-testid={`${dataTestId}-room-type`}
            >
              {room.tipo}
            </span>
          )}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <p className="tariff-detail-modal__loading" data-testid={`${dataTestId}-loading`}>
            {t('b2b.prices.modal.loadingTariffs')}
          </p>
        )}

        {/* ── Fetch error ── */}
        {!loading && error && (
          <p className="tariff-detail-modal__error" data-testid={`${dataTestId}-error`}>
            {error}
          </p>
        )}

        {/* ── Main content ── */}
        {!loading && !error && baseTariff && (
          <>
            {/* Base tariff */}
            <section
              className="tariff-detail-modal__section"
              data-testid={`${dataTestId}-base-section`}
            >
              <h3 className="tariff-detail-modal__section-title">
                {t('b2b.prices.modal.baseTariff')}
              </h3>
              <div className="tariff-detail-modal__base-grid">
                <div className="tariff-detail-modal__base-row">
                  <span className="tariff-detail-modal__base-label">
                    {t('b2b.prices.modal.priceLabel')}
                  </span>
                  <span
                    className="tariff-detail-modal__base-value"
                    data-testid={`${dataTestId}-base-price`}
                  >
                    ${baseTariff.precioBase}
                  </span>
                </div>
                <div className="tariff-detail-modal__base-row">
                  <span className="tariff-detail-modal__base-label">
                    {t('b2b.prices.modal.discountLabel')}
                  </span>
                  <span
                    className="tariff-detail-modal__base-value"
                    data-testid={`${dataTestId}-base-discount`}
                  >
                    {(baseTariff.descuento * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="tariff-detail-modal__base-row">
                  <span className="tariff-detail-modal__base-label">
                    {t('b2b.prices.modal.finalPriceLabel')}
                  </span>
                  <span
                    className="tariff-detail-modal__base-value tariff-detail-modal__base-value--final"
                    data-testid={`${dataTestId}-final-price`}
                  >
                    ${baseFinalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </section>

            {/* Variations list */}
            <section
              className="tariff-detail-modal__section"
              data-testid={`${dataTestId}-variations-section`}
            >
              <h3 className="tariff-detail-modal__section-title">
                {t('b2b.prices.modal.variations')}
              </h3>

              {deleteError && (
                <p
                  className="tariff-detail-modal__error"
                  data-testid={`${dataTestId}-delete-error`}
                >
                  {deleteError}
                </p>
              )}

              {variations.length === 0 ? (
                <p
                  className="tariff-detail-modal__empty"
                  data-testid={`${dataTestId}-no-variations`}
                >
                  {t('b2b.prices.modal.noVariations')}
                </p>
              ) : (
                <table
                  className="tariff-detail-modal__table"
                  data-testid={`${dataTestId}-variations-table`}
                >
                  <thead>
                    <tr>
                      <th>{t('b2b.prices.modal.colPrice')}</th>
                      <th>{t('b2b.prices.modal.colDiscount')}</th>
                      <th>{t('b2b.prices.modal.colFrom')}</th>
                      <th>{t('b2b.prices.modal.colTo')}</th>
                      <th>{t('b2b.prices.modal.colActions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variations.map((v) =>
                      editingId === v.id ? (
                        /* ── Inline edit row ── */
                        <tr
                          key={v.id}
                          className="tariff-detail-modal__edit-row"
                          data-testid={`${dataTestId}-edit-row-${v.id}`}
                        >
                          <td>
                            <Input
                              type="number"
                              min="0"
                              value={editPrice}
                              onChange={e => setEditPrice(e.target.value)}
                              dataTestId={`${dataTestId}-edit-price-${v.id}`}
                            />
                          </td>
                          <td>
                            <DiscountFields
                              type={editDiscountType}
                              value={editDiscount}
                              testIdPrefix={`${dataTestId}-edit-${v.id}`}
                              onTypeChange={setEditDiscountType}
                              onValueChange={setEditDiscount}
                              t={t}
                            />
                          </td>
                          <td>
                            <Input
                              type="date"
                              value={editStartDate}
                              onChange={e => setEditStartDate(e.target.value)}
                              dataTestId={`${dataTestId}-edit-start-${v.id}`}
                            />
                          </td>
                          <td>
                            <Input
                              type="date"
                              value={editEndDate}
                              onChange={e => setEditEndDate(e.target.value)}
                              dataTestId={`${dataTestId}-edit-end-${v.id}`}
                            />
                          </td>
                          <td className="tariff-detail-modal__edit-actions">
                            {editError && (
                              <p
                                className="tariff-detail-modal__inline-error"
                                data-testid={`${dataTestId}-edit-error-${v.id}`}
                              >
                                {editError}
                              </p>
                            )}
                            <Button
                              variant="primary"
                              size="small"
                              onClick={() => handleSaveEdit(v.id)}
                              disabled={!canSaveEdit}
                              dataTestId={`${dataTestId}-edit-save-${v.id}`}
                            >
                              {t('b2b.prices.modal.updateBtn')}
                            </Button>
                            <Button
                              variant="secondary"
                              size="small"
                              onClick={handleCancelEdit}
                              disabled={editLoading}
                              dataTestId={`${dataTestId}-edit-cancel-${v.id}`}
                            >
                              {t('b2b.prices.modal.cancelEditBtn')}
                            </Button>
                          </td>
                        </tr>
                      ) : (
                        /* ── Display row ── */
                        <tr
                          key={v.id}
                          data-testid={`${dataTestId}-variation-row-${v.id}`}
                        >
                          <td>${v.precioBase}</td>
                          <td>{(v.descuento * 100).toFixed(0)}%</td>
                          <td>{formatDate(v.fechaInicio)}</td>
                          <td>{formatDate(v.fechaFin)}</td>
                          <td className="tariff-detail-modal__row-actions">
                            <Button
                              variant="secondary"
                              size="small"
                              onClick={() => handleStartEdit(v)}
                              dataTestId={`${dataTestId}-edit-btn-${v.id}`}
                            >
                              {t('b2b.prices.modal.editBtn')}
                            </Button>
                            <Button
                              variant="primary"
                              size="small"
                              className="tariff-detail-modal__delete-btn"
                              onClick={() => handleDelete(v.id)}
                              dataTestId={`${dataTestId}-delete-${v.id}`}
                            >
                              {t('b2b.prices.modal.deleteBtn')}
                            </Button>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              )}
            </section>

            {/* Add variation form */}
            <section
              className="tariff-detail-modal__section tariff-detail-modal__section--form"
              data-testid={`${dataTestId}-form-section`}
            >
              <h3 className="tariff-detail-modal__section-title">
                {t('b2b.prices.modal.addVariationTitle')}
              </h3>

              <div
                className="tariff-detail-modal__form-grid"
                data-testid={`${dataTestId}-form`}
              >
                {/* Price */}
                <div className="tariff-detail-modal__form-group">
                  <label
                    className="tariff-detail-modal__form-label"
                    htmlFor={`${dataTestId}-form-price`}
                  >
                    {t('b2b.prices.modal.priceLabel')}
                  </label>
                  <Input
                    id={`${dataTestId}-form-price`}
                    type="number"
                    min="0"
                    value={formPrice}
                    onChange={e => setFormPrice(e.target.value)}
                    dataTestId={`${dataTestId}-form-price`}
                    placeholder="0"
                  />
                </div>

                {/* Discount type + value */}
                <div className="tariff-detail-modal__form-group">
                  <label className="tariff-detail-modal__form-label">
                    {t('b2b.prices.modal.discountTypeLabel')}
                  </label>
                  <DiscountFields
                    type={formDiscountType}
                    value={formDiscount}
                    testIdPrefix={`${dataTestId}-form`}
                    onTypeChange={setFormDiscountType}
                    onValueChange={setFormDiscount}
                    t={t}
                  />
                </div>

                {/* Start date */}
                <div className="tariff-detail-modal__form-group">
                  <label
                    className="tariff-detail-modal__form-label"
                    htmlFor={`${dataTestId}-form-start`}
                  >
                    {t('b2b.prices.modal.startDateLabel')}
                  </label>
                  <Input
                    id={`${dataTestId}-form-start`}
                    type="date"
                    value={formStartDate}
                    onChange={e => setFormStartDate(e.target.value)}
                    dataTestId={`${dataTestId}-form-start`}
                  />
                </div>

                {/* End date */}
                <div className="tariff-detail-modal__form-group">
                  <label
                    className="tariff-detail-modal__form-label"
                    htmlFor={`${dataTestId}-form-end`}
                  >
                    {t('b2b.prices.modal.endDateLabel')}
                  </label>
                  <Input
                    id={`${dataTestId}-form-end`}
                    type="date"
                    value={formEndDate}
                    onChange={e => setFormEndDate(e.target.value)}
                    dataTestId={`${dataTestId}-form-end`}
                  />
                </div>
              </div>

              {/* Final price preview */}
              {addFormFinalPrice !== null && Number(formPrice) > 0 && (
                <p
                  className="tariff-detail-modal__price-preview"
                  data-testid={`${dataTestId}-form-preview`}
                >
                  {t('b2b.prices.modal.finalPricePreview')}: $
                  {addFormFinalPrice.toFixed(2)}
                </p>
              )}

              {formError && (
                <p
                  className="tariff-detail-modal__error"
                  data-testid={`${dataTestId}-form-error`}
                >
                  {formError}
                </p>
              )}

              <div className="tariff-detail-modal__form-actions">
                <Button
                  variant="primary"
                  size="small"
                  onClick={handleAdd}
                  disabled={!canAddSubmit}
                  dataTestId={`${dataTestId}-add-btn`}
                >
                  {t('b2b.prices.modal.addBtn')}
                </Button>
              </div>
            </section>
          </>
        )}

        {/* Footer */}
        <div className="tariff-detail-modal__footer" data-testid={`${dataTestId}-footer`}>
          <Button
            variant="primary"
            size="small"
            onClick={handleClose}
            dataTestId={`${dataTestId}-close-btn`}
          >
            {t('b2b.prices.modal.closeBtn')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TarifaDetailModal;

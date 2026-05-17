import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { B2BHeader, B2BSidebar } from '@/components/layout';
import { useAuth } from '@/context/AuthContext';
import { DataTable, TarifaDetailModal } from '@/components/shared';
import {
  inventoryService,
  HabitacionInventario,
  Tarifa,
} from '@/services/inventory.service';
import { getHotelIdFromToken } from '@/services/booking.service';
import './PricesManagerPage.scss';

// ── Types ──────────────────────────────────────────────────────────────────────

interface RoomRow extends HabitacionInventario {
  baseTariff: Tarifa | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatPrice(amount: number, moneda?: string): string {
  const formatted = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
  return moneda ? `${moneda} ${formatted}` : `$${formatted}`;
}

// ── Component ──────────────────────────────────────────────────────────────────

const PricesManagerPage: React.FC = () => {
  const { logout, user, accessToken } = useAuth();
  const { t } = useTranslation();

  // ── Room data ────────────────────────────────────────────────────────────
  const [roomRows, setRoomRows] = useState<RoomRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  // ── Modal ────────────────────────────────────────────────────────────────
  const [selectedRoom, setSelectedRoom] = useState<RoomRow | null>(null);
  const [isModalOpen, setIsModalOpen]   = useState(false);

  // ── Inline base-price edit ───────────────────────────────────────────────
  const [editingRoomId, setEditingRoomId]   = useState<string | null>(null);
  const [editPrice, setEditPrice]           = useState('');
  const [editDiscount, setEditDiscount]     = useState('');
  const [editStartDate, setEditStartDate]   = useState('');
  const [editEndDate, setEditEndDate]       = useState('');
  const [saveLoading, setSaveLoading]       = useState(false);
  const [saveError, setSaveError]           = useState<string | null>(null);

  // ── Fetch rooms + their base tariffs ────────────────────────────────────
  useEffect(() => {
    if (!accessToken) return;

    const hotelId = getHotelIdFromToken(accessToken);
    if (!hotelId) {
      setError('b2b.prices.noToken');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    inventoryService
      .getHotelRooms(hotelId, accessToken)
      .then(async (rooms) => {
        const results = await Promise.allSettled(
          rooms.map((r) => inventoryService.getBaseTariff(r.id, accessToken!)),
        );
        setRoomRows(
          rooms.map((r, i) => ({
            ...r,
            baseTariff:
              results[i]?.status === 'fulfilled'
                ? (results[i] as PromiseFulfilledResult<Tarifa>).value
                : null,
          })),
        );
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'b2b.prices.errorLoading');
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  // ── Modal handlers ───────────────────────────────────────────────────────

  const handleOpenModal = (room: RoomRow) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    const roomId = selectedRoom?.id;
    setIsModalOpen(false);
    setSelectedRoom(null);
    // Refresh base tariff in background — it may have changed inside the modal
    if (roomId && accessToken) {
      inventoryService.getBaseTariff(roomId, accessToken)
        .then((refreshed) => {
          setRoomRows((prev) =>
            prev.map((r) => (r.id === roomId ? { ...r, baseTariff: refreshed } : r)),
          );
        })
        .catch(() => {
          setRoomRows((prev) =>
            prev.map((r) => (r.id === roomId ? { ...r, baseTariff: null } : r)),
          );
        });
    }
  };

  // ── Inline edit handlers ─────────────────────────────────────────────────

  const handleStartEdit = (room: RoomRow) => {
    setEditingRoomId(room.id);
    setEditPrice(room.baseTariff ? String(room.baseTariff.precioBase) : '');
    setEditDiscount(room.baseTariff ? String(room.baseTariff.descuento) : '0');
    setEditStartDate(
      room.baseTariff?.fechaInicio
        ? room.baseTariff.fechaInicio.substring(0, 10)
        : '',
    );
    setEditEndDate(
      room.baseTariff?.fechaFin
        ? room.baseTariff.fechaFin.substring(0, 10)
        : '',
    );
    setSaveError(null);
  };

  const handleCancelEdit = () => {
    setEditingRoomId(null);
    setSaveError(null);
  };

  const handleSave = async (room: RoomRow) => {
    setSaveLoading(true);
    setSaveError(null);
    try {
      // Use the POST response directly to update the table — no extra GET needed
      const created = await inventoryService.createTariff(
        room.id,
        {
          habitacionId: room.id,
          precioBase: Number(editPrice),
          descuento: Number(editDiscount),
          fechaInicio: `${editStartDate}T00:00:00+00:00`,
          fechaFin:    `${editEndDate}T23:59:59+00:00`,
        },
        accessToken!,
      );
      setRoomRows((prev) =>
        prev.map((r) => (r.id === room.id ? { ...r, baseTariff: created } : r)),
      );
      setEditingRoomId(null);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'b2b.prices.saveError');
    } finally {
      setSaveLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="prices-manager-page" data-testid="prices-manager-page">
      <B2BHeader breadcrumbText="Travelhub/Prices Manager" dataTestId="prices-manager-header" />

      <div className="prices-manager-page__container">
        <B2BSidebar
          onLogout={logout}
          userEmail={user?.email}
          userRole={user?.rol}
          dataTestId="prices-manager-sidebar"
        />

        <main className="prices-manager-page__main">
          <div className="prices-manager-page__content">

            <h1 className="prices-manager-page__title">
              <strong>{t('b2b.prices.title')}</strong>
            </h1>

            <h3 className="prices-manager-page__subtitle">
              {t('b2b.prices.bookingPlacesTable')}
            </h3>

            {/* Inline-edit save error */}
            {saveError && (
              <p
                className="prices-manager-page__error"
                data-testid="prices-manager-save-error"
              >
                {saveError}
              </p>
            )}

            {/* Loading */}
            {loading && (
              <p
                className="prices-manager-page__loading"
                data-testid="prices-manager-loading"
              >
                {t('b2b.prices.loading')}
              </p>
            )}

            {/* Fetch error */}
            {!loading && error && (
              <p
                className="prices-manager-page__error"
                data-testid="prices-manager-error"
              >
                {error}
              </p>
            )}

            {/* Empty */}
            {!loading && !error && roomRows.length === 0 && (
              <p
                className="prices-manager-page__empty"
                data-testid="prices-manager-empty"
              >
                {t('b2b.prices.noRooms')}
              </p>
            )}

            {/* Table */}
            {!loading && !error && roomRows.length > 0 && (
              <div className="prices-manager-page__table-wrapper">
                <DataTable
                  columns={[
                    { key: 'id',             header: t('b2b.prices.colPlace') },
                    { key: 'tipo',           header: t('b2b.prices.colType') },
                    { key: 'capacidadMaxima', header: t('b2b.prices.colCapacity') },
                    { key: 'categoria',      header: t('b2b.prices.colPayoutStatus') },

                    // ── Base price (display + inline edit) ─────────────────
                    {
                      key: 'basePriceCol',
                      header: t('b2b.prices.colBasePrice'),
                      render: (item: RoomRow) => {
                        /* ── Inline edit form ── */
                        if (editingRoomId === item.id) {
                          return (
                            <div
                              className="prices-manager-page__inline-edit"
                              data-testid={`prices-manager-inline-edit-${item.id}`}
                            >
                              <label className="prices-manager-page__inline-label">
                                {t('b2b.prices.editPriceLabel')}
                              </label>
                              <input
                                className="prices-manager-page__inline-input"
                                type="number"
                                min="0"
                                value={editPrice}
                                onChange={(e) => setEditPrice(e.target.value)}
                                placeholder={t('b2b.prices.pricePlaceholder')}
                                data-testid={`prices-manager-edit-price-${item.id}`}
                              />
                              <label className="prices-manager-page__inline-label">
                                {t('b2b.prices.editDiscountLabel')}
                              </label>
                              <input
                                className="prices-manager-page__inline-input prices-manager-page__inline-input--sm"
                                type="number"
                                min="0"
                                max="100"
                                value={editDiscount}
                                onChange={(e) => setEditDiscount(e.target.value)}
                                placeholder={t('b2b.prices.discountPlaceholder')}
                                data-testid={`prices-manager-edit-discount-${item.id}`}
                              />
                              <label className="prices-manager-page__inline-label">
                                {t('b2b.prices.editStartDateLabel')}
                              </label>
                              <input
                                className="prices-manager-page__inline-input prices-manager-page__inline-input--date"
                                type="date"
                                value={editStartDate}
                                onChange={(e) => setEditStartDate(e.target.value)}
                                data-testid={`prices-manager-edit-start-${item.id}`}
                              />
                              <label className="prices-manager-page__inline-label">
                                {t('b2b.prices.editEndDateLabel')}
                              </label>
                              <input
                                className="prices-manager-page__inline-input prices-manager-page__inline-input--date"
                                type="date"
                                value={editEndDate}
                                onChange={(e) => setEditEndDate(e.target.value)}
                                data-testid={`prices-manager-edit-end-${item.id}`}
                              />
                              <button
                                className="prices-manager-page__inline-save-btn"
                                onClick={() => handleSave(item)}
                                disabled={
                                  saveLoading ||
                                  editPrice.trim() === '' ||
                                  editStartDate === '' ||
                                  editEndDate === ''
                                }
                                data-testid={`prices-manager-save-btn-${item.id}`}
                                title={t('b2b.prices.savePriceBtn')}
                              >
                                ✓
                              </button>
                              <button
                                className="prices-manager-page__inline-cancel-btn"
                                onClick={handleCancelEdit}
                                disabled={saveLoading}
                                data-testid={`prices-manager-cancel-btn-${item.id}`}
                                title={t('b2b.prices.cancelPriceBtn')}
                              >
                                ✕
                              </button>
                            </div>
                          );
                        }

                        /* ── Display (+ set-price button only when no base tariff) ── */
                        return (
                          <div
                            className="prices-manager-page__base-price"
                            data-testid={`prices-manager-base-price-${item.id}`}
                          >
                            {item.baseTariff ? (
                              <span className="prices-manager-page__base-price-value">
                                {formatPrice(item.baseTariff.precioBase, item.baseTariff.moneda)}
                                {item.baseTariff.descuento > 0 && (
                                  <span className="prices-manager-page__base-price-discount">
                                    {' '}−{item.baseTariff.descuento}%
                                  </span>
                                )}
                              </span>
                            ) : (
                              <>
                                <span className="prices-manager-page__base-price-empty">—</span>
                                <button
                                  className="prices-manager-page__edit-btn"
                                  onClick={() => handleStartEdit(item)}
                                  data-testid={`prices-manager-edit-btn-${item.id}`}
                                  title={t('b2b.prices.setPriceBtn')}
                                >
                                  {t('b2b.prices.setPriceBtn')}
                                </button>
                              </>
                            )}
                          </div>
                        );
                      },
                    },

                    // ── Config / detail arrow ──────────────────────────────
                    {
                      key: 'config',
                      header: t('b2b.prices.colConfig'),
                      render: (item: RoomRow) => (
                        <button
                          className="prices-manager-page__action-arrow"
                          onClick={() => item.baseTariff && handleOpenModal(item)}
                          disabled={!item.baseTariff}
                          data-testid={`prices-manager-config-btn-${item.id}`}
                          aria-label={`Configure ${item.tipo ?? item.id}`}
                          title={
                            !item.baseTariff
                              ? t('b2b.prices.noBasePriceTitle')
                              : undefined
                          }
                        >
                          →
                        </button>
                      ),
                    },
                  ]}
                  data={roomRows}
                  dataTestId="prices-manager-table"
                />
              </div>
            )}

          </div>
        </main>
      </div>

      {selectedRoom && (
        <TarifaDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          room={selectedRoom}
          accessToken={accessToken ?? ''}
          dataTestId="prices-manager-tariff-modal"
        />
      )}
    </div>
  );
};

export default PricesManagerPage;

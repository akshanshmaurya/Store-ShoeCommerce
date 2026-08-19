import { ServerInventoryReservationRepository } from '@/server/repositories/inventory-reservation-repository';

describe('Storefront Inventory Reservation Test Suite', () => {
  const variantId = 'var-test-reserve-001';
  const customerId = 'cust-test-123';

  beforeEach(() => {
    ServerInventoryReservationRepository.clearFallbackStore();
  });

  it('atomically reserves stock and creates an active reservation record', async () => {
    ServerInventoryReservationRepository.setFallbackStock(variantId, 10);

    const resKey = `res_unit_${Date.now()}`;
    const result = await ServerInventoryReservationRepository.reserveStock(
      variantId,
      3,
      resKey,
      customerId,
      900
    );

    expect(result.success).toBe(true);
    expect(result.reservationKey).toBe(resKey);
    expect(result.expiresAt).toBeDefined();
  });

  it('rejects reservation and preserves stock when requested quantity exceeds available inventory', async () => {
    ServerInventoryReservationRepository.setFallbackStock(variantId, 2);

    const resKey = `res_excess_${Date.now()}`;
    await expect(
      ServerInventoryReservationRepository.reserveStock(variantId, 5, resKey, customerId)
    ).rejects.toThrow('Insufficient available inventory');
  });

  it('releases an active reservation and restores available inventory', async () => {
    ServerInventoryReservationRepository.setFallbackStock(variantId, 10);

    const resKey = `res_release_${Date.now()}`;
    await ServerInventoryReservationRepository.reserveStock(variantId, 4, resKey, customerId);

    const released = await ServerInventoryReservationRepository.releaseReservation(resKey, 'Test release');
    expect(released).toBe(true);

    // Verify stock can be reserved again after release
    const secondResKey = `res_after_release_${Date.now()}`;
    const secondResult = await ServerInventoryReservationRepository.reserveStock(variantId, 10, secondResKey, customerId);
    expect(secondResult.success).toBe(true);
  });

  it('associates an active reservation with an order ID', async () => {
    ServerInventoryReservationRepository.setFallbackStock(variantId, 10);

    const resKey = `res_convert_${Date.now()}`;
    await ServerInventoryReservationRepository.reserveStock(variantId, 2, resKey, customerId);

    const converted = await ServerInventoryReservationRepository.associateWithOrder(resKey, 'order-999');
    expect(converted).toBe(true);
  });
});

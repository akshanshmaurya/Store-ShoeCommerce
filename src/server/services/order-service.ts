import { ServerOrderRepository } from '../repositories/order-repository';
import { ServerInventoryReservationRepository } from '../repositories/inventory-reservation-repository';
import { SanitizedOrderResponse, sanitizeOrder } from './checkout-service';
import { NotFoundError, BadRequestError } from '../utils/api-error';

export class OrderService {
  /**
   * List customer's orders
   */
  static async getCustomerOrders(customerId: string): Promise<SanitizedOrderResponse[]> {
    if (!customerId) {
      throw new BadRequestError('Customer ID is required.');
    }

    const docs = await ServerOrderRepository.findByCustomerId(customerId);
    return docs.map(sanitizeOrder);
  }

  /**
   * Get single order detail strictly scoped to customer
   */
  static async getOrderDetails(customerId: string, orderNumber: string): Promise<SanitizedOrderResponse> {
    if (!orderNumber) {
      throw new BadRequestError('Order number is required.');
    }

    const doc = await ServerOrderRepository.findByOrderNumber(orderNumber, customerId);
    if (!doc) {
      throw new NotFoundError('Order not found or does not belong to this account.');
    }

    return sanitizeOrder(doc);
  }

  /**
   * Cancel an order in pending state and release inventory reservations
   */
  static async cancelOrder(
    customerId: string,
    orderNumber: string,
    reason?: string
  ): Promise<SanitizedOrderResponse> {
    const doc = await ServerOrderRepository.findByOrderNumber(orderNumber, customerId);
    if (!doc) {
      throw new NotFoundError('Order not found or does not belong to this account.');
    }

    if (doc.status === 'cancelled') {
      return sanitizeOrder(doc); // Idempotent
    }

    if (doc.status !== 'pending' && doc.status !== 'confirmed') {
      throw new BadRequestError(`Cannot cancel an order with status "${doc.status}".`);
    }

    // Release reservations
    if (doc.reservationKeys && doc.reservationKeys.length > 0) {
      for (const resKey of doc.reservationKeys) {
        await ServerInventoryReservationRepository.releaseReservation(
          resKey,
          reason || 'Customer requested order cancellation'
        );
      }
    }

    const updated = await ServerOrderRepository.updateStatus(
      orderNumber,
      customerId,
      'cancelled',
      reason
    );

    if (!updated) {
      throw new NotFoundError('Failed to cancel order.');
    }

    return sanitizeOrder(updated);
  }
}

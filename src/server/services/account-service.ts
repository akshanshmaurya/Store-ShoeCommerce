import { ServerCustomerRepository } from '../repositories/customer-repository';
import { ServerAddressRepository, AddressDocument } from '../repositories/address-repository';
import { SanitizedCustomer, sanitizeCustomer } from './auth-service';
import { BadRequestError, NotFoundError } from '../utils/api-error';

export interface AddressResponse {
  id: string;
  recipientName: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  type: 'shipping' | 'billing' | 'both';
  createdAt: string;
  updatedAt: string;
}

export function formatAddress(doc: AddressDocument): AddressResponse {
  return {
    id: doc._id.toString(),
    recipientName: doc.recipientName,
    phone: doc.phone,
    line1: doc.line1,
    line2: doc.line2,
    city: doc.city,
    state: doc.state,
    postalCode: doc.postalCode,
    country: doc.country,
    isDefault: !!doc.isDefault,
    type: doc.type || 'shipping',
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
  };
}

export class AccountService {
  /**
   * Get customer profile
   */
  static async getProfile(customerId: string): Promise<SanitizedCustomer> {
    const doc = await ServerCustomerRepository.findById(customerId);
    if (!doc) {
      throw new NotFoundError('Customer not found.');
    }
    return sanitizeCustomer(doc);
  }

  /**
   * Update customer profile
   */
  static async updateProfile(
    customerId: string,
    updates: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      preferredSizeSystem?: 'US' | 'UK' | 'EU';
      preferredSizeValue?: string;
      marketingOptIn?: boolean;
    }
  ): Promise<SanitizedCustomer> {
    const existing = await ServerCustomerRepository.findById(customerId);
    if (!existing) {
      throw new NotFoundError('Customer not found.');
    }

    const updatedProfile = {
      preferredSizeSystem: updates.preferredSizeSystem || existing.profile?.preferredSizeSystem || 'US',
      preferredSizeValue: updates.preferredSizeValue || existing.profile?.preferredSizeValue || '10',
      marketingOptIn: updates.marketingOptIn !== undefined ? updates.marketingOptIn : existing.profile?.marketingOptIn,
    };

    const doc = await ServerCustomerRepository.updateProfile(customerId, {
      firstName: updates.firstName?.trim(),
      lastName: updates.lastName?.trim(),
      phone: updates.phone?.trim(),
      profile: updatedProfile,
    });

    if (!doc) {
      throw new NotFoundError('Failed to update profile.');
    }

    return sanitizeCustomer(doc);
  }

  /**
   * List customer's saved addresses
   */
  static async getAddresses(customerId: string): Promise<AddressResponse[]> {
    const docs = await ServerAddressRepository.findByCustomerId(customerId);
    return docs.map(formatAddress);
  }

  /**
   * Create a new address for customer
   */
  static async createAddress(
    customerId: string,
    data: {
      recipientName: string;
      phone?: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      isDefault?: boolean;
      type?: 'shipping' | 'billing' | 'both';
    }
  ): Promise<AddressResponse> {
    if (!data.recipientName || !data.line1 || !data.city || !data.state || !data.postalCode || !data.country) {
      throw new BadRequestError('Recipient name, line 1, city, state, postal code, and country are required.');
    }

    const existing = await ServerAddressRepository.findByCustomerId(customerId);
    const isFirst = existing.length === 0;

    const doc = await ServerAddressRepository.create(customerId, {
      recipientName: data.recipientName.trim(),
      phone: data.phone?.trim(),
      line1: data.line1.trim(),
      line2: data.line2?.trim(),
      city: data.city.trim(),
      state: data.state.trim(),
      postalCode: data.postalCode.trim(),
      country: data.country.trim(),
      isDefault: isFirst ? true : !!data.isDefault,
      type: data.type || 'shipping',
    });

    return formatAddress(doc);
  }

  /**
   * Update existing address
   */
  static async updateAddress(
    customerId: string,
    addressId: string,
    data: Partial<{
      recipientName: string;
      phone?: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      isDefault: boolean;
      type: 'shipping' | 'billing' | 'both';
    }>
  ): Promise<AddressResponse> {
    const existing = await ServerAddressRepository.findById(addressId, customerId);
    if (!existing) {
      throw new NotFoundError('Address not found or does not belong to this account.');
    }

    const doc = await ServerAddressRepository.update(addressId, customerId, {
      ...(data.recipientName ? { recipientName: data.recipientName.trim() } : {}),
      ...(data.phone !== undefined ? { phone: data.phone?.trim() } : {}),
      ...(data.line1 ? { line1: data.line1.trim() } : {}),
      ...(data.line2 !== undefined ? { line2: data.line2?.trim() } : {}),
      ...(data.city ? { city: data.city.trim() } : {}),
      ...(data.state ? { state: data.state.trim() } : {}),
      ...(data.postalCode ? { postalCode: data.postalCode.trim() } : {}),
      ...(data.country ? { country: data.country.trim() } : {}),
      ...(data.isDefault !== undefined ? { isDefault: data.isDefault } : {}),
      ...(data.type ? { type: data.type } : {}),
    });

    if (!doc) {
      throw new NotFoundError('Address update failed.');
    }

    return formatAddress(doc);
  }

  /**
   * Delete address
   */
  static async deleteAddress(customerId: string, addressId: string): Promise<boolean> {
    const existing = await ServerAddressRepository.findById(addressId, customerId);
    if (!existing) {
      throw new NotFoundError('Address not found or does not belong to this account.');
    }

    return ServerAddressRepository.delete(addressId, customerId);
  }

  /**
   * Set address as default
   */
  static async setDefaultAddress(customerId: string, addressId: string): Promise<AddressResponse> {
    const existing = await ServerAddressRepository.findById(addressId, customerId);
    if (!existing) {
      throw new NotFoundError('Address not found or does not belong to this account.');
    }

    const doc = await ServerAddressRepository.setDefault(addressId, customerId);
    if (!doc) {
      throw new NotFoundError('Failed to set default address.');
    }

    return formatAddress(doc);
  }
}

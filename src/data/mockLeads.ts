/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Lead } from '../types';

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead_1',
    vehicleId: 'vehicle_1',
    vehicleName: 'Mercedes-Benz E-Class',
    customerName: 'Anil Ambani',
    customerEmail: 'anil@ambanigroup.in',
    customerPhone: '+91 98200 11223',
    type: 'BUY_INQUIRY',
    status: 'NEW',
    preferredContactMethod: 'WhatsApp',
    notes: 'Inquired through E-Class detail page. Customer is looking for immediate delivery. Needs to check financing assistance options in Mumbai.',
    createdAt: '2026-06-06T10:30:00Z',
    updatedAt: '2026-06-06T10:30:00Z'
  },
  {
    id: 'lead_2',
    vehicleId: 'vehicle_2',
    vehicleName: 'BMW 5 Series',
    customerName: 'Priya Sharma',
    customerEmail: 'priya.sharma@yahoo.co.in',
    customerPhone: '+91 91670 54321',
    type: 'BUY_INQUIRY',
    status: 'CONTACTED',
    preferredContactMethod: 'Phone',
    notes: 'Contacted regarding the BMW 530i. Wants to bring her family for a test drive this Sunday at 11:30 AM.',
    createdAt: '2026-06-05T09:15:00Z',
    updatedAt: '2026-06-05T15:00:00Z'
  },
  {
    id: 'lead_3',
    vehicleId: 'vehicle_4',
    vehicleName: 'Porsche Macan',
    customerName: 'Vikram Malhotra',
    customerEmail: 'vikram.m@malhotracapital.com',
    customerPhone: '+91 93221 00778',
    type: 'BUY_INQUIRY',
    status: 'NEGOTIATING',
    preferredContactMethod: 'WhatsApp',
    notes: 'Negotiating final pricing on the Porsche Macan. Offered 75 Lakhs all-inclusive. Trade-in valuation pending for his older C-Class.',
    createdAt: '2026-06-04T13:40:00Z',
    updatedAt: '2026-06-06T18:15:00Z'
  },
  {
    id: 'lead_4',
    vehicleId: null,
    vehicleName: null,
    customerName: 'Jay Mehta',
    customerEmail: 'jay.mehta@gemstone.co',
    customerPhone: '+91 98900 87654',
    type: 'SELL_INQUIRY',
    status: 'NEW',
    preferredContactMethod: 'Email',
    notes: 'Requested selling evaluation for his Mercedes-Benz C200 (2018/2nd Owner/45000km). Expected price is around 28 Lakhs. Uploaded 2 compressed exterior images of his sedan.',
    expectedPrice: 28,
    sellCarDetails: {
      make: 'Mercedes-Benz',
      model: 'C-Class C200',
      year: 2018,
      mileage: 45000,
      ownership: 2
    },
    createdAt: '2026-06-07T05:20:00Z',
    updatedAt: '2026-06-07T05:20:00Z'
  },
  {
    id: 'lead_5',
    vehicleId: 'vehicle_3',
    vehicleName: 'Audi A6',
    customerName: 'Rohan Mehra',
    customerEmail: 'rohan.mehra@gmail.com',
    customerPhone: '+91 97732 40404',
    type: 'BUY_INQUIRY',
    status: 'BOOKED',
    preferredContactMethod: 'Phone',
    notes: 'Audi A6 purchase booked. Received token deposit of ₹2,00,000 via RTGS. Document collection in progress for registration transfer.',
    createdAt: '2026-06-02T11:00:00Z',
    updatedAt: '2026-06-05T12:00:00Z'
  }
];

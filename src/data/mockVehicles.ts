/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Vehicle } from '../types';

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'vehicle_1',
    make: 'Toyota',
    model: 'Innova Crysta',
    variant: '2.4 GX 8-Seater Diesel',
    year: 2020,
    fuelType: 'Diesel',
    transmission: 'Manual',
    exteriorColor: 'Bronze Metallic',
    interiorColor: 'Premium Tan Fabric',
    price: 18.50, // 18.50 Lakhs
    mileage: 48000,
    ownerCount: 1,
    registration: 'MH-03-DS-1244',
    description: 'Immaculate condition Toyota Innova Crysta GX 8-seater. Single owner, meticulously serviced at authorized Toyota workshop on L.B.S. Marg, Mulund West. Exceptional cabin space and dual-blower rear air conditioning system – the ultimate road-trip vehicle for Indian families.',
    features: [
      'Dual Airbags & ABS with EBD',
      'Dual-Blower Rear AC Controls',
      '8-Seater Layout (3 Rows)',
      'Touchscreen Infotainment System',
      'Steering Mounted Audio Controls',
      'Electrically Adjustable Side Mirrors',
      'Engine ECO/PWR Drive Modes'
    ],
    inspectionNotes: '100% certified multi-point family safety check completed. No accidents, original bronze paint, tyre health at 85%, complete suspension check done. AC blower cleaned.',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800'
    ],
    createdAt: '2026-05-20T10:00:00Z',
    updatedAt: '2026-06-01T12:00:00Z',
    isFeatured: true
  },
  {
    id: 'vehicle_2',
    make: 'Hyundai',
    model: 'Creta',
    variant: '1.5 S+ Petrol',
    year: 2021,
    fuelType: 'Petrol',
    transmission: 'Manual',
    exteriorColor: 'Polar White',
    interiorColor: 'Grey & Black Sporty Cabin',
    price: 13.80, // 13.80 Lakhs
    mileage: 28000,
    ownerCount: 1,
    registration: 'MH-04-KB-5590',
    description: 'Extremely neat and spacious Hyundai Creta S+ Petrol. Outstanding high-riding comfort, premium fuel economy, and absolute reliability. Includes a panoramic sunroof that kids adore, smart keyless push-start, and rear passenger window sunshades.',
    features: [
      'Panoramic Sunroof',
      'Smart Keyless Push-Button Start',
      'Android Auto & Apple CarPlay Support',
      'Rear AC Vents & USB Charger',
      'Ambient Cabin Lighting (Ice Blue)',
      'Rear Window Side Blinds Archive',
      'Arid Highway Stability program'
    ],
    inspectionNotes: 'Passed full engine compression and diagnostic scanning. No faults in electrical modules. Sunroof mechanism greased and tested. First-owner MH04 registration.',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=800'
    ],
    createdAt: '2026-05-25T14:30:00Z',
    updatedAt: '2026-06-02T09:15:00Z',
    isFeatured: true
  },
  {
    id: 'vehicle_3',
    make: 'Maruti Suzuki',
    model: 'Ertiga',
    variant: 'ZXi+ Smart Hybrid',
    year: 2022,
    fuelType: 'Hybrid',
    transmission: 'Manual',
    exteriorColor: 'Splendid Silver',
    interiorColor: 'Wood-Finish Beige Cabin',
    price: 10.45, // 10.45 Lakhs
    mileage: 19500,
    ownerCount: 1,
    registration: 'MH-02-FE-7722',
    description: 'Top-tier Maruti Suzuki Ertiga ZXi+ with Smart Hybrid fuel-saving tech. Exceptional mileage of 20+ km/l in Mumbai traffic. This represents the ultimate budget-conscious, highly durable 7-seater family multipurpose vehicle.',
    features: [
      'Smart Hybrid Fuel Save Engine',
      '7-Seater Soft Fabric Ergonomic Lounges',
      'Premium Faux Wood Dashboard Accents',
      'Automatic Climate Control',
      'Covers and Carpet Protector Kits',
      'Reverse Parking Camera with Sensors',
      'Projector Headlamps & Fog Lights'
    ],
    inspectionNotes: 'Very low running, hybrid battery performance fully certified. Clutch action is light and perfect for Mumbai stop-and-go roads. All seat slider rails lubricated.',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800'
    ],
    createdAt: '2026-05-18T08:10:00Z',
    updatedAt: '2026-06-03T11:40:00Z',
    isFeatured: false
  },
  {
    id: 'vehicle_4',
    make: 'Honda',
    model: 'City',
    variant: '1.5 i-VTEC V Automatic',
    year: 2019,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    exteriorColor: 'Crystal Black Pearl',
    interiorColor: 'Beige Premium Plush Seats',
    price: 8.90, // 8.90 Lakhs
    mileage: 38000,
    ownerCount: 2,
    registration: 'MH-03-EC-3310',
    description: 'Luxurious, super-smooth Honda City i-VTEC V Automatic. Features the ultra-reliable Honda CVT torque converter with steering-mounted paddle shifters. An outstanding family cruiser that offers legendary engine life, safety, and comfort.',
    features: [
      'Super-Smooth CVT Automatic Gearbox',
      'Paddle Shifters behind steering',
      'Cruising Speed Control system',
      'Rear Armrest with Cup Holders',
      'Eco Assist Mileage Coach tracker',
      'Keyless Smart Entry system',
      'Dual-Zone Airbags and Chassis bars'
    ],
    inspectionNotes: 'Transmission fluid replacement up-to-date. Brake liners changed. Smooth engine notes characteristic of legendary Honda i-VTEC engineering. Completely non-flooded/clear records.',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&q=80&w=800'
    ],
    createdAt: '2026-05-28T16:00:00Z',
    updatedAt: '2026-06-06T15:00:00Z',
    isFeatured: true
  },
  {
    id: 'vehicle_5',
    make: 'Mahindra',
    model: 'XUV700',
    variant: 'AX7 Luxury Pack Diesel AT',
    year: 2022,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    exteriorColor: 'Midnight Blue Metallic',
    interiorColor: 'Ivory White Leatherette',
    price: 21.50, // 21.50 Lakhs
    mileage: 16000,
    ownerCount: 1,
    registration: 'MH-43-AZ-0021',
    description: 'Top-spec Mahindra XUV700 AX7 Luxury Pack with state-of-the-art ADAS driver safety features and massive dual panoramic smart displays. Delivers high modern prestige, incredible family storage cabin formats, and robust 5-star crash safety.',
    features: [
      'Level 2 ADAS (Advanced Driver Assistance)',
      'Sony 3D surround audio system (12 Speakers)',
      'Smart Panoramic Skyroof',
      'Dual 10.25-inch Floating Screen Panel',
      'Electrically Pop-out Flush Smart Handles',
      '360-Degree Surround Family Protection cam',
      '6 Airbags & ESP stability assurance'
    ],
    inspectionNotes: 'First owner MH43 (Vashi) car. Perfect body shell, fully active ADAS safety radar and cameras, tyres in brand new state. Authorized service records via Mahindra Mulund West.',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=800'
    ],
    createdAt: '2026-05-15T09:00:00Z',
    updatedAt: '2026-06-04T10:00:00Z',
    isFeatured: false
  },
  {
    id: 'vehicle_6',
    make: 'Tata',
    model: 'Nexon',
    variant: 'XZ+ Petrol Manual',
    year: 2021,
    fuelType: 'Petrol',
    transmission: 'Manual',
    exteriorColor: 'Foliage Green',
    interiorColor: 'Durable Fabric Slate Charcoal',
    price: 9.20, // 9.20 Lakhs
    mileage: 22000,
    ownerCount: 1,
    registration: 'MH-01-EE-8800',
    description: 'Extremely solid, 5-Star global NCAP crash safety rated Tata Nexon XZ+. Perfectly engineered high-ground clearance suspension handles potholes with total ease. Ideal family companion for both urban commuting and weekend road getaways.',
    features: [
      '5-Star Global NCAP Crash Rating',
      'Multi-Drive Modes (City/Eco/Sport)',
      'Harman 8-Speaker Audio System',
      'High 209mm Ground Clearance',
      'Rear AC Vents & Fast Phone charging',
      'Reverse guiding cameras & sensors',
      'Roof rails & muscular family body stance'
    ],
    inspectionNotes: 'Solid build quality fully vetted. Braking system checked, standard servicing done last month. Suspension components showing zero degradation.',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=800'
    ],
    createdAt: '2026-05-30T10:00:00Z',
    updatedAt: '2026-06-05T12:00:00Z',
    isFeatured: false
  }
];

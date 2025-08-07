import Joi from 'joi';
import { RegisterRequest, LoginRequest, BookingRequest } from '../types';

// User registration validation
export const validateRegistration = (data: RegisterRequest) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(8).max(128).required().pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
    ).messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
      'any.required': 'Password is required'
    }),
    full_name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Full name must be at least 2 characters long',
      'string.max': 'Full name cannot exceed 100 characters',
      'any.required': 'Full name is required'
    }),
    phone: Joi.string().pattern(/^[6-9]\d{9}$/).optional().messages({
      'string.pattern.base': 'Please provide a valid 10-digit Indian mobile number'
    }),
    role: Joi.string().valid('customer', 'agent', 'admin', 'super_admin').optional()
  });

  return schema.validate(data);
};

// User login validation
export const validateLogin = (data: LoginRequest) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  });

  return schema.validate(data);
};

// Booking validation
export const validateBooking = (data: BookingRequest) => {
  const passengerSchema = Joi.object({
    seat_number: Joi.number().integer().positive().required(),
    passenger_name: Joi.string().min(2).max(100).required(),
    passenger_age: Joi.number().integer().min(1).max(120).optional(),
    passenger_gender: Joi.string().valid('male', 'female', 'other').optional(),
    id_proof_type: Joi.string().valid('aadhar', 'pan', 'passport', 'license').optional(),
    id_proof_number: Joi.string().min(4).max(20).optional(),
    is_primary: Joi.boolean().optional()
  });

  const schema = Joi.object({
    schedule_id: Joi.string().uuid().required(),
    seat_numbers: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
    passengers: Joi.array().items(passengerSchema).min(1).required(),
    boarding_point: Joi.string().uuid().required(),
    dropping_point: Joi.string().uuid().required(),
    contact_phone: Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
      'string.pattern.base': 'Please provide a valid 10-digit Indian mobile number'
    }),
    contact_email: Joi.string().email().optional(),
    special_requests: Joi.string().max(500).optional()
  }).custom((value, helpers) => {
    // Validate that seat_numbers and passengers arrays have the same length
    if (value.seat_numbers.length !== value.passengers.length) {
      return helpers.error('custom.seatPassengerMismatch');
    }

    // Validate that each passenger has a corresponding seat number
    const seatNumbers = value.seat_numbers.sort();
    const passengerSeats = value.passengers.map((p: any) => p.seat_number).sort();
    
    if (JSON.stringify(seatNumbers) !== JSON.stringify(passengerSeats)) {
      return helpers.error('custom.seatNumberMismatch');
    }

    return value;
  }).messages({
    'custom.seatPassengerMismatch': 'Number of passengers must match number of selected seats',
    'custom.seatNumberMismatch': 'Each passenger must have a corresponding seat number'
  });

  return schema.validate(data);
};

// Bus search validation
export const validateBusSearch = (data: any) => {
  const schema = Joi.object({
    source: Joi.string().min(2).max(100).required(),
    destination: Joi.string().min(2).max(100).required(),
    journey_date: Joi.date().min('now').required(),
    passengers: Joi.number().integer().min(1).max(10).optional().default(1),
    bus_type: Joi.string().valid('ac', 'non_ac', 'sleeper', 'semi_sleeper', 'luxury').optional()
  }).custom((value, helpers) => {
    // Ensure source and destination are different
    if (value.source.toLowerCase() === value.destination.toLowerCase()) {
      return helpers.error('custom.sameSourceDestination');
    }
    return value;
  }).messages({
    'custom.sameSourceDestination': 'Source and destination cannot be the same'
  });

  return schema.validate(data);
};

// User profile update validation
export const validateProfileUpdate = (data: any) => {
  const schema = Joi.object({
    full_name: Joi.string().min(2).max(100).optional(),
    phone: Joi.string().pattern(/^[6-9]\d{9}$/).optional().messages({
      'string.pattern.base': 'Please provide a valid 10-digit Indian mobile number'
    }),
    date_of_birth: Joi.date().max('now').optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional(),
    address: Joi.object({
      street: Joi.string().max(200).optional(),
      city: Joi.string().max(100).optional(),
      state: Joi.string().max(100).optional(),
      postal_code: Joi.string().pattern(/^\d{6}$/).optional().messages({
        'string.pattern.base': 'Please provide a valid 6-digit postal code'
      }),
      country: Joi.string().max(100).optional().default('India'),
      landmark: Joi.string().max(200).optional()
    }).optional(),
    emergency_contact: Joi.object({
      name: Joi.string().min(2).max(100).required(),
      phone: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
      relationship: Joi.string().max(50).required()
    }).optional(),
    preferences: Joi.object().optional()
  });

  return schema.validate(data);
};

// Agent registration validation
export const validateAgentRegistration = (data: any) => {
  const schema = Joi.object({
    license_number: Joi.string().min(5).max(50).optional(),
    business_name: Joi.string().min(2).max(200).optional(),
    business_address: Joi.object({
      street: Joi.string().max(200).optional(),
      city: Joi.string().max(100).optional(),
      state: Joi.string().max(100).optional(),
      postal_code: Joi.string().pattern(/^\d{6}$/).optional(),
      country: Joi.string().max(100).optional().default('India'),
      landmark: Joi.string().max(200).optional()
    }).optional(),
    bank_details: Joi.object({
      account_holder_name: Joi.string().min(2).max(100).required(),
      account_number: Joi.string().min(8).max(20).required(),
      bank_name: Joi.string().min(2).max(100).required(),
      ifsc_code: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).required().messages({
        'string.pattern.base': 'Please provide a valid IFSC code'
      }),
      branch_name: Joi.string().max(100).optional()
    }).optional()
  });

  return schema.validate(data);
};

// Route validation
export const validateRoute = (data: any) => {
  const schema = Joi.object({
    name: Joi.string().min(5).max(200).required(),
    source_city: Joi.string().min(2).max(100).required(),
    destination_city: Joi.string().min(2).max(100).required(),
    distance_km: Joi.number().integer().min(1).max(5000).required(),
    estimated_duration: Joi.string().pattern(/^\d{1,2}:\d{2}:\d{2}$/).required().messages({
      'string.pattern.base': 'Duration must be in HH:MM:SS format'
    }),
    route_map: Joi.object().optional()
  }).custom((value, helpers) => {
    if (value.source_city.toLowerCase() === value.destination_city.toLowerCase()) {
      return helpers.error('custom.sameSourceDestination');
    }
    return value;
  }).messages({
    'custom.sameSourceDestination': 'Source and destination cities cannot be the same'
  });

  return schema.validate(data);
};

// Bus validation
export const validateBus = (data: any) => {
  const schema = Joi.object({
    bus_number: Joi.string().min(3).max(20).required(),
    bus_name: Joi.string().min(2).max(100).optional(),
    bus_type: Joi.string().valid('ac', 'non_ac', 'sleeper', 'semi_sleeper', 'luxury').required(),
    operator_name: Joi.string().min(2).max(200).optional().default('Nandighosh Travels'),
    total_seats: Joi.number().integer().min(10).max(60).required(),
    seat_layout: Joi.object({
      rows: Joi.number().integer().min(3).max(15).required(),
      columns: Joi.number().integer().min(2).max(5).required(),
      layout_type: Joi.string().valid('standard', 'sleeper', 'semi_sleeper').required(),
      seats: Joi.array().items(Joi.object({
        number: Joi.number().integer().positive().required(),
        row: Joi.number().integer().positive().required(),
        column: Joi.number().integer().positive().required(),
        type: Joi.string().valid('window', 'aisle', 'middle').required(),
        is_available: Joi.boolean().required(),
        is_blocked: Joi.boolean().optional().default(false),
        price_modifier: Joi.number().min(0).max(2).optional()
      })).required()
    }).required(),
    amenities: Joi.array().items(Joi.string()).optional(),
    registration_number: Joi.string().min(5).max(20).optional(),
    manufacturing_year: Joi.number().integer().min(1990).max(new Date().getFullYear()).optional(),
    fuel_type: Joi.string().valid('diesel', 'petrol', 'cng', 'electric').optional().default('diesel'),
    mileage: Joi.number().min(1).max(50).optional()
  });

  return schema.validate(data);
};

// Schedule validation
export const validateSchedule = (data: any) => {
  const schema = Joi.object({
    route_id: Joi.string().uuid().required(),
    bus_id: Joi.string().uuid().required(),
    departure_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/).required(),
    arrival_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/).required(),
    departure_date: Joi.date().min('now').required(),
    arrival_date: Joi.date().min(Joi.ref('departure_date')).required(),
    base_price: Joi.number().min(50).max(10000).required(),
    dynamic_pricing: Joi.object({
      surge_multiplier: Joi.number().min(1).max(3).optional(),
      off_peak_discount: Joi.number().min(0).max(0.5).optional(),
      early_bird_discount: Joi.number().min(0).max(0.3).optional(),
      last_minute_surcharge: Joi.number().min(0).max(1).optional()
    }).optional(),
    days_of_operation: Joi.array().items(Joi.number().integer().min(1).max(7)).min(1).optional(),
    special_notes: Joi.string().max(500).optional(),
    cancellation_policy: Joi.object({
      free_cancellation_hours: Joi.number().integer().min(0).max(72).required(),
      cancellation_charges: Joi.array().items(Joi.object({
        hours_before_departure: Joi.number().integer().min(0).required(),
        charge_percentage: Joi.number().min(0).max(100).required()
      })).optional()
    }).optional()
  });

  return schema.validate(data);
};

// Pagination validation
export const validatePagination = (data: any) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).optional().default(1),
    limit: Joi.number().integer().min(1).max(100).optional().default(10),
    sort: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').optional().default('desc')
  });

  return schema.validate(data);
};

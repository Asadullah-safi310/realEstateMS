import * as Yup from 'yup';

export const ownerSchema = Yup.object({
  owner_name: Yup.string().required('Owner name is required'),
  phone: Yup.string().required('Phone is required'),
  cnic: Yup.string(),
  address: Yup.string(),
});

export const personSchema = Yup.object({
  full_name: Yup.string().required('Full name is required'),
  phone: Yup.string().required('Phone is required'),
  email: Yup.string().email('Invalid email'),
  national_id: Yup.string(),
  address: Yup.string(),
});

export const propertySchema = Yup.object({
  person_id: Yup.number().required('Owner is required'),
  property_type: Yup.string().required('Property type is required'),
  purpose: Yup.string().required('Purpose is required'),
  sale_price: Yup.number()
    .typeError('Sale price must be a number')
    .nullable()
    .when('is_available_for_sale', {
      is: true,
      then: (schema) => schema.required('Sale price is required when available for sale').positive('Sale price must be positive'),
      otherwise: (schema) => schema.nullable(),
    }),
  rent_price: Yup.number()
    .typeError('Rent price must be a number')
    .nullable()
    .when('is_available_for_rent', {
      is: true,
      then: (schema) => schema.required('Rent price is required when available for rent').positive('Rent price must be positive'),
      otherwise: (schema) => schema.nullable(),
    }),
  location: Yup.string().required('Location is required'),
  city: Yup.string().required('City is required'),
  area_size: Yup.string().required('Area size is required'),
  bedrooms: Yup.number(),
  bathrooms: Yup.number(),
  description: Yup.string(),
  latitude: Yup.number().typeError('Latitude must be a number').nullable(),
  longitude: Yup.number().typeError('Longitude must be a number').nullable(),
  is_available_for_sale: Yup.boolean(),
  is_available_for_rent: Yup.boolean(),
  is_photo_available: Yup.boolean(),
  is_attachment_available: Yup.boolean(),
  is_video_available: Yup.boolean(),
  videos: Yup.array(),
}).test('at-least-one-availability', 'At least one availability option must be selected', function(value) {
  return value.is_available_for_sale || value.is_available_for_rent;
});

export const clientSchema = Yup.object({
  client_name: Yup.string().required('Client name is required'),
  phone: Yup.string().required('Phone is required'),
  requirement_type: Yup.string().required('Requirement type is required'),
  property_type: Yup.string().required('Property type is required'),
  min_price: Yup.number(),
  max_price: Yup.number(),
  preferred_location: Yup.string(),
});

export const dealSchema = Yup.object({
  deal_type: Yup.string().required('Deal type is required').oneOf(['SALE', 'RENT']),
  property_id: Yup.number().required('Property is required'),
  owner_id: Yup.number().required('Current owner is required'),
  buyer_id: Yup.number().required('Buyer/Tenant is required'),
  tenant_id: Yup.number().nullable(),
  price: Yup.number().positive('Price must be positive').nullable(),
  start_date: Yup.date().nullable().when('deal_type', {
    is: 'RENT',
    then: (schema) => schema.required('Start date is required for rent deals'),
    otherwise: (schema) => schema.nullable(),
  }),
  notes: Yup.string(),
});

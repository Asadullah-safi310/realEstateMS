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
  price: Yup.number().required('Price is required').positive(),
  location: Yup.string().required('Location is required'),
  city: Yup.string().required('City is required'),
  area_size: Yup.string().required('Area size is required'),
  bedrooms: Yup.number(),
  bathrooms: Yup.number(),
  description: Yup.string(),
  latitude: Yup.number().typeError('Latitude must be a number').nullable(),
  longitude: Yup.number().typeError('Longitude must be a number').nullable(),
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
  price: Yup.number().positive('Price must be positive'),
  start_date: Yup.date().nullable(),
  notes: Yup.string(),
});

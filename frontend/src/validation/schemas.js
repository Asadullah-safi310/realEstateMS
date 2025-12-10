import * as Yup from 'yup';

export const ownerSchema = Yup.object({
  owner_name: Yup.string().required('Owner name is required'),
  phone: Yup.string().required('Phone is required'),
  cnic: Yup.string(),
  address: Yup.string(),
});

export const propertySchema = Yup.object({
  owner_id: Yup.number().required('Owner is required'),
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
  property_id: Yup.number().required('Property is required'),
  client_id: Yup.number().required('Client is required'),
  final_price: Yup.number().required('Final price is required').positive(),
  deal_type: Yup.string().required('Deal type is required'),
});

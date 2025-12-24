const User = require('./User');
const Property = require('./Property');
const Deal = require('./Deal');
const PropertyHistory = require('./PropertyHistory');
const Province = require('./Province');
const District = require('./District');
const Area = require('./Area');

// Property Associations
Property.belongsTo(User, { foreignKey: 'owner_id', as: 'Owner', onDelete: 'CASCADE' });
User.hasMany(Property, { foreignKey: 'owner_id' });

Property.hasMany(Deal, { foreignKey: 'property_id', onDelete: 'CASCADE' });
Deal.belongsTo(Property, { foreignKey: 'property_id', as: 'Property' });

Property.hasMany(PropertyHistory, { foreignKey: 'property_id', onDelete: 'CASCADE' });
PropertyHistory.belongsTo(Property, { foreignKey: 'property_id', as: 'Property' });

// Location Associations
Province.hasMany(District, { foreignKey: 'province_id', as: 'Districts', onDelete: 'CASCADE' });
District.belongsTo(Province, { foreignKey: 'province_id', as: 'Province' });

District.hasMany(Area, { foreignKey: 'district_id', as: 'Areas', onDelete: 'CASCADE' });
Area.belongsTo(District, { foreignKey: 'district_id', as: 'District' });

// Property Location Associations
Property.belongsTo(Province, { foreignKey: 'province_id', as: 'ProvinceData' });
Property.belongsTo(District, { foreignKey: 'district_id', as: 'DistrictData' });
Property.belongsTo(Area, { foreignKey: 'area_id', as: 'AreaData' });

// Deal Associations
Deal.belongsTo(User, { foreignKey: 'owner_id', as: 'Owner', onDelete: 'CASCADE' });
Deal.belongsTo(User, { foreignKey: 'buyer_id', as: 'Buyer', onDelete: 'SET NULL' });
Deal.belongsTo(User, { foreignKey: 'tenant_id', as: 'Tenant', onDelete: 'SET NULL' });

// Property History Associations
PropertyHistory.belongsTo(User, { foreignKey: 'previous_owner_id', as: 'PreviousOwner' });
PropertyHistory.belongsTo(User, { foreignKey: 'new_owner_id', as: 'NewOwner' });

module.exports = {
  User,
  Property,
  Deal,
  PropertyHistory,
  Province,
  District,
  Area,
};

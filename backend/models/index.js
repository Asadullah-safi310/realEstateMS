const Owner = require('./Owner');
const Property = require('./Property');
const Client = require('./Client');
const Deal = require('./Deal');
const Person = require('./Person');
const PersonPropertyRole = require('./PersonPropertyRole');

Property.hasMany(Deal, { foreignKey: 'property_id', onDelete: 'CASCADE' });
Deal.belongsTo(Property, { foreignKey: 'property_id', as: 'Property' });

Person.hasMany(PersonPropertyRole, { foreignKey: 'person_id', onDelete: 'CASCADE', as: 'PersonPropertyRoles' });
PersonPropertyRole.belongsTo(Person, { foreignKey: 'person_id', as: 'Person' });

Property.hasMany(PersonPropertyRole, { foreignKey: 'property_id', onDelete: 'CASCADE', as: 'PersonPropertyRoles' });
PersonPropertyRole.belongsTo(Property, { foreignKey: 'property_id', as: 'Property' });

Deal.belongsTo(Person, { foreignKey: 'owner_id', as: 'Owner' });
Deal.belongsTo(Person, { foreignKey: 'buyer_id', as: 'Buyer' });
Deal.belongsTo(Person, { foreignKey: 'tenant_id', as: 'Tenant' });
Deal.belongsTo(Property, { foreignKey: 'property_id', as: 'DealProperty' });

module.exports = {
  Owner,
  Property,
  Client,
  Deal,
  Person,
  PersonPropertyRole,
};

const Owner = require('./Owner');
const Property = require('./Property');
const Client = require('./Client');
const Deal = require('./Deal');

Owner.hasMany(Property, { foreignKey: 'owner_id', onDelete: 'CASCADE' });
Property.belongsTo(Owner, { foreignKey: 'owner_id' });

Property.hasMany(Deal, { foreignKey: 'property_id', onDelete: 'CASCADE' });
Deal.belongsTo(Property, { foreignKey: 'property_id', as: 'Property' });

Client.hasMany(Deal, { foreignKey: 'client_id', onDelete: 'CASCADE' });
Deal.belongsTo(Client, { foreignKey: 'client_id', as: 'Client' });

module.exports = {
  Owner,
  Property,
  Client,
  Deal,
};

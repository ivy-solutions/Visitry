/**
 * Created by sarahcoletti on 7/14/16.
 */
import { Class } from 'meteor/jagi:astronomy';
import { Validator } from 'meteor/jagi:astronomy';

const GeoLocation = Class.create({
  name: 'GeoLocation',
  fields: {
    type: {
      type: String, default: "Point",
      validator: [{
        type: 'equal', resolveParam() {
          return 'Point'
        }
      }]
    },
    coordinates: {
      type: [Number],
      validator: [
        {type: 'length', param: 2},
        {type: 'geoCoordinatesInRange'}
      ]
    }
  }
});

const Address = Class.create({
  name: 'address',
  fields: {
    address: {type: String},  //google place details 'name'
    formattedAddress: {type: String},
    geo: {type: GeoLocation}
  }
});

Validator.create({
  name: 'geoCoordinatesInRange',
  isValid( {value, param}) {
    var longitude = value[0];
    var latitude = value[1];
    return longitude > -180 && longitude < 180 && latitude > -90 && latitude < 90 ;
  },
  resolveError({name, param}) {
    return '${name} has invalid longitude or latitude coordinates';
  }
});

export { Address };


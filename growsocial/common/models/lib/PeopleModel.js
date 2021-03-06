
Schemas = {};
Meteor.isClient && Template.registerHelper("Schemas", Schemas);


Schemas.Person = new SimpleSchema({
  member_key: {type: String, index: 1,  unique: true },
  email: {     type: String, optional: false,  unique: true },
  firstname: { type: String, optional: true},
  lastname: {  type: String, optional: true},
  fullname: {  type: String, optional: true},
  street: {    type: String, optional: true},
  street2: {   type: String, optional: true},
  city: {      type: String, optional: true},
  state: {     type: String, optional: true ,
    allowedValues: ["AL","AK","AZ","AR","CA","CO","CT","DE","FL",
    "GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA",
    "MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND",
    "OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA",
    "WA","WV","WI","WY"],
    autoform: { afFieldInput: { firstOption: "(Select a State)"  } }
    },
  zipcode: {type: String, optional: true },
  occupations: {  type: Array,    optional: true  },    
        'occupations.$': {       type: Object  },
        'occupations.$.vocation': {type: String },
        'occupations.$.descript': {type: String, optional:true },
  location:{   type: String,   optional: true },
  phone:{      type: String,   optional: true },
  website:{    type: String,   optional: true },
  links:{      type: String,   optional: true },
  facebookID:{ type: String,   optional: true },
  twitterID:{  type: String,   optional: true },
  instagramID:{type: String,   optional: true },
  about:{      type: String,   optional: true },
  latlng: {    type: Object,    optional: true  },    
        'latlng.lat': {type: Number, decimal: true },
        'latlng.lng': {type: Number, decimal: true },
  // lat: {type: Number, decimal: true, optional: true },
  // lng: {type: Number, decimal: true, optional: true },
  testDataSearch:{ type: Boolean, optional: true },
});

// for tests ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Schemas.profileEdit = new SimpleSchema({
  email: {     type: String, optional: false,  unique: true },
  fname: { type: String, optional: true},
  lastname: {  type: String, optional: true},
  fullname: {  type: String, optional: true},
  city: {      type: String, optional: true},
  state: {     type: String, optional: true ,
    allowedValues: ["AL","AK","AZ","AR","CA","CO","CT","DE","FL",
    "GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA",
    "MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND",
    "OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA",
    "WA","WV","WI","WY"],
    autoform: { afFieldInput: { firstOption: "(Select a State)"  } }
    },
  zipcode: {type: String, optional: true }
});


var Collections = {};

Meteor.isClient && Template.registerHelper("Collections", Collections);

People = Collections.People = new Mongo.Collection("People");
People.attachSchema(Schemas.Person);
//People.attachSchema(Schemas.profileEdit);

//People = new Mongo.Collection('People');

// TODO test engine minimongo vs MongoDB

// TODO use MongoDB Geospatial "near" function

PeopleIndex = new EasySearch.Index({
  engine: new EasySearch.MongoDB({
    sort: function () {
      return { lastname: 1, firstname: 1 };
    },
    selector: function (searchObject, options, aggregation) {
      // console.log('selector function run');
      let selector = this.defaultConfiguration().selector(searchObject, options, aggregation);
      let cityFilter = options.search.props.cityFilter;
      if (_.isString(cityFilter) && !_.isEmpty(cityFilter)) {
        selector.city = cityFilter;
        // console.log('setting selector.city to cityFilter: ', cityFilter);
      }
      let rangeFilter = options.search.props.rangeFilter;
      if (rangeFilter) {
        selector["latlng.lat"] = {$gte: rangeFilter._southWest.lat, $lte: rangeFilter._northEast.lat};
        selector["latlng.lng"] = {$gte: rangeFilter._southWest.lng, $lte: rangeFilter._northEast.lng};
        // console.log('setting selector.latlng to rangeFilter: ', rangeFilter);
        // console.log('searchObject: ', searchObject);
        // console.log('options: ', options);
        // console.log('aggregation: ', aggregation);
        // console.log('selector: ', selector);
      }
      return selector;
    },
  }),
  collection: People,
  // fields: ['firstname', 'lastname'], // disadvantage: cannot type fullname to match
  fields: ['fullname'],
  name: 'fullnameIndex',
  defaultSearchOptions: {
    limit: 8
  },
});

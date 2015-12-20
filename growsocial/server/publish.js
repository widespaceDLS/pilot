// TODO stop publishing to client on situations like logout
Meteor.publish("contactUsMessages", function () {
  if (this.userId) {
    return ContactUsMessages.find({
      authorId: this.userId
    }, {
      fields: {
        name: 1, 
        email: 1, 
        zip: 1, 
        text: 1,
        createdAt: 1,
        authorId: 1,
        }
    });
  } else {
    return [];
  }
});



Meteor.publish('getLatestReviews', function(id) { check(id, String);
  var MAX_RESULTS = 2;

  var count = Member_Reviews.find( {member_key: id}).count();
  console.log("server Meteor.publish('getLatestReviews'",count, " for ", id);
  if (count > MAX_RESULTS) {
    return 
Member_Reviews.find( {member_key: id}, {sort: {review_date: -1}, skip: count - MAX_RESULTS});
//Messages.find({}, {sort: {submitted: 1}, skip: count - MAX_RESULTS});
  } else {
    return Member_Reviews.find( {member_key: id});
  }
});

//Kadira approach to bringing collection data to a template

Meteor.publish('oneProfileRec', function(id) { check(id, String);
  //Meteor._sleepForMs(1000);// Make a delay manually to show the loading state
  //console.log("server Meteor.publish( People ",  People.find({member_key: id}).count(), "~",id);
  return People.find({member_key: id});
});


Meteor.publish('Member_Reviews-Set', function(id) { check(id, String); 
//Meteor._sleepForMs(1000);
  //console.log("server Meteor.publish('Member_Reviews-Set'",   Member_Reviews.find({member_key: id}).count()," for ",id);
  return Member_Reviews.find({member_key: id});
});
Meteor.publish('MarketItems-Set', function(id) { check(id, String);
  //Meteor._sleepForMs(1000);// Make a delay manually to show the loading state
  //console.log("server Meteor.publish( MarketItems  ",    MarketItems.find({vendor_key: id}).count()," for ", id );
  return MarketItems.find({vendor_key: id});
});

Meteor.publish('Member_Pictures-Set', function(id) { check(id, String);
  //Meteor._sleepForMs(1000);// Make a delay manually to show the loading state
  console.log("server Meteor.publish( pictures ",  Member_Pictures.find({member_key: id}).count()," for ",id);
  return Member_Pictures.find({member_key: id});
});
Meteor.publish('Member_Videos-Set', function(id) { check(id, String);
  //Meteor._sleepForMs(1000);// Make a delay manually to show the loading state
  console.log("server Meteor.publish( videos  ",  Member_Videos.find({member_key: id}).count()," for ", id );
  return Member_Videos.find({member_key: id});
});




Meteor.publish(null, function () {
  return [
    MarketItems.find(),    
    Member_Videos.find(),
    Member_Pictures.find(),
    Member_Reviews.find(),
    People.find()    
  ];
});

Meteor.publish("chatrooms",function(){
    return ChatRooms.find({});
});

Meteor.publish("topics", function(){
        return Topics.find({}, {sort: {createdAt: 1}});
});

Meteor.publish("posts", function(){
      return Posts.find({},{sort: {createdAt: 1}});
});

Meteor.publish("users", function(){
  return Meteor.users.find({},{username:1});
});

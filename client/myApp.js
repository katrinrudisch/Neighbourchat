
Tracker.autorun(function(){
    Meteor.subscribe("topics");
    Meteor.subscribe("posts");
    Meteor.subscribe("users");
    Meteor.subscribe("chatrooms");
});

  Template.registerHelper(
    'isowner', function(created){
    return Meteor.userId() == created;
  });

  Template.registerHelper(
    'owner', function(created){
      return Meteor.users.find({_id: created});
  });

//get distance
  Template.registerHelper(
    'dist', function(lat2, lon2){
        var curr = Geolocation.latLng();
        lat1 = curr.lat;
        lon1 = curr.lng;

        var radlat1 = Math.PI * lat1/180
        var radlat2 = Math.PI * lat2/180
        var theta = lon1-lon2
        var radtheta = Math.PI * theta/180
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        dist = Math.acos(dist)
        dist = dist * 180/Math.PI
        dist = dist * 60 * 1.1515
        dist = dist * 1.609344

        if(dist < 1 && lat2 && lon2){
          return true;
        }else{
          return false;
        }
  });

//Show Posts
Template.posts.helpers({
      'post': function(){
          var currentTopic = this._id;
          return Posts.find({topicId: currentTopic},{sort: {createdAt: 1}});
  }
});

  //Show Topic
  Template.topics.helpers({
      geolocationError: function() {
        var error = Geolocation.error();
        return error && error.message;
      },
      'topic': function(){
          return Topics.find({}, {sort: {createdAt: -1}});
      }
  });

//open new chat
Template.home.events({
    'click .user':function(){
        Session.set('currentId',this._id);
        var res=ChatRooms.findOne({chatIds:{$all:[this._id,Meteor.userId()]}});
        if(res)
        {
            //already room exists
            Session.set("roomid",res._id);
        }
        else{
            //no room exists
            var newRoom= ChatRooms.insert({chatIds:[this._id , Meteor.userId()],messages:[]});
            Session.set('roomid',newRoom);
        }
    }
});

//show messages
Template.messages.helpers({
    'msgs':function(){
        var result=ChatRooms.findOne({_id:Session.get('roomid')});
        if(result){
          return result.messages;
        }
    }
});


//Add a ChatMessage
Template.addMessage.events({
  'submit form': function (event) {
  event.preventDefault();
          var name = Meteor.user().username;
          var message = $('[name="message"]').val();
          var user = Meteor.userId();
          if (message != "") {
              var de=ChatRooms.update({"_id":Session.get("roomid")},{$push:{messages:{
              name: name,
              text: message,
              createdAt: Date.now()
            }}});
              $('[name="message"]').val('');

          }
        }
    });

//show chatrooms
Template.registerHelper(
  'chatroom', function(){
  return ChatRooms.find({chatIds: Meteor.userId(),
    messages: { $exists: true, $ne: [] } }).map(
    function(index){
      index.chatIds = Meteor.users.find({_id: { $in: index.chatIds}},
        {fields: {username: 1}});
      return index;
      });
});

//show number of chats
Template.registerHelper(
  'numberofChats', function(){
      var chatrooms = ChatRooms.find({chatIds: Meteor.userId(),
        messages: { $exists: true, $ne: []}}).count();
      return chatrooms;
});

  //Add Post
  Template.addPost.events({
    'submit form': function(event){
      event.preventDefault();
      var postName = $('[name="postName"]').val();
      var currentUser = Meteor.userId();
      var currentTopic = this._id;
      if(postName != ""){
      Posts.insert({
          name: postName,
          createdAt: new Date(),
          createdBy: currentUser,
          topicId: currentTopic
      });
      $('[name="postName"]').val('');
    }
  }
});

//Add Topic
Template.addTopic.events({
  'submit form': function(event){
      event.preventDefault();
      var topicName = $('[name="topicName"]').val();
      var currentUser = Meteor.userId();
      var currentLocation = Geolocation.latLng() || '';

      if(currentLocation) {
        Session.set('lat', currentLocation.lat);
        Session.set('lng', currentLocation.lng);
      }

      if(topicName != ""){
      Topics.insert({
          name: topicName,
          createdBy: currentUser,
          lat: Session.get('lat'),
          lng: Session.get('lng')
      });
      $('[name="topicName"]').val('');
    }
  }
});

//Delete Topic
Template.topicItem.events({
  'click .delete-topic': function(event){
    event.preventDefault();
    var documentId = this._id;
    var currentUser = Meteor.userId();
    var confirm = window.confirm("Delete this topic?");
    if(confirm){
      Topics.remove({ _id: documentId });
    }
  }
});

//Delete Post
Template.postItem.events({
  'click .delete-post': function(event){
    event.preventDefault();
    var documentId = this._id;
    var currentUser = Meteor.userId();
    var confirm = window.confirm("Delete this post?");
    if(confirm){
      Posts.remove({ _id: documentId });
    }
  }
});


//Register
Template.register.events({
    'submit form': function(event){
        event.preventDefault();
        var username = $('[name=username]').val();
        var email = $('[name=email]').val();
        var password = $('[name=password]').val();
        Accounts.createUser({
            username: username,
            email: email,
            password: password
        }, function(error){
            if(error){
              console.log(error.reason);
              window.alert(error.reason);
            } else {
              Router.go("home");
            }
        });
    }
});

//Login
Template.login.events({
    'submit form': function(event){
        event.preventDefault();
        var email = $('[name=email]').val();
        var password = $('[name=password]').val();
        Meteor.loginWithPassword(email, password, function(error){
          if(error){
            console.log(error.reason);
            window.alert(error.reason);
          } else {
            Router.go("home");
          }
        });
    }
});

//Logout
Template.navigation.events({
    'click .logout': function(event){
        event.preventDefault();
        Meteor.logout();
        Router.go('login');
    }
});

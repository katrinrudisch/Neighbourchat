//Router
Router.route('/register');
Router.route('/chatroom');
/*
Router.route('/chatroom/:userId', {
  name: 'chatPage',
  template: 'chatPage',
  data: function(){
    var username = this.params.userId;
    return Meteor.users.findOne({_id: username});
  }
});
*/
Router.route('/login');
Router.route('/', {
    name: 'home',
    template: 'home'
});
Router.configure({
  layoutTemplate: 'main'
});
Router.route('/topic/:_id', {
    name: 'topicPage',
    template: 'topicPage',
    data: function(){
        var currentTopic = this.params._id;
        var currentUser = Meteor.userId();
        return Topics.findOne({_id: currentTopic});
    },
    onBeforeAction: function(){
      var currentUser = Meteor.userId();
       if(currentUser){
           this.next();
       } else {
           this.render("login");
       }
    }
});

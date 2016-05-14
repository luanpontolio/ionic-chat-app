angular.module('chatapp.services', [])

.factory('LocalStorage', [function() {
  return {
    set: function(key, value) {
      return localStorage.setItem(key, JSON.stringify(value));
    },

    get: function(key) {
      return JSON.parse(localStorage.getItem(key));
    },

    remove: function(key) {
      return localStorage.removeItem(key);
    },
  };
}])

.factory('Loader', ['$ionicLoading', '$timeout',
  function($ionicLoading, $timeout) {
    return {
      show: function(text) {
        //console.log('show', text);
        $ionicLoading.show({
          content: (text || 'Loading...'),
          noBackdrop: true
        });
      },

      hide: function() {
        //console.log('hide');
        $ionicLoading.hide();
      },

      toggle: function(text, timeout) {
        var that = this;
        that.show(text);
        $timeout(function() {
          that.hide();
        }, timeout || 3000);
      }
    };

  }
])

.factory('FBFactory', ['$firebaseAuth', '$firebaseArray', 'FBURL','Utils',
  function($firebaseAuth, $firebaseArray, FBURL, Utils) {
    return {
      auth: function() {
        var FBRef = new Firebase(FBURL);
        return $firebaseAuth(FBRef);
      },
      olUsers: function() {
        var olUsersRef = new Firebase(FBURL +'onlineUsers');
        return $firebaseArray(olUsersRef);
      },
      chatBase: function() {
        var chatRef = new Firebase(FBURL + 'chats');
        return $firebaseArray(chatRef);
      },
      chatRef: function(loggedInUser, OtherUser) {
        var chatRef = new Firebase(FBURL + 'chats/chat_' +
          Utils.getHash(OtherUser, loggedInUser));
        return $firebaseArray(chatRef);
      }
    };
  }
])

.factory('UserFactory', ['LocalStorage', function(LocalStorage) {

  var userKey = 'user',
      presenceKey = 'presence',
      olUserKey   = 'onlineusers';

  return {
    onlineUsers: {},
    setUser: function(user) {
      return LocalStorage.set(userKey, user);
    },

    getUser: function() {
      return LocalStorage.get(userKey);
    },

    cleanUser: function() {
      return LocalStorage.remove(userKey);
    },

    setOLUsers: function(users) {
      LocalStorage.set(olUserKey, users);
      return this.onlineUsers = users;
    },

    getOLUsers: function(){
      if(this.onlineusers && this.onlineUsers.lenght > 0){
        return this.onlineUsers;
      } else {
        return LocalStorage.get(olUserKey);
      }
    },

    cleanOLUser: function(){
      LocalStorage.remove(olUserKey);
      return onlineUsers = null;
    },

    setPresenceId: function(presenceId){
      return LocalStorage.set(presenceKey, presenceId)
    },

    getPresenceId: function(){
      return LocalStorage.get(presenceKey);
    },

    cleanPresenceId: function(){
      return LocalStorage.remove(presenceKey);
    },
  };
}])

.factory('Utils', [function() {
  return {
    escapeEmailAddress: function(email = ''){
      if(!email) return false

      email = email.toLowerCase();
      email = email.replace(/\./g/, '');
      return email.trim();
    },

    unescapeEmailAddress: function(email){
      if(!email) return false

      email = email.toLowerCase();
      email = email.replace(/\./g/, '');
      return email.trim();
    },

    getHash: function(chatToUser, loggedInUser) {
      var hash = '';
      if(chatToUser > loggedInUser) {
        hash = this.escapeEmailAddress(chatToUser) + '_' +
               this.escapeEmailAddress(loggedInUser);
      } else {
        hash = this.escapeEmailAddress(loggedInUser) + '_' +
               this.escapeEmailAddress(chatToUser);
      }

      return hash;
    },

    getBase64ImageFromInput: function(input, callback) {
      window.resolveLocalFileSystemURL(input,
        funtion(fileEntry) {
          fileEntry.file(function(file){
            var reader = new FileReader();
            reader.onloadend = function(evt) {
              callback(null, evt.target.result);
            };

            reader.readAsDataURL(file);
          },
          function() {
            callback('failed', null);
          });
        },
        function(){
          callback('failed', null);
        }
      );
    }
  };
}]);

// .factory('Chats', function() {
//   // Might use a resource here that returns a JSON array

//   // Some fake testing data
//   var chats = [{
//     id: 0,
//     name: 'Ben Sparrow',
//     lastText: 'You on your way?',
//     face: 'img/ben.png'
//   }, {
//     id: 1,
//     name: 'Max Lynx',
//     lastText: 'Hey, it\'s me',
//     face: 'img/max.png'
//   }, {
//     id: 2,
//     name: 'Adam Bradleyson',
//     lastText: 'I should buy a boat',
//     face: 'img/adam.jpg'
//   }, {
//     id: 3,
//     name: 'Perry Governor',
//     lastText: 'Look at my mukluks!',
//     face: 'img/perry.png'
//   }, {
//     id: 4,
//     name: 'Mike Harrington',
//     lastText: 'This is wicked good ice cream.',
//     face: 'img/mike.png'
//   }];

//   return {
//     all: function() {
//       return chats;
//     },
//     remove: function(chat) {
//       chats.splice(chats.indexOf(chat), 1);
//     },
//     get: function(chatId) {
//       for (var i = 0; i < chats.length; i++) {
//         if (chats[i].id === parseInt(chatId)) {
//           return chats[i];
//         }
//       }
//       return null;
//     }
//   };
// });

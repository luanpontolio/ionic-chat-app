angular.module('chatapp.controllers', [])

.run(['FBFactory', '$rootScope', 'UserFactory', 'Utils',
  function(FBFactory, $rootScope, UserFactory, Utils) {
    $rootScope.chatHistory = [];

    var baseChatMonitor = FBFactory.chatBase();
    var unwatch = baseChatMonitor.$watch(function(snapshot) {
      var user = UserFactory.getUser();

      if (!user) return;
      if (snapshot.event == 'child_added' || snapshot.event == 'child_changed') {
        var key = snapshot.key;

        if (key.indexOf(Utils.escapeEmailAddress(user.email)) >= 0) {
          var otherUser = snapshot.key.replace(/_/g, '').
            replace('chat', '').replace(Utils.escapeEmailAddress(user.email), '');
          if ($rootScope.chatHistory.join('_').indexOf(otherUser) === -1) {
            $rootScope.chatHistory.push(otherUser);
          }
          $rootScope.$broadcast('newChatHistory');
          /*
           * TODO: PRACTICE
           * Fire a local notification when a new chat comes in.
          */
        }
      }
    });
  }
])

.controller('MainCtrl', ['$scope', 'Loader', '$ionicPlatform',
  '$cordovaOauth', 'FBFactory', 'GOOGLEKEY', 'GOOGLEAUTHSCOPE',
  'UserFactory', 'currentAuth', '$state',
  function($scope, Loader, $ionicPlatform, $cordovaOauth, FBFactory,
    GOOGLEKEY, GOOGLEAUTHSCOPE, UserFactory, currentAuth,$state) {

    $ionicPlatform.ready(function(){
      Loader.hide();
      $scope.$on('showChatInterface', function($event, authData){
        if(authData.google){
          authData = authData.google;
        }
        UserFactory.setUser(authData);
        Loader.toogle('Redirecting...');
        $scope.onlineusers = FBFactory.olUsers();

        $scope.onlineusers.$loaded().then(function(){
          $scope.onlineusers.$add({
            picture: authData.cacheUserProfile.picture,
            name: authData.displayName,
            email:authData.email,
            login: Date.now()
          })
          .then(function(ref){
            UserFactory.setPresenceId(ref.key());
            UserFactory.setOLUsers($scope.onlineusers);
            $state.go('tab.dash');
          });
        });
        return;
      });

      if (currentAuth) {
        $scope.$broadcast('showChatInterface', currentAuth.google);
      }

      $scope.loginWithGoogle = function(){
        Loader.show('Authenticating..');
        $cordovaOauth.google(GOOGLEKEY, GOOGLEAUTHSCOPE).then(function(result) {
          FBFactory.auth()
          .$authWithOAuthToken('google', result.access_token)
          .then(
            function(authData) {
              $scope.$broadcast('showChatInterface', authData);
            },
            function(error) {
              Loader.toggle(error);
            }
          });
        },
        function(error){
          Loader.toogle(error);
        });
      }
    });
  }
])

.controller('DashCtrl', [ '$scope', 'UserFactory', ''
  function($scope) {

  }
])

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});

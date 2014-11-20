// var App = {
//   Models: {},
//   Views: {},
//   Indexes: {},
//   Chains: {}
// }

// window.sidebar = new App.Views.Sidebar({ model: new App.Models.Sidebar()});

// var backboneFactory = function (modelName, cb) {
//   var modelClassName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
//   var viewName = modelClassName + 'View';

//   App.Models[modelClassName] = Backbone.Model.extend({
//     _id: undefined
//     initialize: function() {
//       if (tweetView === undefined)
//     },
//     addToChain: function () {
//       if (!(this._id)) {
//         App.Indexes[modelClassName][_id] = this;
//       } else {
//         App.Chains[modelClassName].push(this);
//       }
//     },
//     allowedToEdit: function(account) {
//       return true;
//     }
// });


$(function() {
  if (!library)
   var library = {};

  var FADE_TIME = 150,
  TYPING_TIMER_LENGTH = 400,
  COLORS = [
  '#e21400', '#91580f', '#f8a700', '#f78b00',
  '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
  '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];

  getUsernameColor = function (username) {
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
       hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

  library.json =  {
    replacer: function(match, pIndent, pKey, pVal, pEnd) {
       var key = '<span class=json-key>';
       var val = '<span class=json-value>';
       var str = '<span class=json-string>';
       var r = pIndent || '';
       if (pKey)
          r = r + key + pKey.replace(/[": ]/g, '') + '</span>: ';
       if (pVal)
          r = r + (pVal[0] == '"' ? str : val) + pVal + '</span>';
       return r + (pEnd || '');
       },
    prettyPrint: function(obj) {
       var jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/mg;
       return JSON.stringify(obj, null, 3)
          .replace(/&/g, '&amp;').replace(/\\"/g, '&quot;')
          .replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(jsonLine, library.json.replacer);
       }
    }


  var $window = $(window);
  var loggedIn = false;
  var username;
  var connected = false;
  var typing = false;
  var lastTypingTime;


  $usernameInput = $('.usernameInput'); // Input for username
  $messages = $('.messages'); // Messages area
  $inputMessage = $('.inputMessage'); // Input message input box
  $loginPage = $('.login.page'); // The login page
  $chatPage = $('.chat.page'); // The chatroom page

  var $currentInput = $usernameInput.focus();
  var socket = io();


  function setUsername () {
    username = cleanInput($usernameInput.val().trim());
    var loginInfo = { username: username, password: ''};
    socket.emit('login', loginInfo);
    if (username) {
      $loginPage.fadeOut();
      $chatPage.show();
      $loginPage.off('click');
      $currentInput = $inputMessage.focus();
      socket.emit('add user', username);
    }
  }

  function sendMessage () {
    var message = $inputMessage.val();
    message = cleanInput(message);
    if (message && connected) {
      $inputMessage.val('');
      addChatMessage({
        username: username,
        message: message
      });
      socket.emit('new message', message);
    }
  }

  // Log a message
  function log (message, options) {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  }

  // Adds the visual chat message to the message list
  function addChatMessage (data, options) {
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }
    var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username));
    var $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);
    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv);
    addMessageElement($messageDiv, options);
  }

  function addChatMessageTweet(data, tweetHtml, options) {
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }
    var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username));
    var $messageBodyDiv = tweetHtml;
    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li/>').append($messageBodyDiv);
    addMessageElement($messageDiv, options);
  }

  function addTweet(tweet) {
    var $tweetHtml = $('<div class="expand-container"><div class="content"></div></div>');
    var $expander = $('<div class="expander hiding" href="#"></div>');
    $expander.click(function (e) {
      if($(this).hasClass('hiding')) {
        $(this).parent().children().css('display', 'inherit');
        $(this).removeClass('hiding');
      } else {
        $(this).parent().find('.content').css('display', 'none');
        $(this).addClass('hiding');
      }
    });
    $tweetHtml.prepend($expander);
    var $content = $('<pre><code></code></pre>').html(library.json.prettyPrint(tweet));
    var obj = { _id: tweet._id, text: tweet.text };
    var $title = $('<pre><code></code></pre>').html(library.json.prettyPrint(obj));
    $tweetHtml.find('.content').append($content);
    $tweetHtml.find('.expander').append($title);
    addChatMessageTweet({
      username: 'Tweet',
      message: JSON.stringify(tweet)
    }, $tweetHtml);
  }

  function consoleError(data) {
    console.error(data);
  };

  function queryResponse(data) {
    console.info("QUERY");
    console.info(data);
  };

  function logTweet(data) {
    console.log(data);
  };

  function doneQuery() {
    var $messageBodyDiv = $('<span class="messageBody">')
      .text('done!');
    var $messageDiv = $('<li/>').append($messageBodyDiv);
    addMessageElement($messageDiv, {});
  }

  // Adds the visual chat typing message
  function addChatTyping (data) {
    data.typing = true;
    data.message = 'is typing';
    addChatMessage(data);
  }

  // Removes the visual chat typing message
  function removeChatTyping (data) {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  }

  function addMessageElement (el, options) {
    var $el = $(el);
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }

  // Updates the typing event
  function updateTyping () {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit('typing');
      }
      lastTypingTime = (new Date()).getTime();
      setTimeout(function () {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  }

  // Gets the 'X is typing' messages of a user
  function getTypingMessages (data) {
    return $('.typing.message').filter(function (i) {
      return $(this).data('username') === data.username;
    });
  }

  $window.keydown(function (event) {
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    if (event.which === 13) {
      if (username) {
        sendMessage();
        socket.emit('stop typing');
        typing = false;
      } else {
        setUsername();
      }
    }
  });

  $inputMessage.on('input', function() {
    updateTyping();
  });

  $loginPage.click(function () {
    $currentInput.focus();
  });

  $inputMessage.click(function () {
    $inputMessage.focus();
  });

  socket.on('login', function (data) {
    connected = true;
    var message = "Welcome to Socket.IO Chat – ";
    log(message, {
      prepend: true
    });
  });

  socket.on('new message', function (data) {
    addChatMessage(data);
  });

  socket.on('error', function(data) {
    consoleError(data);
  });

  socket.on('query', function(data) {
    queryResponse(data);
  });

  socket.on('done', function() {
    doneQuery();
  });

  socket.on('tweet', function(data) {
    logTweet(data);
     addTweet(data);
  });

  socket.on('user joined', function (data) {
    addParticipantsMessage(data);
  });

  socket.on('user left', function (data) {
    addParticipantsMessage(data);
    removeChatTyping(data);
  });

  socket.on('typing', function (data) {
    addChatTyping(data);
  });

  socket.on('stop typing', function (data) {
    removeChatTyping(data);
  });
});
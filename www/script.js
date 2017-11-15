/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var config = {
  apiKey: "AIzaSyA9zrKRJ77SHl0pJU7nlXtllhJQ9w80UfM",
  authDomain: "jquerymobile-927af.firebaseapp.com",
  databaseURL: "https://jquerymobile-927af.firebaseio.com",
  projectId: "jquerymobile-927af",
  storageBucket: "jquerymobile-927af.appspot.com",
  messagingSenderId: "470344596632"
};

firebase.initializeApp(config);

var firestore = firebase.firestore();

var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();

$(document).on('vclick', '#login', function() {
  $.mobile.changePage('#login-page', {transition: "slide", changeHash: false});
});

$(document).on('vclick', '#signup', function() {
  $.mobile.changePage('#signup-page', {transition: "slide", changeHash: false});
});

$(document).on('vclick', '#login-button', function() {
  var username = $('#input-email').val();
  var password = $('#input-password').val();
  console.log(username, password);
  firebase.auth().signInWithEmailAndPassword(username, password)
    .then((data) => {
      global_name = data.displayName;
      global_email = data.email;
      $.mobile.changePage('#select-page', {transition: "slide", changeHash: false});
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(errorMessage);
      console.log(error);
    });
});

var global_name = '';

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    global_name = user.displayName;
    $.mobile.changePage('#select-page', {transition: "slide", changeHash: false});
  }
})

$(document).on('pagebeforeshow', '#select-page', function(e, data) {
  var _name = global_name.split(/\s+/)[0];
  console.log(_name);
  $('.welcome-message').text('Welcome! ' + _name + '.');
});


var global_email = '';
var global_about = '';

$(document).on('vclick', '#benefactor-button', function() {
  console.log("Hello");
  $.mobile.changePage('#requests-page', {transition: "slide", changeHash: false});
});

$(document).on('vclick', '#request-button', function() {
  var wants = $('#what-input').val();
  var _for = $('#why-input').val();
  var about = $('#about-input').val();
  global_about = about;
  console.log(wants);
  console.log(_for);
  console.log(global_name);
  console.log(global_email);
  firestore.collection('requests').add({
    for: _for,
    requestor: global_email,
    requestor_name: global_name,
    wants: wants
  });
  firestore.doc('users/' + global_email).set({
    about: global_about,
    name:global_name,
    requestor: global_email
  });
});

$(document).on('vclick', '#request', function() {
  var docId = $(this).attr('data-id');
  firestore.doc('users/' + docId).get()
    .then((docRef) => {
      var data = docRef.data();
      global_email = data.requestor;
      global_about = data.about;
      global_name = data.name;
      console.log(global_email);
      console.log(global_about);
      console.log(global_name);

      $('#request-details').empty();
      $('#request-details').append('<h3>' + global_name + '</h3>');
      $('#request-details').append('<p>' + global_about+ '</p>');
      $('#request-details').append('<button type="button"><a href="mailto:'  + global_email + '" class="btn btn-success"><h4>Email</h4></a></button>');
      $.mobile.changePage('#request-detail-page', {transition: "slide", changeHash: false});

    });
});


$(document).on('pagebeforeshow', '#home', function() {
  var user = firebase.auth().currentUser;
  if (user) {
    $.mobile.changePage('#select-page', {transition: "slide", changeHash: false});
  }
})
$(document).on('pagebeforeshow', '#requests-page', function(e, data) {
  $('#request-data').empty();
  firestore.collection('requests').get()
    .then((querySnapshot) => {
      var docs = querySnapshot.docs;
      $.each(docs, function(i, doc) {
        var docId = doc.id;
        var docData = doc.data();
        global_email = docData.requestor;
        $('#request-data').append('<div data-id=' + docData.requestor + ' id="request"><div><img style="padding: 3px;" height="40px" src="https://cdn1.iconfinder.com/data/icons/unique-round-blue/93/user-512.png"</img></div><div>' + docData.requestor_name + " wants "+ docData.wants + " for " + docData.for + '</div></div>');
        $('#request-data').listview('refresh');
      });
         });

});


$(document).on('vclick', '#beneficiary-page', function() {
  $.mobile.changePage('#create-request', {transition: "slide", changeHash: false});
});

$(document).on('vclick', '#signup-button', function() {
  var username = $('#signup-input-email').val();
  var password = $('#signup-input-password').val();
  var name = $('#signup-input-name').val();
  global_name = name;
  global_email = username;
  console.log(username, password);
  console.log(name);
  firebase.auth().createUserWithEmailAndPassword(username, password)
    .then((data) => {
      data.updateProfile({
        displayName: name
      })
        .then((data)=> {
          console.log(name);
          console.log(data);
        })
        .catch((error) => {
          var errorCode = error.code;
          var errorMessage = error.message;
          alert(errorMessage);
          console.log(error);
        });
      $.mobile.changePage('#select-page', {transition: "slide", changeHash: false});
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(errorMessage);
      console.log(error);
    });
});

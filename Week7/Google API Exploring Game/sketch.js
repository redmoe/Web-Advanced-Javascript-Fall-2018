var data = [];
var playerMoveMarker;
var locationClicked;
var text = "Hello! Yes hi!<br><br>Huh, looks like your connected!<br><br>I’m Eou. Just landed and was hoping you could give me some directions.<br><br>Know anywhere good?<br><br>I’m in the mood for some \"FOOD DAD\". Is that how you say it?<br><br>  Just use the mouse to give me directions by clicking on locations and I’ll start moving there.";
var message = "OK, I’ll be honest we really haven't got beyond the whole AIEOU.<br><br>And Y.<br><br>The catchy song got stuck in everyone’s head on the way over and we forgot to study the rest of the alphabet...<br><br>Let’s try to uncover the other twenty so these reviews won’t be so hard to read!";


var numDeltas = 1000;
var delay = 1; //milliseconds
var deltaLat;
var deltaLng;
var moveSpeed = 0.000002;
var currentPosition = [0, 0];
var newPosition = [0, 0];
var map, infoWindow;
var playerMarker;
var tranDone = false;

var moving = null;
var distanceMoved = 0;
var placesService;
var nextPlaceID;
var resources = [];
var idealChoiceCount = 4;
var idealWrongCount = 1;

var zoomLevel = 18;
var markers = [];

var lastDist = Infinity;
var units;
var distanceConsume = 0;


var visitedPlaces = [];

class Inventory {
    constructor(food, clothing,cash,fuel,meds) {
        this.food = food;
        this.clothing = clothing;
        this.cash = cash;
        this.fuel = fuel;
        this.meds = meds;
    }
}
 function loadJSON(callback) {   
    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', 'data.json', true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);  
 }


function initMap() {
    loadJSON(function(response) {
        data = JSON.parse(response);
    //    console.log(data.PlaceList);
    });
    $("#topText").html(text);
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: -34.397,
            lng: 150.644
        },
        zoom: zoomLevel,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.BOTTOM_CENTER
        },
        styles: [{
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{
                color: '#ffa300'
            }]
        }, {
            featureType: 'landscape.natural',
            elementType: 'geometry.fill',
            stylers: [{
                color: '#83769c'
            }]
        }, {
            featureType: 'landscape.natural',
            elementType: 'geometry.stroke',
            stylers: [{
                color: '#ea00d9'
            }]
        }, {
            featureType: "road",
            elementType: "labels",
            stylers: [{
                visibility: "off"
            }]
        }, {
            featureType: "road",
            elementType: "geometry",
            stylers: [{
                visibility: "off"
            }]
        }, {
            featureType: "all",
            elementType: "labels",
            stylers: [{
                visibility: "off"
            }]
        }, {
            featureType: "poi",
            elementType: "labels",
            stylers: [{
                visibility: "on"
            }]
        }, {
            featureType: "poi",
            elementType: "labels.icon",
            stylers: [{
                visibility: "on",
                icon:"PlayerSprite2.png",
                "color": "#99FF33"
            }]
        },              
        {
            featureType: "poi",
            elementType: "labels.text",

            stylers: [{
                visibility: "off"
            }],
        }]
    });
    resources = new Inventory(0,1,5,0,2);
    placesService = new google.maps.places.PlacesService(map);

    infoWindow = new google.maps.InfoWindow;
    var uluru = {
        lat: 40,
        lng: -73
    };
    playerMarker = new google.maps.Marker({
        position: uluru,
        map: map,
        label: "",
        icon:"PlayerSprite2.png",
        title: "Player char"
    });
    markers.push(playerMarker);
    playerMarker.addListener('click', function(event) {
        //infoWindow.open(map, playerMarker);
    });
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            infoWindow.setPosition({ lat:position.coords.latitude+.00005,lng:pos.lng});
            //infoWindow.setContent('Location found. You are at: ' + position.coords.latitude + ", " + position.coords.longitude);
            //infoWindow.open(map);
            map.setCenter(pos);
            playerMarker.setPosition(pos);
            currentPosition = [pos.lat, pos.lng];
            tranDone = true;
        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
    map.addListener('click', function(event) {
        if (event.placeId) {
            console.log('Clicked on place:' + event.placeId);
            nextPlaceID = event.placeId;
            event.stop();

        }
        moving = transition(event);

    });
   // map.setOptions({zoomControl:false,maxZoom:zoomLevel,minZoom:zoomLevel});
    map.setOptions({gestureHandling:"none",zoomControl:false});
}
function FormatText (textr) {
    //console.log(textr);
    textr = textr.replace(/_/g, " ")
    textr = textr.charAt(0).toUpperCase() + textr.slice(1);
    return textr;
}
function Distance(pointA, pointB) {
    var a = pointA[0] - pointB[0];
    var b = pointA[1] - pointB[1];
    var dist = Math.sqrt(a * a + b * b);
    return dist;
}
function transition(event) {
    OptionPicked ();
     $("#bottomText").text("");


    if (playerMoveMarker) {
        playerMoveMarker.setMap(null);
    }
    if (markers.length > 1) markers.pop(markers[markers.length-1]);
    playerMoveMarker = new google.maps.Marker({
        position: event.latLng,
        map: map,
        label: "",
        title: "Moving To"
    });
    markers.push(playerMoveMarker);
    newInf = new google.maps.InfoWindow({
        position: event.latLng,
        content: "HE::"
    });
    playerMoveMarker.infor = newInf;
    var result = [event.latLng.lat(), event.latLng.lng()];
    if (moving) {
        clearTimeout(moving);
        moving = null;
    }
    numDeltas = Distance(result, currentPosition);
    newPosition = result;
    deltaLat = ((result[0] - currentPosition[0]) / numDeltas) * moveSpeed;
    deltaLng = ((result[1] - currentPosition[1]) / numDeltas) * moveSpeed;
    lastDist = Infinity;
    moveMarker();

}

function moveMarker() {
    currentPosition[0] += deltaLat;
    currentPosition[1] += deltaLng;
    var latlng = new google.maps.LatLng(currentPosition[0], currentPosition[1]);
    playerMarker.setTitle("Latitude:" + currentPosition[0] + " | Longitude:" + currentPosition[1]);
    playerMarker.setPosition(latlng);
    infoWindow.setPosition(latlng);
    map.setCenter(latlng);
    dist = Distance(newPosition, currentPosition);
    distanceMoved += dist;
    // $( "#text" ).text("You have traveled " + Math.round(distanceMoved/70) + " miles");
    UpdateStats();
    distanceConsume +=dist;
    ///console.log(distanceConsume);
    if (distanceConsume > 1) {
        ConsumeResources();
        distanceConsume=0;
    } 
    if (dist > lastDist) {
        lastDist = Infinity;
        var latlng = new google.maps.LatLng(newPosition[0], newPosition[1]);
        playerMarker.setPosition(latlng);
        if (nextPlaceID != null) {
            if (visitedPlaces.includes(nextPlaceID)) {
                $("#topText").text("We've been here before! Nothing left to find.");
                DistCompelete(null);
            }
            else {
                visitedPlaces.push(nextPlaceID);
                getPlaceInformation(nextPlaceID);
            }
        } else {
            DistCompelete(null);
        }

    } else {
        lastDist = dist;
        moving = setTimeout(moveMarker, delay);
    }
}



function addMarker(myPos,myTitle,myInfo) {

  var marker = new google.maps.Marker({
         icon:"PlayerSprite2.png",
  });
}

function ConsumeResources () {
    if(resources.food>0){
        resources.food--;
    }
    if(resources.fuel>0){
        resources.fuel--;
    }  
  
}
function DistCompelete(placeData) {
    markers[1].setMap(null);
    if (placeData != null) {
           // var endr = "";
            if (placeData.reviews != null) {
                $("#topText").html("Oh you pulled up some data on this place great?<br>\[*DATA CORRUPTED*\]");
                $("#dataText").html(UntraslateText(placeData.reviews[0].text));
                $("#bottomText").html( "<br>Umm, what is this place anyway?".bold());


               // endr+=("Oh you pulled up some data on this place great?<br>\[*DATA CORRUPTED*\]<br>" + (UntraslateText(placeData.reviews[0].text)).italics() + "<br>Umm, what is this place anyway?".bold());
            }
            else {
                 $("#topText").html= ("Hm, seems like no one felt like leaving a review. Ok well the name was<br>\[*DATA CORRUPTED*\]<br>" + (UntraslateText(placeData.name)).italics() + "<br>Umm, what is this place anyway?".bold());

            }
            if (message!=false) {
               $("#bottomText").html(message);
                 message=false;
            }
      //      $("#bottomText").html(endr);
           // $("#bottomText").text("You also found a echo from the old world:" + garbleText(placeData.reviews[0].text) + "I think this place used to be a...");
          
            var shuffledPlaces = shuffle(placeData.types);
            var wrongA = 1;

            if (shuffledPlaces.Length < idealChoiceCount-idealWrongCount) {
                wrongA = 4-placeData.Length;
            }
            else
                shuffledPlaces.Length = idealChoiceCount;
            while (wrongA > 0) {
              //  console.log(data);
                var randomPlace = data.PlaceList[Math.round(Math.random()*data.PlaceList.length)];
                if (!shuffledPlaces.includes(randomPlace)) {
                    shuffledPlaces.push(randomPlace);
                    wrongA--;
                 //   console.log(randomPlace);
                }
            }
            for (var i = 0; i < idealChoiceCount; i++) {
                var btn = document.createElement("BUTTON");
                btn.setAttribute("id", "option"+i);
                document.getElementById('menu').appendChild(btn);
                $("#option"+i).text(FormatText(shuffledPlaces[i]));
                if (placeData.types.includes(shuffledPlaces[i])) {
                    $("#option"+i).click({place: shuffledPlaces[i],placeData:placeData}, OptionRight);
                }
                else {
                    $("#option"+i).click({}, OptionWrong);                              
                }
            }          
        
        UpdateStats();
    }
    nextPlaceID = null;
}
function UpdateStats() {
    $("#topText").text("Traveled " + Math.floor(distanceMoved) + " units");
    //$("#resourceText").html("🍔"+resources.food + " morsels of food<br>" + resources.clothing + " pairs of clothing<br>$" + resources.cash + "<br>" + resources.fuel + " galons of fuel<br>" + resources.meds + " bandaids<br>" + data.knownLetters.length+"/26 letters known");
  
    $("#resourceText").html("🍔 "+resources.food + 
                            "<br>👕 " + resources.clothing + 
                            "<br>💵 " + resources.cash + 
                            "<br>⛽ " + resources.fuel + 
                            "<br>🏥️ " + resources.meds + 
                            "<br>🔤 " + data.knownLetters.length+"/26 letters known");
//🍔<br>🏥<br>⛽<br>👕<br>💵 

}
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}
function OptionPicked () {
    if (document.getElementById('option0') ==null) return;
    for (var i = 0; i < idealChoiceCount; i++) {
        var elem = document.getElementById('option'+i);
        elem.parentNode.removeChild(elem);
    }
}
function OptionRight (event) {
    var placeData = event.data.placeData;
    var place = event.data.place;
    OptionPicked ();
    var foundStuff = [];
    if (data.FoodPlaces.includes(place)) {
        //if (!isNaN(resources.food)) resources.food =0;
        resources.food +=placeData.rating;
        foundStuff.push(placeData.rating + " cans of food");
    }
    if (data.ClothingPlaces.includes(place)){
        resources.clothing+=placeData.rating;
        foundStuff.push(placeData.rating + " articles of clothing");
    }   
    if (data.CashPlaces.includes(place)) {
        resources.cash+=placeData.rating;
        foundStuff.push(placeData.rating + " cash");
    }    
    if (data.HealthPlaces.includes(place)) {
        resources.health+=placeData.rating;
        foundStuff.push(placeData.rating + " meds");
    }     
    if (data.WordPlaces.includes(place)) {
        var num = Math.floor(Math.random()*data.unknownLetters.length) ;
        var oldLetter = data.unknownLetters[num];
        data.unknownLetters.splice(num,1);
        data.knownLetters.push(oldLetter);
               console.log(oldLetter);

        foundStuff.push("the letter " + oldLetter);
    }   
    if (data.FuelPlaces.includes(place)) {
        resources.fuel+=placeData.rating;
        foundStuff.push(placeData.rating + " fuel");
    }     
    var foundText = "found: ";
    if (foundStuff.length == 0) {
        foundText += "nothing!";
    }
    else {
        for (var i = 0; i < foundStuff.length; i++) {
            foundText += foundStuff[i]
            if (i != foundStuff.length-1) {
                foundText+=",";
            }
        } 
        foundText+=".";
    }     
    $("#bottomText").html(FormatText(place) + ", oh of course! Look what I " + foundText + " Isn't that so cool!");
    
    UpdateStats();
}
function OptionWrong () {
    $("#bottomText").text("Are you sure about that? Hmm not finding anything like that here!");
    OptionPicked ();
}

function UntraslateText (text) {
    var newString = "";
    for (var i = 0; i < text.length; i++) {
        if (data.unknownLetters.includes (text[i].toUpperCase())) {
            newString += RandomLetter();
        }
        else {
            newString += text[i].toLowerCase();
        }
    }
    return newString;
}
function RandomLetter () {
    return data.unknownLetters[Math.round(Math.random()*(data.unknownLetters.length-1))];
}
function garbleText (text) {
    var newString = "";
    for (var i = 0; i < text.length; i++) {
        if (Math.random() < .2 && text[i] != " ") {
            newString += "?";
        }
        else {
            newString += text[i];
        }
    }
    return newString;
}
function getPlaceInformation(placeId) {
    placesService.getDetails({
        placeId: placeId
    }, function(place, status) {
        DistCompelete(place);
    });
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}
var CIVIC_INFO_BASE_URL = 'https://www.googleapis.com/civicinfo/v2/representatives';

function getDataFromApi(addressString, callback) {
  var query = {
    key: 'AIzaSyAt0jGSlpc9KfAJJN2KM15XS8f52bQjyKo',
    address: addressString,
  };
  $.getJSON(CIVIC_INFO_BASE_URL, query, callback).fail(function() {
    $('.invalid-address-page').show();
    $('.contact-page').hide();
    $('.address-page').hide();
  });
}


function makeAddressString() {
  var address = $('#street-input').val() + ' ' +
    $('#city-input').val() + ' ' +
    $('#state-select option:selected').val() + ' ' +
    $('#postal-code-input').val();
  return address;
}


function getOfficeByOffical(data, officialIndex) {
  var officeMatch;
  data.offices.forEach(function(office) {
    office.officialIndices.forEach(function(officeIndex) {
      console.log(officeIndex, officialIndex);
      if (officeIndex == officialIndex) {
        officeMatch = office;
        return false;
      }
    });
  });
  return officeMatch;
}

function displaySearchData(data) {
  var resultElement = '';
  console.log(data);

  if (data.officials) {

    data.officials.forEach(function(official, officialIndex) {
      var office = getOfficeByOffical(data, officialIndex);
      console.log(office);
      console.log(official);
      resultElement += displayResult(official, office);
      $('.contact-page').html(resultElement);
    });
  } else {
    $('.invalid-address-page').show();
    $('.contact-page').hide();
    $('.address-page').hide();
  }
}



var resultTemplate = $(
'<section class="contact-card">' +
  '<div class="headshot-container">' +
    // '<img class="headshot" src="" alt="">' +
  '</div>' +
  '<div class="info">' +
    '<h3>Name: <a class="url fn" target="_blank" href=""></a></h3>' +
    '<h4 class="office">Office: <span></span></h4>' +
    '<h4 class="party">Party: <span></span></h4>' +
    '<details class="contact-info">' +
      '<summary>Contact Information</summary>' +
      '<ul>' +
        '<li>Phone: <span class="tel"></span></li>' +
        '<li>Address:' +
          '<div class="adr">' +
            '<div class="street-address"></div>' +
            '<span class="locality"></span><span class="comma-one">, </span>' +
            '<span class="region"></span><span> </span>' +
            '<span class="postal-code"></span>' +
          '</div>' +
        '</li>' +
        '<li>Email: <a class="email"' +
        'href="mailto:"></a></li>' +
      '</ul>' +
    '</details>' +
  '</div>' +
'</section>'
);



function displayResult(item, office) {
  var newResult = $(resultTemplate).clone();

  //Photo display
  if (item.photoUrl) {
    var photoUrl = item.photoUrl;
    newResult.find('.headshot-container').css('background-image', 'url("https:' + photoUrl.substring(5) + '")');
  } else {
    newResult.find('.headshot-container').css('background-image', 'url(img/noIMG.jpg)');
  }

  newResult.find('.office span').text(office.name);

  //Name display as link if URL available
  if (item.urls) {
    var name = item.name;
    newResult.find('h3 .url').text(name);
    var url = item.urls[0];
    newResult.find('h3 .url').attr('href', url);
  } else {
    newResult.find('h3 .url').remove();
    var name1 = item.name;
    newResult.find('h3').append(name1);
  }

  //Party display
  if (item.party) {
    var party = item.party;
    newResult.find('.party span').text(party);
  } else {
    newResult.find('.party').remove();
  }

  //Phone number display
  if (item.phones) {
    var phone = item.phones[0];
    newResult.find('li .tel').text(phone);
  } else {
    newResult.find('li .tel').remove();
  }

  //Address display with optional line two for street address
  if (item.address) {
    var city = item.address[0].city;
    var zip = item.address[0].zip;
    newResult.find('li .locality').text(city);
    newResult.find('li .postal-code').text(zip);

    if (item.address[0].state) {
      var state = item.address[0].state;
      newResult.find('li .region').text(state);
    } else {
      newResult.find('li .region').remove();
      newResult.find('li .comma-one').remove();
    }

    if (item.address[0].line2) {
      var street1 = item.address[0].line1;
      var street2 = item.address[0].line2;
      newResult.find('li .street-address').html(street1 + '<br>' + street2);
    } else {
      var street = item.address[0].line1;
      newResult.find('li .street-address').text(street);
    }
  } else {
    newResult.find('li:contains(Address)').remove();
  }

  //Email display
  if (item.emails) {
    var email = item.emails[0];
    newResult.find('li .email').text(email);
    newResult.find('li .email').attr('href', "mailto:" + email);
  } else {
    newResult.find('li:contains("Email")').remove();
  }

  return newResult[0].outerHTML;
}













// Geolocation functions

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getPosition);
  } else {
    $('.geo-results-error-page').show();
  }
}

function getPosition(position) {
  var geocoder = new google.maps.Geocoder();
  var lat = position.coords.latitude;
  var long = position.coords.longitude;
  var latlngStr = [];
  latlngStr.push(lat, long);
  var latlng = {lat: parseFloat(latlngStr[0]), lng: parseFloat(latlngStr[1])};
  console.log(lat, long, latlngStr, latlng);

  geocoder.geocode({'location': latlng}, function(results, status) {
    if (status === 'OK') {
      console.log(results);
      var street = results[0].address_components[0].long_name + ' ' + results[0].address_components[1].short_name;
      var city = results[0].address_components[3].long_name;
      var state = results[0].address_components[5].short_name;
      var zipcode = results[0].address_components[7].short_name;


      $('#street-input').val(street);
      $('#city-input').val(city);
      $('#state-select option').filter(function(i, e) { return $(e).val() == state;}).prop('selected', true);
      $('#postal-code-input').val(zipcode);


      $('#address-form').show();
      $('.loader').hide();

    } else {
      $('.address-page').hide();
      $('.geo-results-error-page').show();
      $('#address-form').show();
    }
  });
}


// Event Listeners

$(document).ready(function(e) {
  $('.address-page').hide();
  $('.contact-page').hide();
  $('.geo-results-error-page').hide();
  $('.invalid-address-page').hide();



  $('.landing-page').on('click', '#start-link', function(e) {
    e.preventDefault();
    $('.landing-page').hide();
    $('.loader').hide();
    $('.address-page').show();
  });

  $('.address-page').on('click', '#geolocate-btn', function(e) {
    e.preventDefault();
    $('#address-submit').focus();
    $('#address-form').hide();
    $('.loader').show();
    getLocation();
  });

  $('.geo-results-error-page').on('click', '#geo-error-btn', function(e) {
    e.preventDefault();
    $('.address-page').show();
    $('.loader').hide();
    $('.geo-results-error-page').hide();
  });

  $('.invalid-address-page').on('click', '#invalid-address-btn', function(e) {
    e.preventDefault();
    $('.address-page').show();
    $('.loader').hide();
    $('.invalid-address-page').hide();
  });

  $('.address-page').on('submit', function(e) {
    e.preventDefault();
    getDataFromApi(makeAddressString(), displaySearchData);
    $('.address-page').hide();
    $('.contact-page').show();
  });


});

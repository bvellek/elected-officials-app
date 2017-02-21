var CIVIC_INFO_BASE_URL = 'https://www.googleapis.com/civicinfo/v2/representatives';

function getDataFromApi(addressString, callback) {
  var query = {
    key: 'AIzaSyAt0jGSlpc9KfAJJN2KM15XS8f52bQjyKo',
    address: addressString,
  };
  $.getJSON(CIVIC_INFO_BASE_URL, query, callback).fail(function() {
    $('.invalid-address-page').removeAttr('hidden').show();
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

  if (data.officials) {
    data.officials.forEach(function(official, officialIndex) {
      var office = getOfficeByOffical(data, officialIndex);
      resultElement += displayResult(official, office);
      $('.contact-page').html(resultElement);
    });
  } else {
    $('.invalid-address-page').removeAttr('hidden').show();
    $('.contact-page').hide();
    $('.address-page').hide();
  }
}



var resultTemplate = $(
'<section class="contact-card usa-grid usa-section">' +
  '<div class="headshot-container">' +
  '</div>' +
  '<div class="info">' +
    '<h3>Name: <a class="url fn" target="_blank" href=""></a></h3>' +
    '<h4 class="office">Office: </h4>' +
    '<h4 class="party">Party: <span></span></h4>' +
    '<details class="contact-info">' +
      '<summary>Contact Information</summary>' +
      '<ul>' +
        '<li>Phone: <a href="" class="tel"></a></li>' +
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
    newResult.find('.headshot-container').css('background-image', 'url("https:' + photoUrl.substring(5) + '"), url(img/noIMG.jpg)');
  } else {
    newResult.find('.headshot-container').css('background-image', 'url(img/noIMG.jpg)');
  }

  //Office display
  newResult.find('.office').text('Office: ' + office.name);

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
    newResult.find('li .tel').attr('href', 'tel:' + phone);
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
    navigator.geolocation.getCurrentPosition(getPosition, error, options);
  } else {
    $('.geo-results-error-page').removeAttr('hidden').show();
    $('.address-page').hide();
  }
}

function error(err) {
  console.warn('Error' + err.code + ': ' + err.message);
  $('.address-page').hide();
  $('.geo-results-error-page').removeAttr('hidden').show();
  $('#address-form').show();
};

var options = {
  timeout: 6000
};


function getPosition(position) {
  var geocoder = new google.maps.Geocoder();
  var lat = position.coords.latitude;
  var long = position.coords.longitude;
  var latlngStr = [];
  latlngStr.push(lat, long);
  var latlng = {lat: parseFloat(latlngStr[0]), lng: parseFloat(latlngStr[1])};

  geocoder.geocode({'location': latlng}, function(results, status) {

    var getAddressComponentByType = function (type){
      var match;
      results[0].address_components.forEach(function(address_component){
        address_component.types.forEach(function(key) {
          if (type == key) {
            match = address_component;
            return false;
          }
        });
      });
      return match;
    };


    if (status === 'OK') {
      var street1 = [getAddressComponentByType("street_number")][0].long_name + ' ' + [getAddressComponentByType("route")][0].short_name;
      var city1= [getAddressComponentByType("locality")][0].long_name;
      var state1 = [getAddressComponentByType("administrative_area_level_1")][0].short_name;
      var zip1 = [getAddressComponentByType("postal_code")][0].short_name;


      $('#street-input').val(street1);
      $('#city-input').val(city1);
      $('#state-select option').filter(function(i, e) { return $(e).val() == state1;}).prop('selected', true);
      $('#postal-code-input').val(zip1);


      $('#address-form').show();
      $('.loader').hide();

    } else {
      $('.address-page').hide();
      $('.geo-results-error-page').removeAttr('hidden').show();
      $('#address-form').show();
    }
  });
}


// Event Listeners

$(document).ready(function(e) {

  //forces scrolled to top on refresh
  $(window).on('beforeunload', function() {
    $(window).scrollTop(0);
  });

  $('.landing-page').on('click', '#start-link', function(e) {
    e.preventDefault();
    $('.landing-page').hide();
    $('.loader').hide();
    $('.address-page').removeAttr('hidden');
    $('body').scrollTop(0);
  });

  $('.address-page').on('click', '#geolocate-btn', function(e) {
    e.preventDefault();
    $('#address-submit').focus();
    $('#address-form').hide();
    $('.loader').show();
    getLocation();
    $('#address-form').scrollTop(0);
  });

  $('.geo-results-error-page').on('click', '#geo-error-btn', function(e) {
    e.preventDefault();
    $('.address-page').show();
    $('#address-form').show();
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
    $('.contact-page').removeAttr('hidden');
    $('.contact-page').show();
    $('.contact-page').scrollTop(0);
  });


});

/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


var geocoder;
var map;

function initialize_map(addresses, name, number, opening, close, opening_sat, close_sat, lat, lng, servicePointId) {
    var latlng = new google.maps.LatLng(56, 10);
    var lat_max = '';
    var lat_min = '';
    var lng_max = '';
    var lng_min = '';
		var dragable_cust = true;
	
    map = new google.maps.Map(document.getElementById("map_canvas"), {mapTypeId: google.maps.MapTypeId.ROADMAP, draggable: dragable_cust});
    google.maps.event.trigger(map, 'resize');
    map.setZoom(map.getZoom());

    for (i = 0; i < addresses.length; i++) {
        codeAddress(addresses[i], name[i], number[i], i, opening[i], close[i], opening_sat[i], close_sat[i], lat[i], lng[i], '', servicePointId[i]);
    }

    for (var i = 0; i < lat.length; i++) {
        if (lat[i] > lat_max || lat_max == '') {
            lat_max = lat[i];
        }

        if (lat[i] < lat_min || lat_min == '') {
            lat_min = lat[i];
        }
    }

    for (var i = 0; i < lng.length; i++) {
        if (lng[i] > lng_max || lng_max == '') {
            lng_max = lng[i];
        }

        if (lng[i] < lng_min || lng_min == '') {
            lng_min = lng[i];
        }
    }

    if (lat_max != '' && lat_min != '' && lng_max != '' && lng_min != '') {
        map.setCenter(new google.maps.LatLng(
                ((lat_max + lat_min) / 2.0),
                ((lng_max + lng_min) / 2.0)
                ));

        map.fitBounds(new google.maps.LatLngBounds(
                //bottom left
                new google.maps.LatLng(lat_min, lng_min),
                //top right
                new google.maps.LatLng(lat_max, lng_max)
                ));
    }
}

function codeAddress(address, name, number, i, opening, close, opening_sat, close_sat, lat, lng, city, servicePointId) {

    if (opening != '' && close != '' && opening != null && close != null) {
        opening = 'Abningstider:<br />Mon-Fri: ' + opening.substring(0, 2) + ':' + opening.substring(2) + ' - ';
        close = close.substring(0, 2) + ':' + close.substring(2);
    } else {
        opening = '';
        close = '';
    }

    if (opening_sat != '' && close_sat != '' && opening_sat != null && close_sat != null) {
        opening_sat = 'Sat: ' + opening_sat.substring(0, 2) + ':' + opening_sat.substring(2) + ' - ';
        close_sat = close_sat.substring(0, 2) + ':' + close_sat.substring(2);
    } else {
        opening_sat = '';
        close_sat = '';
    }

    var center_zoom;
    var latlng = new google.maps.LatLng(lat, lng);
    var marker = new google.maps.Marker({
        map: map,
        position: latlng,
        animation: google.maps.Animation.DROP,
        icon: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=" + (i + 1) + "|FF0000|000000",
        serviceId: servicePointId,
        draggable: true
    });

    if (typeof(number) == undefined) {
        number = '';
    }

    if (typeof(name) == undefined) {
        name = '';
    }

    var infowindow = new google.maps.InfoWindow({
        content: '<strong>' + name + '</strong><br /><br />' + address + '<br />' + number + '<br />' + opening + close + '<br />' + opening_sat + close_sat
    });

    markers.push(marker);
    google.maps.event.addListener(marker, "click", toggleBounce);

    function toggleBounce() {
        var x = 0;
        while (x < markers.length) {
            markers[x].setAnimation(null);
            x++;
        }
        this.setAnimation(google.maps.Animation.BOUNCE);
        selectRadioOnMarkerClick(this);
    }

    function selectRadioOnMarkerClick(marker) {
        jQuery('input[name="postnord_pickupLocation"][value="' + marker.serviceId + '"]')[0].checked = true
    }
}

function selectMarker(id) {
    var bouncex = false;
    var x = 0;
    while (x < markers.length) {
        markers[x].setAnimation(null);
        if (markers[x].serviceId == id) {
            bouncex = x;
        }
        x++;
    }
    if (bouncex !== false) {
        markers[bouncex].setAnimation(google.maps.Animation.BOUNCE);
    }
    jQuery('input[name="postnord_pickupLocation"][value="' + id + '"]')[0].checked = true
}
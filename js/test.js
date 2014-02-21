var servPoints,maps;
function initMaps()
{
  pickup.initMap(servPoints);
}

function PickupLocator(){
	var $ = jQuery,
			postCode = $("#pickup_postCode").length > 0?$("#pickup_postCode").val():0,
			googleMapAPILoaded = 0;
			
	var loaderShow = function(){
		jQuery('#sogLoader').show();
	};
	
	var loaderHide = function(){
		jQuery('#sogLoader').hide();
	};
	
	var buttonShow = function(){
		jQuery('#edit-commerce-shipping-service-details-find-location').show();
	};
	
	var buttonHide = function(){
		jQuery('#edit-commerce-shipping-service-details-find-location').hide();
	};
	
	var addPickupList = function(htmlPoints){
		jQuery('#locator_map_radio_html').html(htmlPoints);
	};		
	
	this.initMap = function(servPoints){
		maps = new Maps();
		
		if(servPoints == undefined) {
			servPoints = servicePoints;
		}
		
	  if (servPoints.addresses && servPoints.addresses.length>0) {
	    maps.initializeMap(servPoints.addresses, servPoints.name, servPoints.number, servPoints.opening, servPoints.close, servPoints.opening_sat, servPoints.close_sat, servPoints.lat, servPoints.lng, servPoints.servicePointId);
	  }
	  console.log(maps);
	};
	
	var getServicePointsByAjax = function() {
		if(postCode && postCode.toString().length == 4) {
			jQuery.ajax( {
				type: 'GET',
				url: Drupal.settings.basePath+'ajax/load_service_points',
				dataType: 'json',
				data: 'post_code='+postCode,
				success: (function(response){
					if(typeof response =='object')
					{
						servPoints = response;
						if(!googleMapAPILoaded) {
							jQuery.getScript('https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=initMaps', function() {
								googleMapAPILoaded = 1;
							});
						}
						else {
							this.initMaps(response);
						}
						
						addPickupList(response.radio_html);
						
						loaderHide();
						buttonShow();
					}
				}),
			});
			return response;
		}
	};
		
	$(document).ready(function(){
		var $pickup_button = $('#edit-commerce-shipping-shipping-service-pickup-locator-service');
		var response;
		var selectedMarker;
		
		getServicePointsByAjax();
		
		$("#mapAddress li input").live('change',function(){
			selectedMarker = $(this).children('.service_postcode').val();
			console.log(selectedMarker);
			maps.selectMarker(selectedMarker);
		});
		
		$("#edit-commerce-shipping-service-details-find-location").live('click',function(){
			jQuery.modal(jQuery("#showMap").html(), {
				autoResize:true,
				maxWidth: 754,
				containerCss: {
					backgroundColor:"#FFF",
					top: "10%",
					bottom: "10%",
					left: "10%",
					right: "10%",
				},
				overlayClose:true,
			});
		});
	});
	
	this.callback = function(f) {
		if(typeof f === "function") {
			f();
		}
	};
	
	this.getPostCode = function() {
		return postCode;
	};
}

function Maps() {
	var geocoder;
	var map;
	var markers = Array();
	
	this.initializeMap = function(addresses, name, number, opening, close, opening_sat, close_sat, lat, lng, servicePointId) {
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
	        this.codeAddress(addresses[i], name[i], number[i], i, opening[i], close[i], opening_sat[i], close_sat[i], lat[i], lng[i], '', servicePointId[i]);
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
	};
	
	this.codeAddress = function(address, name, number, i, opening, close, opening_sat, close_sat, lat, lng, city, servicePointId) {
	
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
	    	console.log('bounce');
	        var x = 0;
	        while (x < markers.length) {
	            markers[x].setAnimation(google.maps.Animation.BOUNCE);
	            x++;
	        }
	        this.setAnimation(google.maps.Animation.BOUNCE);
	        selectRadioOnMarkerClick(this);
	    }
	
	    function selectRadioOnMarkerClick(marker) {
	        jQuery('input[name="postnord_pickupLocation"][value="' + marker.serviceId + '"]')[0].checked = true;
	    }
	};
	
	this.selectMarker = function(id) {
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
	    //jQuery('input[name="postnord_pickupLocation"][value="' + id + '"]')[0].checked = true;
	};
}

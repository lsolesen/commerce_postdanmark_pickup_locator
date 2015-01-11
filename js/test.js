var servPoints,maps;
function initMaps()
{
  pickup.initMap(servPoints);
}

getDrupalFormattedMessage = function(message, type){
	if(type==undefined)
		type = 'error';
		
	return '<div class="messages '+ type +'">'+
					'<h2 class="element-invisible">Error message</h2>'
					+ message +
					'</div>';	
};

function PickupLocator(){
	var $ = jQuery,
			postCode = $("#pickup_postCode").length > 0?$("#pickup_postCode").val():0,
			googleMapAPILoaded = 0,
			areServicePointsLoaded = false;
	
	var clearPickupInputFields = function() {
		$("input[name*='commerce_shipping[service_details][pickup_service_point']").val(null);
	};
	//delete pickuplocator-form if exist
	$('#commerce-shipping-service-ajax-wrapper input[type="radio"]').change(function(){
		if($('#commerce-shipping-service-ajax-wrapper input[type="radio"]').is(':checked')) {
			if($('.pickuplocator-form').length > 0) {
				clearPickupInputFields();
				$('.pickuplocator-form').remove();
			}
		} 
	});
			
	var loaderShow = function(){
		jQuery('#modal_sogloader').show();
		jQuery('#sogLoader').show();
	};
	
	var loaderHide = function(){
		jQuery('#modal_sogloader').hide();
		jQuery('#sogLoader').hide();
	};
	
	var buttonShow = function(){
		jQuery('#edit-commerce-shipping-service-details-find-location').show();
	};
	
	var buttonHide = function(){
		jQuery('#edit-commerce-shipping-service-details-find-location').hide();
	};
	
	this.initMap = function(servPoints){
		maps = new Maps();
		
	  if (servPoints.addresses && servPoints.addresses.length>0) {
	    maps.initializeMap(servPoints.addresses, servPoints.name, servPoints.number, servPoints.opening, servPoints.close, servPoints.opening_sat, servPoints.close_sat, servPoints.lat, servPoints.lng, servPoints.servicePointId);
	  }
	};
	
	var printPickupListOnModal = function(htmlPoints){
		jQuery('#pickup_place_list').html(htmlPoints);
		jQuery('#pickup_place_list').append('<div class="clearfix"></div>');
	};		
	
	var printSubmitButtons = function() {
		var cancelButton 	= "<a href='javascript:void(0)' class='pickup_reset_button'>Fortryd</a>";
		var okButton 			= "<a href='javascript:void(0)' class='pickup_submit_button'>Ok</a>";
		
		$("#pickup_place_list").prepend(cancelButton);
		$("#pickup_place_list").prepend(okButton);
		
		$("#pickup_place_list").append(okButton);
		$("#pickup_place_list").append(cancelButton);
	};
	
	var isServicePointChecked = function(){
		return jQuery('input[name="postnord_pickupLocation"]').is(':checked');
	};
	
	var showServicePointNotCheckedError = function(){
		if (jQuery('#error_checked_radio').length == 0) {
			jQuery('.pickup_submit_button').before('<span id="error_checked_radio">'+Drupal.t("Please select one of the options.")+'</span>');
		}
	};
	
	var removeServicePointNotCheckedError = function(){
		if (jQuery('#error_checked_radio').length > 0) {
			jQuery('#error_checked_radio').remove();
		}
	};
	
	var setServicePointHiddenInputs = function() {
		var servicePointID = jQuery('input[name="postnord_pickupLocation"]:checked').val();
		var servicePointHtmlID = '#place_' + servicePointID;
		var $servicePointElement = $(servicePointHtmlID).parent();
		var servicePointName = $servicePointElement.find('.servicepoint-name').html();
		var servicePointStreet = $servicePointElement.find('.servicepoint-street').html();
		var servicePointCity = $servicePointElement.find('.servicepoint-city').html();
		var servicePointPostCode = $servicePointElement.find('.servicepoint-postcode').val();
		
		jQuery('#edit-commerce-shipping-service-details-pickup-location').val(servicePointName);
		
		jQuery('input[name=\'commerce_shipping[service_details][pickup_service_point_id]\']').val(servicePointID);
		jQuery('input[name=\'commerce_shipping[service_details][pickup_service_point_id_name]\']').val(servicePointName);
		jQuery('input[name=\'commerce_shipping[service_details][pickup_service_point_id_address]\']').val(servicePointStreet);
		jQuery('input[name=\'commerce_shipping[service_details][pickup_service_point_id_city]\']').val(servicePointCity);
		jQuery('input[name=\'commerce_shipping[service_details][pickup_service_point_id_postcode]\']').val(servicePointPostCode);
		jQuery('#edit-customer-profile-shipping-commerce-customer-address-und-0-thoroughfare').val(servicePointStreet);
		jQuery('#edit-customer-profile-shipping-commerce-customer-address-und-0-locality').val(servicePointCity);
	};
	
	function attachOkButtonEvent() {
		jQuery('.pickup_submit_button').click(function() {
			if (!isServicePointChecked()) {
				showServicePointNotCheckedError(); 
			} 
			else {
				removeServicePointNotCheckedError();
				setServicePointHiddenInputs();
				jQuery.modal.close();
			}
		});
	}
	
	var attachCancelButtonEvent = function() {
		$(".pickup_reset_button").click(function(){
			$.modal.close();
		});
	};
	
	var printResultsNotFoundOnModal = function() {
		console.log('results not found');
	};
	
	var isPostcodeInputExists = function() {
		var $postcodeInput = $('input[name="commerce_shipping[service_details][pickup_service_point_id_postcode]"]');
		if($postcodeInput.length > 0)
			return true;
		else
			return false;
	};
	
	var getPostcodeInputVal = function() {
		return $('input[name="pickup_locator_postCode"').val();
	};
	
	var isPostcodeValidFormat = function() {
		if(postCode.toString().length != 4)
			return true;
		else
			return false;
	};
	
	var printErrorOnModal = function(message) {
		var errorBody = getDrupalFormattedMessage(message,'error');
		if(message !='')
			$("#simplemodal-data").append(errorBody);
		$('#simplemodal-data .messages').live('click',function() {
			$(this).hide();
		});
	};
		
	var errorCache = '';
	var getServicePointsByAjax = function() {
		if(!postCode) {
			if(isPostcodeInputExists())
			postCode = getPostcodeInputVal();
		}
		
		if(!isPostcodeValidFormat) {
			//showWrongPostcodeInModal();
		}
		
		if(!googleMapAPILoaded) {
			jQuery.ajax( {
				type: 'GET',
				url: Drupal.settings.basePath+'ajax/load_service_points',
				dataType: 'json',
				data: 'post_code='+postCode,
				success: (function(response){
					if(typeof response =='object')
					{
						if(response.error != undefined) {
							googleMapAPILoaded = 1;
							printErrorOnModal(response.error);
							errorCache = response.error;
							loaderHide();
							buttonShow();
							return;
						}
						
						servPoints = response;
						
						jQuery.getScript('https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=initMaps', function() {
							googleMapAPILoaded = 1;
							printPickupListOnModal(response.radio_html);
							printSubmitButtons();
							attachOkButtonEvent();
							attachCancelButtonEvent();
							
							loaderHide();
							buttonShow();
						});
					} 
				}),
				});
			} else {
				//maps are already loded
				
				if(!areServicePointsLoaded) {
					jQuery.ajax( {
					type: 'GET',
					url: Drupal.settings.basePath+'ajax/load_service_points',
					dataType: 'json',
					data: 'post_code='+postCode,
					success: (function(response){
						if(typeof response =='object')
						{
								if(response.error != undefined) {
									googleMapAPILoaded = 1;
									printErrorOnModal(response.error);
									errorCache = response.error;
									loaderHide();
									buttonShow();
									return;
								}
								
								areServicePointsLoaded = true;
								
								servPoints = response;
								
								printErrorOnModal(errorCache);
								initMaps(servPoints);
								printPickupListOnModal(servPoints.radio_html);
								printSubmitButtons();
								attachOkButtonEvent();
								attachCancelButtonEvent();
								
								loaderHide();
								buttonShow();	
						}
					}),
					});
				} else {
					printErrorOnModal(errorCache);
					initMaps(servPoints);
					printPickupListOnModal(servPoints.radio_html);
					printSubmitButtons();
					attachOkButtonEvent();
					attachCancelButtonEvent();
					
					loaderHide();
					buttonShow();	
				}
			}
	};
		
	this.callback = function(f) {
		if(typeof f === "function") {
			f();
		}
	};
	
	this.getPostCode = function() {
		return postCode;
	};
	
	var markPickupAdressOnClickEvent = function() {
		$(".pickup-address").live('click', function(){
			$(".pickup-address").removeClass("isSelected");
			$(this).addClass("isSelected");
		});
	};
	
	var openModalDialog = function() {
		jQuery.modal("<span id='modal_sogloader'></span><span id='postnord-logo'></span><div id='map_canvas' style='width:100%; height: 360px; margin: 0 auto;'></div><div id='pickup_place_list'></div>", {
			opacity: 80,
			overlayClose:true,
			containerCss: {
				position: 'absolute',
				backgroundColor:"#FFF",
				height:450,
				padding:0, 
				width:830
			},
			onShow: function (dlg) {
 	     	$(dlg.container).css('height', 'auto');
 	     	$(dlg.container).css('top', "10%");
        $(dlg.wrap).css('overflow', 'auto'); // or try jQuery.modal.update();
        $(dlg.wrap).css('background', '#FFF'); // or try jQuery.modal.update();
  		},
 
		});
	};
	
	var attachChangePickupEvent = function(){
		var selectedMarker;
		
		$("#mapAddress li input").live('change',function(){
			selectedMarker = $(this).val();
			maps.selectMarkerOnRadioButtonClick(selectedMarker);
			$(this).parent().closest('.pickup-address').toggleClass("isSelected");
		});
	};
	
	var reloadServicePoints = function() {
		loaderShow();
		areServicePointsLoaded = false;
		getServicePointsByAjax();
		markPickupAdressOnClickEvent();
		attachChangePickupEvent();
	};
	
	var createPostCodeInputField = function() {
		$("#simplemodal-data").append("<div class='postcode'><input type='text' id='postcode-input' placeholder='Indtast et andet postnummer:' /></div>");
		$("#postcode-input").live('change',function() {
			var postcode = $(this).val();
			setPostcode(postcode);
			reloadServicePoints();
		});
	};
	
	var openModalAndGetServicePoints = function() {
		openModalDialog();
		getServicePointsByAjax();
		markPickupAdressOnClickEvent();
		attachChangePickupEvent();
		createPostCodeInputField();
	};
	
	var attachPickupLocationButtonClickEvent = function(){
		$("#edit-commerce-shipping-service-details-find-location").live('click',function(){
			openModalAndGetServicePoints();
		});
	};
	
	var setPostcode = function(postcode) {
		postCode = postcode;
	};
	
	
	var init = function(){
		openModalAndGetServicePoints();
		attachPickupLocationButtonClickEvent();
	};
	
	/**
	 * ALL Functions starts HERE!!!!
	 */
	$(document).ready(function(){
		init();
	});
}

function Maps() {
	var geocoder;
	var map;
	var markers = Array();
	var lastInfoWindow;
	
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
	};
	 
  var disableBounceAtAllMarkers = function() {
  	var x = 0;
    while (x < markers.length) {
    	if(markers[x].getAnimation != null)
      	markers[x].setAnimation(null);
      x++;
    }
  };
  
  var getInputForMarker = function(marker) {
 		return jQuery('#place_'+marker.serviceId);
  };
  
  var getClosestAdressBlocktoivenInput = function($input) {
  	return $input.parent().find('.pickup-address');
  };
  
  var getOpeningTimeForTheMarker = function(marker) {
  	$input = getInputForMarker(marker);
  	$addressBlock = getClosestAdressBlocktoivenInput($input);
  	return jQuery($addressBlock).find('.servicepoint-opening-block').html();
  };
	
	var codeAddress = function(address, name, number, i, opening, close, opening_sat, close_sat, lat, lng, city, servicePointId) {
	
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
	        draggable: false
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
	   
	    
	    var toggleBounceAndSelectRadio = function() {
	    		disableBounceAtAllMarkers();
			    this.setAnimation(google.maps.Animation.BOUNCE);
	        selectRadioOnMarkerClick(this);
	       	
	       	var openingTime = getOpeningTimeForTheMarker(this);
	       	
	        var infowindow = new google.maps.InfoWindow({
				      content: "<strong>"+Drupal.t("Opening Time:")+"</strong><br />" + openingTime, 
				      					
				  });
				  
				  if(lastInfoWindow != undefined)
				  	lastInfoWindow.close();
					
	       	if(openingTime == null || openingTime == '') 
	       		return;
	       		
				  infowindow.open(map,this);
				  lastInfoWindow = infowindow;
	    };
	
	    google.maps.event.addListener(marker, "click", toggleBounceAndSelectRadio);
	    
	    
			function markClosestAdressBlockToGivenInput($input) {
				jQuery('.pickup-address').removeClass('isSelected');
				$input.parent().find('.pickup-address').addClass('isSelected');
			}
			
		  function selectRadioOnMarkerClick(marker) {
	      var $addressBlock; 
		  	if(jQuery('input[name="postnord_pickupLocation"][value="' + marker.serviceId + '"]').length > 0)
		      jQuery('input[name="postnord_pickupLocation"][value="' + marker.serviceId + '"]')[0].checked = true;
		      $input = getInputForMarker(marker);
		      markClosestAdressBlockToGivenInput($input);
		  }
	};
	
	this.selectMarkerOnRadioButtonClick = function(id) {
	    var bouncex = false;
	    var x = 0;
	    while (x < markers.length) {
	        markers[x].setAnimation(null);
	        if (markers[x].serviceId == id) {
	            bouncex = x;
	            activeMarker = markers[x];
	        }
	        x++;
	    }
	    if (bouncex !== false) {
	        markers[bouncex].setAnimation(google.maps.Animation.BOUNCE);
	    }
	    
    	var openingTime = getOpeningTimeForTheMarker(activeMarker);
	    
      var infowindow = new google.maps.InfoWindow({
		      content: "<strong>"+Drupal.t("Opening Time:")+"</strong><br />" + openingTime
		  });
		  
		  if(lastInfoWindow != undefined)
		  	lastInfoWindow.close();
		  	
  		if(openingTime == null || openingTime == '') 
     		return;

		  infowindow.open(map,activeMarker);
		  lastInfoWindow = infowindow;
	};
}

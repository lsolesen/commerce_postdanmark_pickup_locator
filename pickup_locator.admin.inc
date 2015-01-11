<?php

/**
* @file
* Administration page callbacks for the pickup_locator module.
*/
/**
* Form builder. Configure Pickup API.
*
* @ingroup forms
* @see system_settings_form().
*/


function pickup_locator_settings_form(){
	$form['pickup_locator_api'] = array(
		'#type' => 'textfield',
		'#title' => t('Pickup Location API KEY'),
		'#size' => 40,
		'#required' => true,
		'#default_value' => variable_get('pickup_locator_api',''),
	);
	
	$form['pickup_locator_license_key'] = array(
		'#type' => 'textfield',
		'#title' => t('Pickup Location LICENSE KEY'),
		'#size' => 40,
		'#required' => true,
		'#default_value' => variable_get('pickup_locator_license_key',''),
	);
	
	$form['pickup_locator_rate'] = array(
		'#type' => 'textfield',
		'#title' => t('Pickup Location Shipping rate'),
		'#size' => 10,
		'#required' => true,
		'#default_value' => variable_get('pickup_locator_rate',''),
	);
	
	$form['#submit'][] = 'pickup_locator_settings_form_submit';
	return system_settings_form($form);
	
}


/**
* Process pickup location settings submission.
*/

function pickup_locator_settings_form_validate($form, &$form_state) {
	$key = $form_state['values']['pickup_locator_license_key'];
	$email = $site_email = variable_get('site_mail', '');
	if(!checkLicenseKey($key, $email)) {
		 form_set_error('pickup_locator_license_key', variable_get('pickup_locator_license_info', ''));
	}
}

function pickup_locator_settings_form_submit($form, $form_state) {
	variable_set('pickup_locator_api',$form_state['values']['pickup_locator_api']);
	variable_set('pickup_locator_license_key',$form_state['values']['pickup_locator_license_key']);
	variable_set('pickup_locator_rate',$form_state['values']['pickup_locator_rate']);
}

function checkLicenseKey($key, $email) {
	 	$license_key = $key;
	  $license_email = $email;
	  if (strlen($license_key) == '20') {
	      $license_system_path = "http://license.vconnect.dk/";
	      $url = $license_system_path . "check_license_key.php?type=check&license_key=" . $license_key . "&email=" . $license_email . "&ip=" . $_SERVER["REMOTE_ADDR"] . "&domain=" . $_SERVER['HTTP_HOST'];
	
	      $curl = curl_init();
	      curl_setopt($curl, CURLOPT_URL, $url);
	      curl_setopt($curl, CURLOPT_HEADER, 0);
	      curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
	      $data = curl_exec($curl);
	      curl_close($curl);
	
	      if ($data == 'success-1') {
	          $license_status = 1;
	          $license_info = 'Your license is valid';
	      } elseif ($data == 'success-2') {
	          $license_status = 1;
	          $license_info = 'Your license is valid';
	      } elseif ($data == 'error-1') {
	          $license_status = 0;
	          $license_info = 'Invalid license key';
	      } elseif ($data == 'error-2') {
	          $license_status = 0;
	          $license_info = 'License key is already used';
	      } elseif ($data == 'error-3') {
	          $license_status = 0;
	          $license_info = 'System error';
	      } else {
	          $license_status = 0;
	          $license_info = 'System error';
	      }
	  } else {
	      $license_status = 0;
	      // License invalid error
	      $license_info = 'Invalid license key';
	  }

		variable_set('pickup_locator_license_info', $license_info);
		variable_set('pickup_locator_license_status',$license_status);
		
		if($license_status == 1) {
			return true;
		} 
}




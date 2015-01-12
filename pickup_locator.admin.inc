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
	$email = $site_email = variable_get('site_mail', '');
}

function pickup_locator_settings_form_submit($form, $form_state) {
	variable_set('pickup_locator_api',$form_state['values']['pickup_locator_api']);
	variable_set('pickup_locator_rate',$form_state['values']['pickup_locator_rate']);
}

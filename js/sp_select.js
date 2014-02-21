/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


jQuery(document).ready(function() {
    if (jQuery('select[name=\'service_point_id\']').val()) {
        service_point_id = jQuery('select[name=\'service_point_id\']').val();
        service_point_id_name = jQuery('select[name=\'service_point_id\'] option[value=\'' + service_point_id + '\']').html();
        jQuery('input[name=\'service_point_id_name\']').val(service_point_id_name);
    }

    jQuery('select[name=\'service_point_id\']').change(function() {
        if (jQuery('select[name=\'service_point_id\']').val()) {
            service_point_id = jQuery('select[name=\'service_point_id\']').val();
            service_point_id_name = jQuery('select[name=\'service_point_id\'] option[value=\'' + service_point_id + '\']').html();
            jQuery('input[name=\'service_point_id_name\']').val(service_point_id_name);
        } else {
            jQuery('input[name=\'service_point_id_name\']').val('');
        }
    });
});
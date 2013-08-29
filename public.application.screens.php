<?php

$_LW->REGISTERED_APPS['screens']=array( // register this application
	'title' => 'Screens', 
	'handlers' => array('onOutput'),
);

class LiveWhaleApplicationScreens {

  public function onOutput($buffer) { // if not present, insert the viewport meta tag to keep devices from lying about their specs
    global $_LW;
    if (preg_match('~class="[^"]*lw_widget_type_screens[^"]*"~iU', $buffer) && !preg_match('~<meta name="viewport"~iU', $buffer)) {
      $buffer = preg_replace('~<head([^>]*)>~', '<head$1><meta name="viewport" content="width=device-width"/>', $buffer);
    }
    return $buffer; // return the updated page
  }

}

?>
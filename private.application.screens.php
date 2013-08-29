<?php

$_LW->REGISTERED_APPS['screens']=array( // register this application
	'title' => 'Screens', 
	'handlers' => array('onWidgetConfig'),
);

class LiveWhaleApplicationScreens {

  public function onWidgetConfig($widget, $config) { // prepare content prior to loading the widget editor
    global $_LW;
    if ($widget !== 'screens') return $config; // skip all configs but ours
    $categories = $_LW->dbo->query('select', 'title', 'livewhale_events_categories')->orderBy('title')->run(); // get all categories
    if ($categories->hasResults()) {
      while($category = $categories->next()) {
        $config['args']['category']['options'][$category['title']]=$category['title']; // add category
        $config['args']['exclude_category']['options'][$category['title']]=$category['title']; // add category for exclusion
      }
    }
    $subscriptions = $_LW->dbo->query('select', 'id, title', 'livewhale_events_subscriptions')->orderBy('title')->run(); // get all subscriptions
    if ($subscriptions->hasResults()) {
      while($subscription = $subscriptions->next()) {
        $config['args']['subscription']['options'][$subscription['title']]=$subscription['id']; // add subscription
        $config['args']['exclude_subscription']['options'][$subscription['title']]=$subscription['id']; // add subscription for exclusion
      }
    }
    return $config; // return the updated config
  }

}

?>
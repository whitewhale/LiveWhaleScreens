<?php

$_LW->REGISTERED_WIDGETS['screens'] = array(
  'title' => 'Screens',
  'handlers' => array(
    'onLoad',
    'onDisplay',
    'onJSON',
    'onFetch',
    ),
  );

class LiveWhaleWidgetScreens {

  protected $baseID = "screens";
  protected $itemsAPI = "/live/json/screens";
  protected $eventAPI = "/live/events";
  protected $imageAPI = "/live/screens/image";
  protected $javascript_only_args = array(
    'min' => 4,
    'max_days' => 12,
    'max' => 20,
    'seconds' => 9,
    'pause' => 20,
    'refresh' => 300,
    'crop' => 'true',
    'date_format' => 'MMM. D',
    'time_format' => 'h:mm a',
    'drop_zeroes' => TRUE,
    'add_periods_to_meridians' => TRUE,
    );
  protected $skip_args = array(
    'thumb_width',
    'thumb_height',
    'sort_order',
    'src_region',
    );

  public function onLoad() {
    global $_LW;
    $this->javascript_only_args['width'] = $_LW->IMAGE_WIDGET_WIDTH;
    $this->javascript_only_args['height'] = $_LW->IMAGE_WIDGET_HEIGHT;
    $css = array();
    if ($d = opendir("{$_LW->INCLUDES_DIR_PATH}/client/modules/screens/styles/")) {
      while (false !== ($f = readdir($d))) {
        if (preg_match('~^(.*)\.css$~i', $f, $matches)) {
          $css[] = "screens%5C{$f}";
        }
      }
      closedir($d);
  	}
    $_LW->REGISTERED_CSS[] = '/live/resource/css/' . implode('/', $css);
    $js = array();
    if ($d = opendir("{$_LW->INCLUDES_DIR_PATH}/client/modules/screens/scripts/")) {
      while (false !== ($f = readdir($d))) {
        if (preg_match('~^(.*)\.js$~i', $f, $matches)) {
          $js[] = "screens%5C{$f}";
        }
      }
      closedir($d);
  	}
    $_LW->REGISTERED_JS[] = '/live/resource/js/' . implode('/', $js);
  }

  private function validateScreenArgs(&$args) { // validates the arguments array
    global $_LW;
    $args = $_LW->widgetArgsArray($args, array( // apply args
      'group_prefix',
      'group',
      'exclude_group',
      'category',
      'exclude_category',
      'subscription',
      'exclude_subscription',
      'tag',
      'exclude_tag',
    ));

    foreach ($this->javascript_only_args as $key => $value) { // reduce any arrays to the first item
      if (array_key_exists($key, $args)) while (is_array($args[$key])) $args[$key] = array_shift($args[$key]);
    }

    if (array_key_exists('min', $args)) { // arg: min
      $args['min'] = (int) $args['min'];
      if ($args['min'] < 0) { // require min to be zero or greater
        $args['min'] = 0;
      }
    } else { // use default
      $args['min'] = $this->javascript_only_args['min'];
    }

    if (array_key_exists('max', $args)) { // arg: max
      $args['max'] = (int) $args['max'];
      if ($args['max'] < $args['min']) { // require max at least equal min
        $args['max'] = $args['min'];
      }
      if ($args['max'] <= 0) { // require max to be greater than zero
        $args['max'] = 1;
      }
    } else { // use default
      $args['max'] = $this->javascript_only_args['max'];
    }

    if (array_key_exists('max_days', $args)) { // arg: max_days
      $args['max_days'] = (int) $args['max_days'];
      if ($args['max_days'] < 1) { // mark max_days as unlimited if zero or unset
        $args['max_days'] = 'null';
      }
    } else { // use default
      $args['max_days'] = $this->javascript_only_args['max_days'];
    }

    foreach (array('seconds', 'pause') as $key) { // process time args
      if (array_key_exists($key, $args)) { // arg: $key
        $args[$key] = (int) $args[$key];
        if ($args[$key] < 1) { // require seconds to be greater than zero
          $args[$key] = 1;
        }
      } else { // use default
        $args[$key] = $this->javascript_only_args[$key];
      }
    }
    if ($args['pause'] - $args['seconds'] < 1) $args['pause'] = $args['seconds'] + 1; // pause is later subtracted from seconds, so let's keep it positive

    if (array_key_exists('refresh', $args)) { // arg: refresh
      $args['refresh'] = (int) $args['refresh'];
      if ($args['refresh'] < 60) { // require seconds to be greater than one minute, be reasonable
        $args[$key] = 60;
      }
    } else { // use default
      $args['refresh'] = $this->javascript_only_args['refresh'];
    }

    if (array_key_exists('crop', $args)) { // arg: crop
      if ($args['crop'] != 'false') { // require false or skip
        unset($args['crop']);
      }
    }

    foreach (array('date_format', 'time_format') as $key) { // process standard args
      if (!array_key_exists($key, $args) || empty($args[$key])) $args[$key] = $this->javascript_only_args[$key];
    }

    foreach (array('drop_zeroes', 'add_periods_to_meridians') as $key) { // process time args
      if (!array_key_exists($key, $args) || $args[$key] !== FALSE) $args[$key] = $this->javascript_only_args[$key];
    }

    if (array_key_exists('group_prefix', $args)) { // arg: group_prefix
      foreach ($args['group_prefix'] as $key => $prefix) {
        $args['group_prefix'][$key] = preg_replace('~[^a-z ]~i', '', trim($prefix)) . ':'; // clean group_prefix
      }
      if (count($args['group_prefix']) > 1 && array_key_exists('group_prefix_mode', $args)) { // arg: group_prefix_mode
        if (is_array($args['group_prefix_mode'])) { // use only the first group_prefix_mode
          $args['group_prefix_mode'] = array_shift($args['group_prefix_mode']);
        }
        if ($args['group_prefix_mode'] !== 'all') { // only append if set as all
          unset($args['group_prefix_mode']);
        }
      }    
    }
  }

  private function asREST($args, $key='', $url='') { // appends an args array onto a URL
    if (empty($args)) return '';
    foreach ($args as $arg => $value) {
      $arg = ((!empty($key)) ? $key : $arg);
      if (array_key_exists($arg, $this->javascript_only_args) || in_array($arg, $this->skip_args)) continue;
      if (is_array($value)) {
        $url .= $this->asREST($value, $arg);
      } else {
        $url .= "/{$arg}/" . urlencode($value);
      }
    }
    return $url;
  }

  private function asJSON ($args) { // output a series of args as javascript JSON string
    global $_LW;
    $json = array();
    foreach ($this->javascript_only_args as $key => $value) if (array_key_exists($key, $args)) $json[$key] = $args[$key];
    $json['el'] = $this->baseID;
    $json['server_time_zone'] = date('e');
    $json['server_offset'] = (int) date('Z') / 60;
    $json['server_in_daylight_savings'] = (bool) date('I');
    $json['livewhale_host'] = $_LW->CONFIG['HTTP_HOST'];
    $json['image_api'] = $this->imageAPI;
    $json['event_api'] = $this->eventAPI;
    $json['items_api'] = $this->asREST($args, '', $this->itemsAPI);
    $json = @json_encode($json);
    return (($json) ? "'{$json}'" : '{}');
  }

  public function onDisplay() { // shows the digital screen content stream
    global $_LW;
    $args =& $_LW->widget['args']; // alias args
    $this->validateScreenArgs($args);
  	$_LW->widgetAdd($_LW->widget['xml']->div("", array('id' => $this->baseID))); // insert base container
  	$_LW->widgetAdd($_LW->widget['xml']->script("var screensWidgetArguments = " . $this->asJSON($args) . ";", array('type' => 'text/javascript'))); // insert widget args
    if ($d = opendir("{$_LW->INCLUDES_DIR_PATH}/client/modules/screens/templates/")) {
      while (false !== ($f = readdir($d))) {
        if (preg_match('~^(.*)\.underscore\.html$~i', $f, $matches)) {
          $_LW->widgetAdd($_LW->widget['xml']->script("/*<![CDATA[*/\n" . file_get_contents("{$_LW->INCLUDES_DIR_PATH}/client/modules/screens/templates/{$f}") . "/*]]>*/", array('id' => "{$matches[1]}_template", 'type' => 'text/template'))); // insert templates
        }
      }
      closedir($d);
  	}
  	return $_LW->widgetOutput(); // create output
  }

  private function asXML($args, $key='') { // returns an args array as XML
    global $_LW;
    if (empty($args)) return '';
    $xml = '';
    foreach ($args as $id => $value) {
      if (!empty($key)) $id = $key;
      if (array_key_exists($id, $this->javascript_only_args) || in_array($id, $this->skip_args) || $value === '') continue;
      if (is_array($value) && !empty($value)) {
        $xml .= $this->asXML($value, $id);
      } else {
        $xml .= '<arg id="' . $_LW->setFormatClean($id) . '">' . $_LW->setFormatClean(urldecode($value)) . '</arg>';
      }
    }
    return $xml;
  }

  public function onJSON() { // returns JSON array of events
    global $_LW;
    $args =& $_LW->widget['args']; // alias args
    $this->validateScreenArgs($args);
    if (array_key_exists('group_prefix', $args)) { // expand group prefixes into group fullnames
      $where = "livewhale_groups.fullname LIKE '" . implode("%' " . ((isset($args['group_prefix_mode'])) ? ' AND ' : ' OR ') . " livewhale_groups.fullname LIKE '", $args['group_prefix']) . "%'";
      $groups = $_LW->dbo->query('select', 'livewhale_groups.fullname', 'livewhale_groups', $where)->run();
      if ($groups->hasResults()) {
        if (!array_key_exists('group', $args)) $args['group'] = array();
        while ($group = $groups->next()) $args['group'][] = $group['fullname'];
        $args['group'] = array_unique($args['group']);
      }
      unset($args['group_prefix'], $args['group_prefix_mode']);
    }
    $output = $_LW->xphp->parseString('<widget type="events_json">' . $this->asXML($args) . '</widget>'); // get the results
    header("Content-Type: application/json"); // set header
    header("Cache-Control: no-cache, must-revalidate"); // set header
    header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // set header
    header("Access-Control-Allow-Origin: *"); // set header
    header("Access-Control-Allow-Methods: GET"); // set header
    return $output; // output JSON
  }

  public function onFetch($request=array()) { // returns images for screens
    global $_LW;
    $_LW->logDebug(var_export($request, TRUE));
  }

}

?>
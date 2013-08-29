<?php

$type=array_shift($LIVE_URL['REQUEST']); // get type

require $LIVE_URL['DIR'].'/livewhale.php'; // load LiveWhale

if (!empty($_COOKIE['lw_gid'])) { // close the session for a LiveWhale user
	$_LW->closeSession();
}

$count=0;
$params=array();

foreach($LIVE_URL['REQUEST'] as $val) { // convert request elements to params
	$val=str_replace('\\', '/', rawurldecode($val));
	if (!$count) {
		$key=$val;
	}
	else {
		$params[$key]=$val;
	}
	$count=$count ? 0 : 1;
}

header("Content-Type: application/json; charset=UTF-8");

if (!empty($params['gid']) && !empty($params['filename']) && !empty($params['extension'])) { // if required parameters set
	$image = $_LW->getImage($params['gid'], $params['filename'], $params['extension'], (!empty($params['width']) ? $params['width'] : false), (!empty($params['height']) ? $params['height'] : false), (!empty($params['crop']) ? $params['crop'] : false), (!empty($params['src_region']) ? $params['src_region'] : false)); // get image url
	if (!empty($image)) {
  	echo json_encode(array('src' => $image));
  	exit;
	}
} else {
  header("HTTP/1.0 400 Bad Request", true, 400);
  $errors = array();
  if (empty($params['gid'])) $errors['gid'] = "The group ID parameter is required, e.g. '/gid/1'.";
  if (empty($params['filename'])) $errors['filename'] = "A filename is required, e.g. '/filename/my-image'.";
  if (empty($params['extension'])) $errors['extension'] = "A file extension is required, e.g. '/extension/jpg'.";
  echo json_encode(array('errors' => $errors));
  exit;
}

header("HTTP/1.0 404 Not Found", true, 404);
echo json_encode(array('errors' => array('file' => "The file could not be found with the given parameters.")));
exit;

?>
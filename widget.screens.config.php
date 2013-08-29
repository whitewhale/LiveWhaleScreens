<?php

$_LW->REGISTERED_CONFIGS['screens']=array(
		'title'=>'Screens',
		'description'=>'The screens widget displays a series of events that slide in a format suitable for on campus display screens.',
		'args'=>array(
			'min'=>array('pre'=>'Show a minimum of','type'=>'int','post'=>'items','category'=>'Basic','defaultval'=>4),
			'max'=>array('pre'=>'Show up to','type'=>'int','post'=>'items','category'=>'Basic','defaultval'=>20),
			'max_days'=>array('pre'=>'Generally, show at most','post'=>'days\' of items','type'=>'int','category'=>'Basic','defaultval'=>12),
			'seconds'=>array('pre'=>'Show items for about ','post'=>'seconds','type'=>'int','category'=>'Basic','defaultval'=>9),
			'pause'=>array('pre'=>'During interaction pause for ','post'=>'seconds','type'=>'int','category'=>'Basic','defaultval'=>20),
			'refresh'=>array('pre'=>'Refresh data every ','post'=>'seconds','type'=>'int','category'=>'Basic','defaultval'=>300),
			'group_prefix'=>array('pre'=>'Show items containing the group prefix','category'=>'Groups','is_multiple'=>true),
			'group_prefix_mode'=>array('pre'=>'Require that items match','type'=>'select','defaultval'=>'any','options'=>array('all'=>'all','any'=>'any'),'post'=>'of the above prefixes','category'=>'Groups'),
			'group'=>array('pre'=>'Show items from the group(s)','type'=>'group','category'=>'Groups','is_multiple'=>true),
			'exclude_group'=>array('pre'=>'but <em>not</em> from the group(s)','type'=>'group','category'=>'Groups','is_multiple'=>true),
			'category'=>array('pre'=>'Show items in these categories','type'=>'checkbox','options'=>array(),'category'=>'Categories'),
			'exclude_category'=>array('pre'=>'but <em>not</em> in these categories','type'=>'checkbox','category'=>'Categories'),
			'category_mode'=>array('pre'=>'Require that items match','type'=>'select','defaultval'=>'all','options'=>array('all'=>'all','any'=>'any'),'post'=>'of the above categories','category'=>'Categories'),
			'tag'=>array('pre'=>'Show items tagged with','type'=>'tag','category'=>'Tags','is_multiple'=>true),
			'exclude_tag'=>array('pre'=>'but <em>not</em> with','type'=>'tag','category'=>'Tags','is_multiple'=>true),
			'tag_mode'=>array('pre'=>'Require that items match','type'=>'select','defaultval'=>'all','options'=>array('all'=>'all','any'=>'any'),'post'=>'of the above tags','category'=>'Tags'),
			'subscription'=>array('pre'=>'Show items from these imported calendars:','type'=>'checkbox','options'=>array(),'category'=>'Imported Calendars'),
			'exclude_subscription'=>array('pre'=>'but <em>not</em> these','type'=>'checkbox','category'=>'Imported Calendars'),
			'subscription_mode'=>array('pre'=>'Require that items match','type'=>'select','defaultval'=>'all','options'=>array('all'=>'all','any'=>'any'),'post'=>'of the above subscriptions','category'=>'Imported Calendars'),
			'only_starred'=>array('pre'=>'Only show starred items?','type'=>'select','defaultval'=>'false','options'=>array('No'=>'false','Yes'=>'true'),'category'=>'Filtering &amp; sorting'),
			'search'=>array('pre'=>'Show items matching the search term:','category'=>'Filtering &amp; sorting'),
			'has_location'=>array('pre'=>'Require location on map?','type'=>'select','defaultval'=>'false','options'=>array('No'=>'false','Yes'=>'true'),'category'=>'Places'),
			'near_location'=>array('pre'=>'Only items near coordinates or place ID','category'=>'Places'),
			'near_distance'=>array('pre'=>'Within','post'=>'miles','defaultval'=>1,'category'=>'Places'),
			'require_image'=>array('pre'=>'Require attached image?','category'=>'Format','type'=>'select','defaultval'=>'false','options'=>array('No'=>'false','Yes'=>'true')),
			'crop'=>array('pre'=>'Crop images?','type'=>'select','category'=>'Format','defaultval'=>'true','options'=>array('Yes'=>'true','No'=>'false')),
			'date_format'=>array('pre'=>'Display event dates in the format','post'=>'<a href="http://momentjs.com/docs/#/displaying/format/" target="_blank">moment.js formatting</a>','category'=>'Format','defaultval'=>'MMM. D'),
			'time_format'=>array('pre'=>'Display event times in the format','post'=>'<a href="http://momentjs.com/docs/#/displaying/format/" target="_blank">moment.js formatting</a>','category'=>'Format','defaultval'=>'h:mm a'),
			'drop_zeroes'=>array('pre'=>'Only show minutes/seconds when not zero?','category'=>'Format','defaultval'=>'Yes','type'=>'select','options'=>array('Yes'=>'true','No'=>'false')),
			'add_periods_to_meridians'=>array('pre'=>'Add periods to meridians?','category'=>'Format','defaultval'=>'Yes','type'=>'select','options'=>array('Yes'=>'true','No'=>'false')),
		)
);

?>
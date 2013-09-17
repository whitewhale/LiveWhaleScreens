LiveWhaleScreens
================

This LiveWhale widget displays events in a stream suitable for display on large campus displays (but is also responsive and touch enabled).

## Code Installation/Updates

To install/update this widget, you may either download and expand the zip file, or use git to download and update the code.

### Zip File

The process for installing and updating the Screen Widget is the same, regardless of whether you are installing or updating the code. Simply replace all previous files when updating the widget code.

1. Click the zip download button to download the zip.

2. Expand the zip file contents on your computer.

3. SFTP into your LiveWhale server, and locate your backend `livewhale/client/modules` folder.

4. Create a new folder called `screens` (if not already present) in your client modules folder and upload the zip file contents there.

### Git

If you use git, you can use it to maintain this code. The installation and update proccesses are slightly different.

1. SFTP into your server and navigate to your backend `livewhale/client/modules` folder.

2. `$ git clone git@github.com:whitewhale/LiveWhaleScreens.git screens`

To update your local copy of the code to the latest edition, you need only fetch the code.

1. SFTP into your server and navigate to your `livewhale/client/modules/screens` folder.

2. `$ git fetch origin master`

## Creating Screens Widgets

Use the widget editor to create screens widgets.

[more]

## Inserting the Widget

To use this widget, simply drop it onto a stripped down LiveWhale page. While you can use a stock template page, this widget takes over the visible area of the browser window and forcing the browser to load all the other assets is just unnecessary. The following is an example of a stripped down page.

```
<?php include $_SERVER['DOCUMENT_ROOT'].'/livewhale/frontend.php'; ?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width"/>
    <title><!-- Your Screens Page Title --></title>
  </head>
  <body>
    <div id="container" class="editable">
      <!-- your widget goes here, e.g. <widget id="#_screens_your_screens_widget"></widget> -->
    </div>
  </body>
</html>
```

## Customizing Widget Appearance

To change the CSS of the widget, you can add additional css files to the `screens/styles` folder and they will automatically be included in the page(s) where the widget appears. Changes to the original css/less files are also possible, but you should expect that this will complicate updates down the line, since the supplied css/less files will be overwritten.

You can also add additional javascript files to add custom varibles to the backbone core as discussed below.

[more: templates]

## Custom Variables/Code

The screens widget can utilize custom code to provide additional values to the templates.

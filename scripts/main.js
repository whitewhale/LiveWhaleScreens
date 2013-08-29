// Generated by CoffeeScript 1.6.2
(function() {
  'use strict';  livewhale.jQuery(document).ready(function() {
    var Event, EventView, Image, ImageView, Items, QRCode, Screens;

    Backbone.$ = livewhale.jQuery;
    Image = Backbone.Model.extend({
      name: 'Image',
      selector: '.image',
      defaults: {
        gid: null,
        id: null,
        filename: null,
        extension: null,
        width: null,
        src: null,
        alt: ''
      },
      url: function() {
        var self, url;

        if (this.get('width') == null) {
          return "";
        }
        url = '';
        self = this;
        _.each(['gid', 'filename', 'extension', 'width'], function(key) {
          if (self.get(key) != null) {
            return url += ("/" + key) + (key === 'filename' ? "/" + (self.get('id')) + "_" : "/") + ("" + (encodeURI(self.get(key))));
          }
        });
        if (this.app.get('crop') != null) {
          url += "/crop/" + (this.app.get('crop'));
        }
        return "" + this.urlRoot + url;
      },
      set: function(attributes, options) {
        var app;

        app = (options != null) && (options.app != null) ? options.app : this.app;
        _.each(attributes, function(value, key, list) {
          switch (key) {
            case 'id':
            case 'gid':
            case 'width':
              if (value != null) {
                return list[key] = parseInt(value);
              }
              break;
            case 'filename':
              if ((value != null) && list['alt'] === '') {
                return list['alt'] = value;
              }
          }
        });
        return Backbone.Model.prototype.set.call(this, attributes, options);
      },
      update: function() {
        return this.fetch({
          url: this.url()
        });
      },
      initialize: function(attributes, options) {
        var self;

        this.app = options.app;
        this.item = options.item;
        self = this;
        this.bind('change:width', self.update, self);
        this.view = new ImageView({
          model: self,
          app: this.app
        });
        this.urlRoot = "//" + (this.app.get('livewhale_host')) + (this.app.get('image_api'));
        return this;
      }
    });
    QRCode = Backbone.Model.extend({
      name: 'QRCode',
      selector: '.qrcode',
      defaults: {
        width: null,
        content: null,
        src: null,
        alt: 'QR Code'
      },
      set: function(attributes, options) {
        var app, content;

        app = (options != null) && (options.app != null) ? options.app : this.app;
        if (attributes['width'] != null) {
          attributes['width'] = parseInt(attributes['width']);
          if (attributes['width'] < 60) {
            attributes['width'] = 60;
          }
          attributes['height'] = attributes['width'];
          content = attributes['content'] != null ? attributes['content'] : this.get('content');
          if ((content != null) && content !== '') {
            attributes['src'] = "//chart.googleapis.com/chart?chs=" + attributes['width'] + "x" + attributes['height'] + "&cht=qr&chld=H&chl=" + (encodeURIComponent(content));
          }
        }
        return Backbone.Model.prototype.set.call(this, attributes, options);
      },
      initialize: function(attributes, options) {
        var self;

        this.app = options.app;
        this.item = options.item;
        self = this;
        this.view = new ImageView({
          model: self,
          app: this.app
        });
        return this;
      }
    });
    ImageView = Backbone.View.extend({
      render: function() {
        var width;

        if (this.model.item.view == null) {
          return this;
        }
        this.el = "" + this.model.item.view.el + " " + this.model.selector;
        this.$el = livewhale.jQuery(this.el);
        if (this.$el.length == null) {
          return this;
        }
        width = this.$el.width();
        if ((this.model.get('width') == null) || this.model.get('width') !== width) {
          this.model.set({
            width: width
          });
        } else if (this.model.get('src') != null) {
          this.$el.html(this.template(this.model.attributes));
        }
        return this;
      },
      initialize: function(options) {
        var self;

        this.app = options.app;
        self = this;
        this.template = _.template(this.app.templates['image_template']);
        this.model.bind('change', self.render, self);
        return this;
      }
    });
    Event = Backbone.Model.extend({
      name: 'Event',
      updateWait: null,
      removeWait: null,
      defaults: {
        all_day: false,
        began_on: null,
        date: null,
        date2: null,
        date2_dt: null,
        date2_time: null,
        date_created: null,
        date_dt: null,
        date_time: null,
        date_ts: null,
        day: null,
        description: '',
        eid: null,
        gid: null,
        group: '',
        has_registration: false,
        id: null,
        image: null,
        is_starred: false,
        last_modified: null,
        last_user: null,
        location: '',
        location_latitude: null,
        location_longitude: null,
        location_title: '',
        parent: null,
        proximity: null,
        repeats: null,
        repeats_until: null,
        repeat: '',
        source: '',
        summary: '',
        through: '',
        thumb: '',
        thumbnail: '',
        time: null,
        title: '',
        type: null,
        link: '',
        link_shortened: ''
      },
      setTimeFormat: function(time, prefix) {
        var timeString;

        if (prefix == null) {
          prefix = false;
        }
        if ((time == null) || !moment.isMoment(time)) {
          return '';
        }
        timeString = time.format(this.app.get('time_format'));
        if (this.app.get('drop_zeroes') === true) {
          timeString = timeString.replace(/\:00/ig, '');
        }
        if (this.app.get('add_periods_to_meridians') === true) {
          timeString = timeString.replace(/(a|p)(m)$/i, "$1.$2.");
        }
        if (prefix === false) {
          return timeString;
        }
        if (moment().isBefore(time)) {
          return "Until " + timeString;
        } else {
          return "Began at " + timeString;
        }
      },
      setDateFormat: function(date, calendar) {
        if (calendar == null) {
          calendar = false;
        }
        if ((date == null) || !moment.isMoment(date)) {
          return '';
        }
        if (calendar === true) {
          return date.calendar().replace(/May\./i, 'May');
        } else {
          return date.format(this.app.get('date_format')).replace(/May\./i, 'May');
        }
      },
      setAllDay: function() {
        var attributes;

        attributes = {};
        if (this.get('date_dt') != null) {
          if (this.get('date_dt').format('HH:mm:ss') === '00:00:00' && ((this.get('date2_dt') == null) || this.get('date2_dt').format('HH:mm:ss') === '00:00:00')) {
            return this.set({
              all_day: true,
              time: "All Day",
              date2_dt: moment(this.get('date2_dt') != null ? this.get('date2_dt') : this.get('date_dt')).add('days', 1).subtract('seconds', 1)
            });
          } else {
            return this.set({
              all_day: false
            });
          }
        }
      },
      setDayAndTime: function() {
        var attributes;

        if (this.get('date_dt') != null) {
          if (moment().isBefore(this.get('date_dt'))) {
            attributes = {
              day: this.setDateFormat(this.get('date_dt'), true)
            };
            if ((this.get('all_day') == null) || this.get('all_day') === false) {
              attributes['time'] = this.setTimeFormat(this.get('date_dt'));
            }
          } else {
            attributes = {
              day: "Today"
            };
            if ((this.get('all_day') == null) || this.get('all_day') === false) {
              if (this.get('date2_dt').isSame(moment(), 'day')) {
                attributes['time'] = this.setTimeFormat((this.get('date2_dt') != null ? this.get('date2_dt') : this.get('date_dt')), true);
              } else {
                attributes['time'] = 'All Day';
              }
            }
          }
          return this.set(attributes);
        }
      },
      setBeganOn: function() {
        if ((this.get('date_dt') != null) && moment().isAfter(this.get('date_dt'), 'day')) {
          if (this.get('all_day') === true) {
            return this.set({
              began_on: this.setDateFormat(this.get('date_dt'), true)
            });
          } else {
            return this.set({
              began_on: this.setDateFormat(this.get('date_dt'), true) + ", " + this.setTimeFormat(this.get('date_dt'))
            });
          }
        }
      },
      setThrough: function() {
        if ((this.get('date2_dt') != null) && !this.get('date2_dt').isSame(moment(), 'day') && !this.get('date2_dt').isSame(this.get('date_dt'), 'day')) {
          if (this.get('all_day') === true) {
            return this.set({
              through: this.setDateFormat(this.get('date2_dt'), true)
            });
          } else {
            return this.set({
              through: this.setDateFormat(this.get('date2_dt'), true) + ", " + this.setTimeFormat(this.get('date2_dt'))
            });
          }
        }
      },
      setProximity: function() {
        var proximity;

        if (this.get('day') != null) {
          proximity = this.get('day').match(/^(Today|Tomorrow)/i);
          if (proximity != null) {
            return this.set({
              proximity: proximity[1].toLowerCase()
            });
          }
        }
      },
      setRepeats: function() {
        var nextDay;

        if ((this.get('repeats_until') != null) && moment.isMoment(this.get('repeats_until')) && (this.get('repeats') != null)) {
          switch (this.get('repeats')) {
            case 1:
              if (moment().isBefore(this.get('repeats_until'), 'day')) {
                return this.set({
                  through: this.setDateFormat(this.get('repeats_until'), true)
                });
              }
              break;
            case 2:
            case 4:
              if (this.get('date_dt') != null) {
                if (this.get('repeats') === 2) {
                  nextDay = moment(this.get('date_dt')).add('weeks', 1);
                } else {
                  nextDay = (this.get('date_dt').day() > 4 ? moment(this.get('date_dt')).startOf('week').add('days', 8) : moment(this.get('date_dt')).add('weeks', 1));
                }
              }
              if ((nextDay != null) && !nextDay.isAfter(this.get('repeats_until'), 'day')) {
                return this.set({
                  repeat: this.setDateFormat(nextDay, true)
                });
              }
          }
        }
      },
      setURLItems: function() {
        var attributes, keys, parent;

        if (this.get('link') != null) {
          attributes = {
            link_shortened: this.get('link').replace(/^http(s?):\/\/(.*)\/(\d+)-.*$/, "http$1://$2/$3")
          };
          keys = this.get('link').match(/live\/([^\/]+)\/(\d+)[^\d]+/);
          if (keys != null) {
            attributes['type'] = InflectionJS.singularize(keys[1]);
          }
          if ((this.get('parent') == null) && (keys != null) && keys[1] === 'events') {
            parent = parseInt(keys[2]);
            if (!isNaN(parent) && this.get('id') !== parent) {
              attributes['parent'] = parent;
            }
          }
          return this.set(attributes);
        }
      },
      setQRCode: function() {
        var self;

        self = this;
        if ((this.get('link_shortened') != null) && this.app.width > 481) {
          return this.qrcode = new QRCode({
            content: this.get('link_shortened')
          }, {
            item: self,
            app: self.app
          });
        }
      },
      setImage: function() {
        var image, self;

        self = this;
        if (this.get('thumb') != null) {
          image = this.get('thumb').match(/images\/(\d+)\/(\d+)_(.*?)_[^_]+\.([^\.]+)$/);
          if (image != null) {
            return this.image = new Image({
              gid: image[1],
              id: image[2],
              filename: image[3],
              extension: image[4]
            }, {
              item: self,
              app: self.app
            });
          }
        }
      },
      set: function(attributes, options) {
        var app, self;

        if (attributes == null) {
          return;
        }
        app = (options != null) && (options.collection != null) && (options.collection.app != null) ? options.collection.app : this.app;
        self = this;
        _.each(attributes, function(value, key, list) {
          switch (key) {
            case 'id':
            case 'gid':
            case 'parent':
            case 'repeats':
              if (value != null) {
                return list[key] = parseInt(value);
              }
              break;
            case 'date_dt':
            case 'date2_dt':
              if (value != null) {
                return list[key] = moment(value, 'YYYY-MM-DD HH:mm:ss');
              }
              break;
            case 'repeats_until':
              if (value != null) {
                return list['repeats_until'] = moment(value, 'MM/DD/YY');
              }
              break;
            case 'url':
              if (value != null) {
                list['link'] = value;
                return self.trigger('change:link');
              }
          }
        });
        return Backbone.Model.prototype.set.call(this, attributes, options);
      },
      setUpdateTimeout: function() {
        var maxMilliseconds, self, updateMilliseconds;

        self = this;
        clearTimeout(this.updateWait);
        maxMilliseconds = moment().add('days', 1).hours(0).minutes(0).seconds(1).diff();
        if ((this.get('date_dt') != null) && moment().isBefore(this.get('date_dt'))) {
          updateMilliseconds = this.get('date_dt').diff();
        } else if ((this.get('date2_dt') != null) && moment().isBefore(this.get('date2_dt'))) {
          updateMilliseconds = this.get('date2_dt').diff();
        } else if ((this.get('date_dt') != null) || (this.get('date2_dt') != null)) {
          updateMilliseconds = 0;
        }
        if (updateMilliseconds == null) {
          return null;
        }
        if (updateMilliseconds < 0) {
          updateMilliseconds = 0;
        }
        if (updateMilliseconds > maxMilliseconds) {
          updateMilliseconds = maxMilliseconds;
        }
        return this.updateWait = setTimeout(function(){if(typeof self !== 'undefined'){self.update();}}, updateMilliseconds);
      },
      update: function() {
        var self;

        self = this;
        if (((this.get('date_dt') != null) && moment().isBefore(this.get('date_dt'))) || ((this.get('date2_dt') != null) && moment().isBefore(this.get('date2_dt')))) {
          this.setUpdateTimeout();
          return this.setDayAndTime();
        } else {
          if (this.view.visible()) {
            clearTimeout(this.removeWait);
            this.removeWait = setTimeout(function(){if(typeof self !== 'undefined'){self.collection.remove(self);}}, this.app.renderDelay * 1000);
            return null;
          } else {
            return self.collection.remove(self);
          }
        }
      },
      initialize: function() {
        var id, self;

        this.app = this.collection.app;
        self = this;
        this.bind('change:date_dt', self.collection.start, self.collection);
        this.bind('change:date_dt', self.collection.sort, self.collection);
        this.bind('change:date2_dt', self.collection.sort, self.collection);
        this.on('change:date_dt', self.setUpdateTimeout);
        this.on('change:date2_dt', self.setUpdateTimeout);
        this.on('change:date_dt', self.setAllDay);
        this.on('change:date_dt', self.setDayAndTime);
        this.on('change:date2_dt', self.setDayAndTime);
        this.on('change:all_day', self.setDayAndTime);
        this.on('change:date_dt', self.setBeganOn);
        this.on('change:day', self.setProximity);
        this.on('change:date2_dt', self.setThrough);
        this.on('change:repeats_until', self.setRepeats);
        this.on('change:repeats', self.setRepeats);
        this.on('change:link', self.setURLItems);
        this.on('change:link', self.setQRCode);
        this.on('change:thumb', self.setImage);
        this.app.attachEvents(self);
        this.view = new EventView({
          model: self,
          app: this.app
        });
        this.urlRoot = "//" + (this.app.get('livewhale_host')) + (this.app.get('event_api'));
        id = (this.get('parent') != null ? this.get('parent') : this.id);
        this.fetch({
          url: (id != null ? "" + this.urlRoot + "/" + id + "@JSON?ts=" + (new Date().valueOf()) : '')
        });
        return this;
      }
    });
    EventView = Backbone.View.extend({
      state: 'hide to-right',
      transitioning: false,
      transitionWait: null,
      renderWait: null,
      visible: function() {
        return this.state.substring(0, 4) !== 'hide' || this.transitioning === true;
      },
      show: function(direction) {
        var self;

        if (direction == null) {
          direction = null;
        }
        if (direction == null) {
          direction = 'to-left';
        }
        direction = direction === 'to-right' ? 'to-left' : 'to-right';
        this.transition("move " + direction);
        self = this;
        return setTimeout(function(){if(typeof self !== 'undefined'){self.transition('show');}}, 50);
      },
      hide: function(direction) {
        if (direction == null) {
          direction = null;
        }
        if (direction == null) {
          direction = 'to-left';
        }
        return this.transition("hide " + direction);
      },
      transition: function(newState) {
        var currentState;

        if (this.state === newState) {
          return null;
        }
        this.transitioning = true;
        this.$el = this.app.$el.find(this.el);
        currentState = this.state;
        this.state = newState;
        this.$el.removeClass(currentState).addClass(newState);
        return this.$el.offsetHeight;
      },
      validateState: function() {
        var state;

        this.$el = this.app.$el.find(this.el);
        state = this.$el.attr('class');
        if (state != null) {
          return this.state = state.replace(/(^item\s|\sitem)/i, '');
        }
      },
      render: function() {
        var data, self;

        self = this;
        this.validateState();
        if (this.visible()) {
          clearTimeout(this.renderWait);
          this.renderWait = setTimeout(function(){if(typeof self !== 'undefined'){self.render();}}, this.app.renderDelay * 1000);
          return null;
        }
        data = _.extend(_.clone(this.model.attributes), {
          state: this.state
        });
        if (this.$el.length === 0) {
          this.app.$el.append(this.template(data));
        } else {
          this.$el.replaceWith(this.template(data));
        }
        this.$el = this.app.$el.find(this.el);
        this.$el.bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(e) {
          clearTimeout(self.transitionWait);
          if (self.transitioning === true) {
            return self.transitionWait = setTimeout(function(){if(typeof self !== 'undefined'){self.transitioning = false;}}, 250);
          }
        });
        if (this.model.image != null) {
          this.model.image.view.render();
        }
        if (this.model.qrcode != null) {
          this.model.qrcode.view.render();
        }
        return this;
      },
      initialize: function(options) {
        var self;

        this.app = options.app;
        self = this;
        this.el = "#event_" + this.model.id;
        this.validateState();
        this.template = _.template(this.app.templates['event_template']);
        this.model.bind('change', self.render, self);
        this.render();
        return this;
      }
    });
    Items = Backbone.Collection.extend({
      name: 'items',
      model: Event,
      current: 0,
      started: false,
      refreshInterval: null,
      iterateInterval: null,
      iterateWait: null,
      reserve: [],
      removed: [],
      count: 0,
      comparator: function(item) {
        if ((item.get('date_dt') != null) && moment().isBefore(item.get('date_dt'))) {
          return item.get('date_dt').valueOf();
        } else if ((item.get('date2_dt') != null) && moment().isBefore(item.get('date2_dt'))) {
          return item.get('date2_dt').valueOf();
        } else {
          return moment().valueOf();
        }
      },
      isRemoved: function(id) {
        id = parseInt(id);
        if (isNaN(id)) {
          return false;
        }
        return _.find(this.removed, function(removedItem) {
          return removedItem.id === id;
        });
      },
      parse: function(items, options) {
        var item, maxDays, self;

        self = this;
        maxDays = moment().add('days', this.app.get('max_days'));
        items = _.filter(items, function(item) {
          return !self.isRemoved(item.id);
        });
        item = items.pop();
        while (items.length > this.app.get('max') || (items.length > this.app.get('min') && moment("" + item.date_ts, 'X').isAfter(maxDays))) {
          if (!_.find(this.reserve, function(reserved) {
            return reserved.id === item.id;
          })) {
            this.reserve.unshift(item);
          }
          item = items.pop();
        }
        this.reserve = _.sortBy(this.reserve, function(item) {
          return item.date_ts;
        });
        items.push(item);
        return items;
      },
      start: function(model) {
        var self;

        self = this;
        if (this.started === true || model !== this.models[0]) {
          return null;
        }
        this.started = true;
        return setTimeout(function(){if(typeof self !== 'undefined'){self.models[self.current].view.show();self.iterate();}}, 1500);
      },
      isPaused: function() {
        return this.iterateInterval == null;
      },
      pause: function(temporary, wait) {
        var self;

        if (temporary == null) {
          temporary = true;
        }
        if (wait == null) {
          wait = this.app.get('pause') - this.app.get('seconds');
        }
        clearInterval(this.iterateInterval);
        clearTimeout(this.iterateWait);
        this.iterateInterval = null;
        self = this;
        if (temporary === true) {
          return this.iterateWait = setTimeout(function(){if(typeof self !== 'undefined'){self.iterate();}}, wait * 1000);
        } else {
          return this.iterateWait = null;
        }
      },
      iterate: function(immediately) {
        var self;

        if (immediately == null) {
          immediately = false;
        }
        self = this;
        this.iterateInterval = setInterval(function(){if(typeof self !== 'undefined'){self.next();}}, this.app.get('seconds') * 1000);
        if (immediately) {
          return this.next();
        }
      },
      goto: function(item, pause, direction) {
        if (pause == null) {
          pause = false;
        }
        if (direction == null) {
          direction = 'to-left';
        }
        if (pause === true) {
          this.pause();
        }
        this.models[this.current].view.hide(direction);
        this.models[item].view.show(direction);
        return this.current = item;
      },
      next: function(pause) {
        var item;

        item = this.current + 1;
        if (item === this.models.length) {
          item = 0;
        }
        return this.goto(item, pause, 'to-left');
      },
      previous: function(pause) {
        var item;

        item = this.current - 1;
        if (item === -1) {
          item = this.models.length - 1;
        }
        return this.goto(item, pause, 'to-right');
      },
      refresh: function() {
        this.count += 1;
        if (this.count === 1) {
          return this.fetch({
            url: "//" + (this.app.get('livewhale_host')) + (this.app.get('items_api')) + "/max/" + (Math.floor(this.app.get('max') * 1.5)),
            merge: false
          });
        }
      },
      resize: function() {
        return _.each(this.models, function(item) {
          return item.view.render();
        });
      },
      initialize: function(models, options) {
        var self;

        this.app = options.app;
        self = this;
        this.on('remove', function(model, collection, options) {
          if (!_.find(this.removed, function(removed) {
            return removed.id === model.id;
          })) {
            this.removed.push(model);
          }
          if (options.index <= this.current) {
            this.current -= 1;
            if (this.current === -1) {
              this.current = this.models.length - 1;
            }
          }
          if (this.reserve.length > 0) {
            return this.add(this.reserve.shift());
          }
        });
        this.on('sort', function(collection) {
          var index, visibleItem;

          if (this.started === true) {
            visibleItem = _.find(this.models, function(item) {
              if (item.view != null) {
                return item.view.visible();
              }
            });
            index = _.indexOf(this.models, visibleItem);
            if (index !== -1) {
              return this.current = index;
            }
          }
        });
        this.refreshInterval = setInterval(function(){if(typeof self !== 'undefined'){self.refresh();}}, this.app.get('refresh') * 1000);
        this.refresh();
        return this;
      }
    });
    Screens = Backbone.Model.extend({
      width: null,
      resizeWait: null,
      renderPause: 1,
      renderDelay: null,
      "default": {
        el: null,
        min: null,
        max_days: null,
        max: null,
        seconds: null,
        pause: null,
        refresh: null,
        crop: null,
        date_format: '',
        time_format: '',
        drop_zeroes: '',
        add_periods_to_meridians: '',
        server_time_zone: "UTC",
        server_offset: 0,
        server_in_daylight_savings: false,
        livewhale_host: '',
        items_api: '',
        event_api: '',
        image_api: ''
      },
      attachEvents: function(model) {
        if (model == null) {
          model = null;
        }
        if (model == null) {
          return null;
        }
        if ((window.customScreens != null) && (window.customScreens[model.name] != null) && typeof window.customScreens[model.name].events === 'object') {
          return _.each(window.customScreens[model.name].events, function(f, e) {
            if (typeof window.customScreens[model.name][f] === 'function') {
              return model.bind(e, window.customScreens[model.name][f], model);
            }
          });
        }
      },
      setWindow: function() {
        this.width = this.$el.width();
        if (this.$el.height() > (this.width * 1.25)) {
          return this.$el.addClass('portrait');
        } else {
          return this.$el.removeClass('portrait');
        }
      },
      resize: function() {
        this.setWindow();
        return this.items.resize();
      },
      set: function(attributes, options) {
        var self;

        self = this;
        _.each(attributes, function(value, key, list) {
          switch (key) {
            case 'min':
            case 'max_days':
            case 'max':
            case 'seconds':
            case 'pause':
            case 'server_offset':
              if (value != null) {
                return list[key] = parseInt(value);
              }
              break;
            case 'date_format':
              if (value != null) {
                return moment.lang('en', {
                  calendar: {
                    lastDay: '[Yesterday]',
                    sameDay: '[Today]',
                    nextDay: '[Tomorrow]',
                    lastWeek: '[Last] dddd',
                    nextWeek: 'dddd',
                    sameElse: value
                  }
                });
              }
          }
        });
        return Backbone.Model.prototype.set.call(this, attributes, options);
      },
      initialize: function() {
        var self;

        self = this;
        this.$el = livewhale.jQuery("#" + (this.get('el')));
        this.setWindow();
        livewhale.jQuery(window).resize(function() {
          self = livewhale.screens;
          clearTimeout(self.resizeWait);
          return self.resizeWait = setTimeout(function(){if(typeof self !== 'undefined'){self.resize();}}, 250);
        });
        this.templates = {};
        livewhale.jQuery(".lw_widget_screens script[type='text/template']").each(function() {
          var id;

          id = livewhale.jQuery(this).attr('id');
          if (id != null) {
            return self.templates[id] = livewhale.jQuery("#" + id).text().replace(/^\/\*\<\!\[CDATA\[\*\/\s*([^]+)\s*\/\*\]\]\>\*\/$/m, "$1");
          }
        });
        this.renderDelay = this.renderPause + this.get('seconds');
        this.items = new Items([], {
          app: self
        });
        livewhale.jQuery(document).keydown(function(e) {
          switch (e.keyCode) {
            case 32:
              e.preventDefault();
              if (self.items.isPaused()) {
                return self.items.iterate(true);
              } else {
                return self.items.pause(false);
              }
              break;
            case 37:
              e.preventDefault();
              return self.items.previous(true);
            case 39:
              e.preventDefault();
              return self.items.next(true);
          }
        });
        this.$el.swipeEvents().bind('swipeLeft', function() {
          return self.items.next(true);
        }).bind('swipeRight', function() {
          return self.items.previous(true);
        });
        return this;
      }
    });
    if ((typeof livewhale !== "undefined" && livewhale !== null) && (window.screensWidgetArguments != null)) {
      return livewhale.screens = new Screens(JSON.parse(window.screensWidgetArguments));
    }
  });

}).call(this);

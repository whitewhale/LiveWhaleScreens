
'use strict'

livewhale.jQuery(document).ready () ->

  Backbone.$ = livewhale.jQuery

  Image = Backbone.Model.extend
    name: 'Image'
    selector: '.image'
    defaults:
      gid: null
      id: null
      filename: null
      extension: null
      width: null
      src: null
      alt: ''
    url: () ->
      return "" if !@get('width')?
      url = ''
      self = @
      _.each ['gid', 'filename', 'extension', 'width'], (key) ->
        url += ("/#{key}" + (if key is 'filename' then "/#{self.get('id')}_" else "/") + "#{encodeURI(self.get(key))}") if self.get(key)?
      url += "/crop/#{@app.get('crop')}" if @app.get('crop')?
      "#{@urlRoot}#{url}"
    set: (attributes, options) ->
      app = if options? and options.app? then options.app else @app
      _.each attributes, (value, key, list) ->
        switch key
          when 'id', 'gid', 'width'
            list[key] = parseInt(value) if value?
          when 'filename'
            list['alt'] = value if value? and list['alt'] is ''
      Backbone.Model.prototype.set.call(@, attributes, options)
    update: () ->
      @fetch { url: @url() }
    initialize: (attributes, options) ->
      @app = options.app
      @item = options.item
      self = @
      @bind 'change:width', self.update, self
      @view = new ImageView { model: self, app: @app }
      @urlRoot = "//#{@app.get('livewhale_host')}#{@app.get('image_api')}"
      @

  QRCode = Backbone.Model.extend
    name: 'QRCode'
    selector: '.qrcode'
    defaults:
      width: null
      content: null
      src: null
      alt: 'QR Code'
    set: (attributes, options) ->
      app = if options? and options.app? then options.app else @app
      if attributes['width']?
        attributes['width'] = parseInt(attributes['width'])
        attributes['width'] = 60 if attributes['width'] < 60
        attributes['height'] = attributes['width']
        content = if attributes['content']? then attributes['content'] else @get('content')
        attributes['src'] = "//chart.googleapis.com/chart?chs=#{attributes['width']}x#{attributes['height']}&cht=qr&chld=H&chl=#{encodeURIComponent(content)}" if content? and content isnt ''
      Backbone.Model.prototype.set.call(@, attributes, options)
    initialize: (attributes, options) ->
      @app = options.app
      @item = options.item
      self = @
      @view = new ImageView { model: self, app: @app }
      @

  ImageView = Backbone.View.extend
    render: () ->
      return @ if !@model.item.view?
      @el = "#{@model.item.view.el} #{@model.selector}"
      @$el = livewhale.jQuery(@el)
      return @ if !@$el.length?
      width = @$el.width()
      if !@model.get('width')? or @model.get('width') isnt width
        @model.set { width: width }
      else if @model.get('src')?
        @$el.html(@template(@model.attributes))
      @
    initialize: (options) ->
      @app = options.app
      self = @
      @template = _.template @app.templates['image_template']
      @model.bind 'change', self.render, self
      @

  Event = Backbone.Model.extend
    name: 'Event'
    updateWait: null
    removeWait: null
    defaults:
      all_day: false
      began_on: null
      date: null
      date2: null
      date2_dt: null
      date2_time: null
      date_created: null
      date_dt: null
      date_time: null
      date_ts: null
      day: null
      description: ''
      eid: null
      gid: null
      group: ''
      has_registration: false
      id: null
      image: null
      is_starred: false
      last_modified: null
      last_user: null
      location: ''
      location_latitude: null
      location_longitude: null
      location_title: ''
      parent: null
      proximity: null
      repeats: null
      repeats_until: null
      repeat: ''
      source: ''
      summary: ''
      through: ''
      thumb: ''
      thumbnail: ''
      time: null
      title: ''
      type: null
      link: ''
      link_shortened: ''
    setTimeFormat: (time, prefix=false) ->
      return '' if !time? or !moment.isMoment(time)
      timeString = time.format(@app.get('time_format'))
      timeString = timeString.replace(/\:00/ig, '') if @app.get('drop_zeroes') is true
      timeString = timeString.replace(/(a|p)(m)$/i, "$1.$2.") if @app.get('add_periods_to_meridians') is true
      return timeString if prefix is false
      if moment().isBefore(time) then "Until #{timeString}" else "Began at #{timeString}"
    setDateFormat: (date, calendar=false) ->
      return '' if !date? or !moment.isMoment(date)
      if calendar is true
        date.calendar().replace(/May\./i, 'May')
      else
        date.format(@app.get('date_format')).replace(/May\./i, 'May')
    setAllDay: () ->
      attributes = {}
      if @get('date_dt')?
        if @get('date_dt').format('HH:mm:ss') is '00:00:00' and (!@get('date2_dt')? or @get('date2_dt').format('HH:mm:ss') is '00:00:00') # if starts at midnight and no end or ends at midnight
          @set {
            all_day: true
            time: "All Day"
            date2_dt: moment(if @get('date2_dt')? then @get('date2_dt') else @get('date_dt')).add('days', 1).subtract('seconds', 1)
            }
        else
          @set { all_day: false }
    setDayAndTime: () ->
      if @get('date_dt')?
        if moment().isBefore(@get('date_dt'))
          attributes =
            day: @setDateFormat(@get('date_dt'), true)
          if !@get('all_day')? or @get('all_day') is false
            attributes['time'] = @setTimeFormat(@get('date_dt'))
        else
          attributes =
            day: "Today"
          if !@get('all_day')? or @get('all_day') is false
            if @get('date2_dt').isSame(moment(), 'day')
              attributes['time'] = @setTimeFormat((if @get('date2_dt')? then @get('date2_dt') else @get('date_dt')), true)
            else
              attributes['time'] = 'All Day'
        @set attributes
    setBeganOn: () ->
      if @get('date_dt')? and moment().isAfter(@get('date_dt'), 'day')
        if @get('all_day') is true
          @set { began_on: @setDateFormat(@get('date_dt'), true) }
        else
          @set { began_on: @setDateFormat(@get('date_dt'), true) + ", " + @setTimeFormat(@get('date_dt')) }
    setThrough: () ->
      if @get('date2_dt')? and !@get('date2_dt').isSame(moment(), 'day') and !@get('date2_dt').isSame(@get('date_dt'), 'day')
        if @get('all_day') is true
          @set { through: @setDateFormat(@get('date2_dt'), true) }
        else
          @set { through: @setDateFormat(@get('date2_dt'), true) + ", " + @setTimeFormat(@get('date2_dt')) }
    setProximity: () ->
      if @get('day')?
        proximity = @get('day').match(/^(Today|Tomorrow)/i)
        @set({ proximity: proximity[1].toLowerCase() }) if proximity?
    setRepeats: () ->
      if @get('repeats_until')? and moment.isMoment(@get('repeats_until')) and @get('repeats')?
        switch @get('repeats')
          when 1 # Daily
            if moment().isBefore(@get('repeats_until'), 'day')
              @set { through: @setDateFormat(@get('repeats_until'), true) }
          when 2, 4 # Weekly, Weekdays
            if @get('date_dt')?
              if @get('repeats') is 2
                nextDay = then moment(@get('date_dt')).add('weeks', 1)
              else
                nextDay = (if @get('date_dt').day() > 4 then moment(@get('date_dt')).startOf('week').add('days', 8) else moment(@get('date_dt')).add('weeks', 1))
            if nextDay? and !nextDay.isAfter(@get('repeats_until'), 'day')
              @set { repeat: @setDateFormat(nextDay, true) }
    setURLItems: () ->
      if @get('link')?
        attributes =
          link_shortened: @get('link').replace(/^http(s?):\/\/(.*)\/(\d+)-.*$/, "http$1://$2/$3")
        keys = @get('link').match(/live\/([^\/]+)\/(\d+)[^\d]+/)
        attributes['type'] = InflectionJS.singularize(keys[1]) if keys?
        if !@get('parent')? and keys? and keys[1] is 'events'
          parent = parseInt(keys[2])
          attributes['parent'] = parent if !isNaN(parent) and @get('id') isnt parent
        @set attributes
    setQRCode: () ->
      self = @
      if @get('link_shortened')? and @app.width > 481
        @qrcode = new QRCode {
          content: @get('link_shortened')
          }, { item: self, app: self.app }
    setImage: () ->
      self = @
      if @get('thumbnail')?
        image = @get('thumbnail').match(/gid\/(\d+)\/.*\/(\d+)_([^\.]+)\.([^\.]+)$/)
        if image?
          @image = new Image {
            gid: image[1]
            id: image[2]
            filename: image[3]
            extension: image[4]
            }, { item: self, app: self.app }
    set: (attributes, options) ->
      return if !attributes?
      app = if options? and options.collection? and options.collection.app? then options.collection.app else @app
      self = @
      _.each attributes, (value, key, list) ->
        switch key
          when 'id', 'gid', 'parent', 'repeats'
            list[key] = parseInt(value) if value?
          when 'date_dt', 'date2_dt'
            list[key] = moment.utc(value, 'YYYY-MM-DD HH:mm:ss').local() if value?
          when 'repeats_until'
            list['repeats_until'] = moment(value, 'MM/DD/YY') if value?
          when 'url'
            if value?
              list['link'] = value
              self.trigger 'change:link'
      Backbone.Model.prototype.set.call(@, attributes, options)
    setUpdateTimeout: () ->
      self = @
      clearTimeout @updateWait
      maxMilliseconds = moment().add('days', 1).hours(0).minutes(0).seconds(1).diff()
      if @get('date_dt')? and moment().isBefore(@get('date_dt'))
        updateMilliseconds = @get('date_dt').diff()
      else if @get('date2_dt')? and moment().isBefore(@get('date2_dt'))
        updateMilliseconds = @get('date2_dt').diff()
      else if @get('date_dt')? or @get('date2_dt')?
        updateMilliseconds = 0
      return null if !updateMilliseconds?
      updateMilliseconds = 0 if updateMilliseconds < 0
      updateMilliseconds = maxMilliseconds if updateMilliseconds > maxMilliseconds
      @updateWait = setTimeout `function(){if(typeof self !== 'undefined'){self.update();}}`, updateMilliseconds
    update: () ->
      self = @
      if (@get('date_dt')? and moment().isBefore(@get('date_dt'))) or (@get('date2_dt')? and moment().isBefore(@get('date2_dt')))
        @setUpdateTimeout()
        @setDayAndTime()
      else
        if @view.visible()
          clearTimeout @removeWait
          @removeWait = setTimeout `function(){if(typeof self !== 'undefined'){self.collection.remove(self);}}`, (@app.renderDelay * 1000)
          return null
        else
          return self.collection.remove(self)
    initialize: () ->
      @app = @collection.app
      self = @
      @bind 'change:date_dt', self.collection.start, self.collection
      @bind 'change:date_dt', self.collection.sort, self.collection
      @bind 'change:date2_dt', self.collection.sort, self.collection
      @on 'change:date_dt', self.setUpdateTimeout
      @on 'change:date2_dt', self.setUpdateTimeout
      @on 'change:date_dt', self.setAllDay
      @on 'change:date_dt', self.setDayAndTime
      @on 'change:date2_dt', self.setDayAndTime
      @on 'change:all_day', self.setDayAndTime
      @on 'change:date_dt', self.setBeganOn
      @on 'change:day', self.setProximity
      @on 'change:date2_dt', self.setThrough
      @on 'change:repeats_until', self.setRepeats
      @on 'change:repeats', self.setRepeats
      @on 'change:link', self.setURLItems
      @on 'change:link', self.setQRCode
      @on 'change:thumb', self.setImage
      @app.attachEvents(self)
      @view = new EventView { model: self, app: @app }
      @urlRoot = "//#{@app.get('livewhale_host')}#{@app.get('event_api')}"
      id = (if @get('parent')? then @get('parent') else @id)
      @fetch({ url: (if id? then "#{@urlRoot}/#{id}@JSON?ts=#{(new Date().valueOf())}" else ''), dataType: 'jsonp' })
      @

  EventView = Backbone.View.extend
    state: 'hide to-right'
    transitioning: false
    transitionWait: null
    renderWait: null
    visible: () ->
      (@state.substring(0, 4) isnt 'hide' or @transitioning is true)
    show: (direction=null) ->
      direction = 'to-left' if !direction?
      direction = if direction is 'to-right' then 'to-left' else 'to-right'
      @transition("move #{direction}")
      self = @
      setTimeout `function(){if(typeof self !== 'undefined'){self.transition('show');}}`, 50 # wait a cycle for the move
    hide: (direction=null) ->
      direction = 'to-left' if !direction?
      @transition("hide #{direction}")
    transition: (newState) ->
      return null if @state is newState
      @transitioning = true
      @$el = @app.$el.find(@el)
      currentState = @state
      @state = newState
      @$el.removeClass(currentState).addClass(newState)
      @$el.offsetHeight
    validateState: () ->
      @$el = @app.$el.find(@el)
      state = @$el.attr('class')
      @state = state.replace(/(^item\s|\sitem)/i, '') if state?
    render: () ->
      self = @
      @validateState()
      if @visible()
        clearTimeout @renderWait
        @renderWait = setTimeout `function(){if(typeof self !== 'undefined'){self.render();}}`, @app.renderDelay * 1000
        return null
      data = _.extend(_.clone(@model.attributes), { state: @state })
      if @$el.length is 0
        @app.$el.append(@template(data))
      else
        @$el.replaceWith(@template(data))
      @$el = @app.$el.find(@el)
      @$el.bind "transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", (e) ->
        clearTimeout self.transitionWait
        self.transitionWait = setTimeout(`function(){if(typeof self !== 'undefined'){self.transitioning = false;}}`, 250) if self.transitioning is true
      @model.image.view.render() if @model.image?
      @model.qrcode.view.render() if @model.qrcode?
      @
    initialize: (options) ->
      @app = options.app
      self = @
      @el = "#event_#{@model.id}"
      @validateState()
      @template = _.template @app.templates['event_template']
      @model.bind 'change', self.render, self
      @render()
      @

  Items = Backbone.Collection.extend
    name: 'items'
    model: Event
    current: 0
    started: false
    refreshInterval: null
    iterateInterval: null
    iterateWait: null
    reserve: []
    removed: []
    count: 0
    comparator: (item) ->
      if item.get('date_dt')? and moment().isBefore(item.get('date_dt'))
        item.get('date_dt').valueOf()
      else if item.get('date2_dt')? and moment().isBefore(item.get('date2_dt'))
        item.get('date2_dt').valueOf()
      else
        moment().valueOf()
    isRemoved: (id) ->
      id = parseInt(id)
      return false if isNaN(id)
      _.find @removed, (removedItem) ->
        removedItem.id is id
    parse: (items, options) ->
      self = @
      maxDays = moment().add('days', @app.get('max_days'))
      items = _.filter items, (item) ->
        !self.isRemoved(item.id)
      item = items.pop()
      while items.length > @app.get('max') or (items.length > @app.get('min') and moment("#{item.date_ts}", 'X').isAfter(maxDays))
        @reserve.unshift(item) if !_.find @reserve, (reserved) ->
          reserved.id is item.id
        item = items.pop()
      @reserve = _.sortBy @reserve, (item) ->
        item.date_ts
      items.push item
      items
    start: (model) ->
      self = @
      return null if @started is true or model isnt @models[0]
      @started = true
      setTimeout `function(){if(typeof self !== 'undefined'){self.models[self.current].view.show();self.iterate();}}`, 1500
    isPaused: () ->
      !@iterateInterval?
    pause: (temporary=true, wait=(@app.get('pause') - @app.get('seconds'))) ->
      clearInterval @iterateInterval
      clearTimeout @iterateWait
      @iterateInterval = null
      self = @
      if temporary is true
        @iterateWait = setTimeout `function(){if(typeof self !== 'undefined'){self.iterate();}}`, (wait * 1000)
      else
        @iterateWait = null
    iterate: (immediately=false) ->
      self = @
      @iterateInterval = setInterval `function(){if(typeof self !== 'undefined'){self.next();}}`, (@app.get('seconds') * 1000)
      @next() if immediately
    goto: (item, pause=false, direction='to-left') ->
      @pause() if pause is true
      @models[@current].view.hide(direction)
      @models[item].view.show(direction)
      @current = item
    next: (pause) ->
      item = @current + 1
      item = 0 if item is @models.length
      @goto(item, pause, 'to-left')
    previous: (pause) ->
      item = @current - 1
      item = @models.length - 1 if item is -1
      @goto(item, pause, 'to-right')
    refresh: () ->
      @count += 1
      if @count is 1
        @fetch { url: "//#{@app.get('livewhale_host')}#{@app.get('items_api')}/max/#{Math.floor(@app.get('max') * 1.5)}", merge: false, dataType: 'jsonp' }
    resize: () ->
      _.each @models, (item) ->
        item.view.render()
    initialize: (models, options) ->
      @app = options.app
      self = @
      @on 'remove', (model, collection, options) ->
        @removed.push(model) if !_.find @removed, (removed) ->
          removed.id is model.id
        if options.index <= @current
          @current -= 1
          @current = @models.length - 1 if @current is -1
        if @reserve.length > 0
          @add @reserve.shift()
      @on 'sort', (collection) ->
        if @started is true
          visibleItem = _.find @models, (item) ->
            item.view.visible() if item.view?
          index = _.indexOf @models, visibleItem
          @current = index if index isnt -1
      @refreshInterval = setInterval `function(){if(typeof self !== 'undefined'){self.refresh();}}`, (@app.get('refresh') * 1000)
      @refresh()
      @

  Screens = Backbone.Model.extend
    width: null
    resizeWait: null
    renderPause: 1
    renderDelay: null
    default:
      el: null
      min: null
      max_days: null
      max: null
      seconds: null
      pause: null
      refresh: null
      crop: null
      date_format: ''
      time_format: ''
      drop_zeroes: ''
      add_periods_to_meridians: ''
      server_time_zone: "UTC"
      server_offset: 0
      server_in_daylight_savings: false
      livewhale_host: ''
      items_api: ''
      event_api: ''
      image_api: ''
    attachEvents: (model=null) ->
      return null if !model?
      if window.customScreens? and window.customScreens[model.name]? and typeof window.customScreens[model.name].events is 'object'
        _.each window.customScreens[model.name].events, (f, e) ->
          if typeof window.customScreens[model.name][f] is 'function'
            model.bind e, window.customScreens[model.name][f], model
    setWindow: () ->
      @width = @$el.width()
      if (@$el.height() > (@width * 1.25))
        @$el.addClass('portrait')
      else
        @$el.removeClass('portrait')
    resize: () ->
      @setWindow()
      @items.resize()
    set: (attributes, options) ->
      self = @
      _.each attributes, (value, key, list) ->
        switch key
          when 'min', 'max_days', 'max', 'seconds', 'pause', 'server_offset'
            list[key] = parseInt(value) if value?
          when 'date_format'
            if value?
              moment.lang 'en', {
                calendar:
                  lastDay: '[Yesterday]'
                  sameDay: '[Today]'
                  nextDay: '[Tomorrow]'
                  lastWeek: '[Last] dddd'
                  nextWeek: 'dddd'
                  sameElse: value
                }
      Backbone.Model.prototype.set.call(@, attributes, options)
    initialize: () ->
      self = @
      @$el = livewhale.jQuery("##{@get('el')}")
      @setWindow()
      livewhale.jQuery(window).resize () ->
        self = livewhale.screens
        clearTimeout self.resizeWait
        self.resizeWait = setTimeout `function(){if(typeof self !== 'undefined'){self.resize();}}`, 250
      @templates = {}
      livewhale.jQuery(".lw_widget_screens script[type='text/template']").each () ->
        id = livewhale.jQuery(this).attr('id')
        self.templates[id] = livewhale.jQuery("##{id}").text().replace(/^\/\*\<\!\[CDATA\[\*\/\s*([^]+)\s*\/\*\]\]\>\*\/$/m, "$1") if id?
      @renderDelay = @renderPause + @get('seconds')
      @items = new Items [], { app: self }
      livewhale.jQuery(document).keydown (e) ->
        switch e.keyCode
          when 32
            e.preventDefault()
            if self.items.isPaused()
              self.items.iterate(true)
            else
              self.items.pause(false)
          when 37
            e.preventDefault()
            self.items.previous(true)
          when 39
            e.preventDefault()
            self.items.next(true)
      @$el.swipeEvents().bind(
        'swipeLeft', () ->
          self.items.next(true)
        ).bind(
        'swipeRight', () ->
          self.items.previous(true)
        )
      @

  livewhale.screens = new Screens(JSON.parse(window.screensWidgetArguments)) if livewhale? and window.screensWidgetArguments?


'use strict';

/**
 * Copyright Marc J. Schmidt. See the LICENSE file at the top-level
 * directory of this distribution and at
 * https://github.com/marcj/css-element-queries/blob/master/LICENSE.
 */
(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define(factory);
  } else if (typeof exports === "object") {
    module.exports = factory();
  } else {
    root.ResizeSensor = factory();
  }
}(typeof window !== 'undefined' ? window : this, function () {

  // Make sure it does not throw in a SSR (Server Side Rendering) situation
  if (typeof window === "undefined") {
    return null;
  }
  // https://github.com/Semantic-Org/Semantic-UI/issues/3855
  // https://github.com/marcj/css-element-queries/issues/257
  var globalWindow = typeof window != 'undefined' && window.Math == Math
    ? window
    : typeof self != 'undefined' && self.Math == Math
      ? self
      : Function('return this')();
  // Only used for the dirty checking, so the event callback count is limited to max 1 call per fps per sensor.
  // In combination with the event based resize sensor this saves cpu time, because the sensor is too fast and
  // would generate too many unnecessary events.
  var requestAnimationFrame = globalWindow.requestAnimationFrame ||
    globalWindow.mozRequestAnimationFrame ||
    globalWindow.webkitRequestAnimationFrame ||
    function (fn) {
      return globalWindow.setTimeout(fn, 20);
    };

  var cancelAnimationFrame = globalWindow.cancelAnimationFrame ||
    globalWindow.mozCancelAnimationFrame ||
    globalWindow.webkitCancelAnimationFrame ||
    function (timer) {
      globalWindow.clearTimeout(timer);
    };

  /**
   * Iterate over each of the provided element(s).
   *
   * @param {HTMLElement|HTMLElement[]} elements
   * @param {Function}                  callback
   */
  function forEachElement(elements, callback) {
    var elementsType = Object.prototype.toString.call(elements);
    var isCollectionTyped = ('[object Array]' === elementsType
      || ('[object NodeList]' === elementsType)
      || ('[object HTMLCollection]' === elementsType)
      || ('[object Object]' === elementsType)
      || ('undefined' !== typeof jQuery && elements instanceof jQuery) //jquery
      || ('undefined' !== typeof Elements && elements instanceof Elements) //mootools
    );
    var i = 0, j = elements.length;
    if (isCollectionTyped) {
      for (; i < j; i++) {
        callback(elements[i]);
      }
    } else {
      callback(elements);
    }
  }

  /**
  * Get element size
  * @param {HTMLElement} element
  * @returns {Object} {width, height}
  */
  function getElementSize(element) {
    if (!element.getBoundingClientRect) {
      return {
        width: element.offsetWidth,
        height: element.offsetHeight
      }
    }

    var rect = element.getBoundingClientRect();
    return {
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    }
  }

  /**
   * Apply CSS styles to element.
   *
   * @param {HTMLElement} element
   * @param {Object} style
   */
  function setStyle(element, style) {
    Object.keys(style).forEach(function (key) {
      element.style[key] = style[key];
    });
  }

  /**
   * Class for dimension change detection.
   *
   * @param {Element|Element[]|Elements|jQuery} element
   * @param {Function} callback
   *
   * @constructor
   */
  var ResizeSensor = function (element, callback) {
    //Is used when checking in reset() only for invisible elements
    var lastAnimationFrameForInvisibleCheck = 0;

    /**
     *
     * @constructor
     */
    function EventQueue() {
      var q = [];
      this.add = function (ev) {
        q.push(ev);
      };

      var i, j;
      this.call = function (sizeInfo) {
        for (i = 0, j = q.length; i < j; i++) {
          q[i].call(this, sizeInfo);
        }
      };

      this.remove = function (ev) {
        var newQueue = [];
        for (i = 0, j = q.length; i < j; i++) {
          if (q[i] !== ev) newQueue.push(q[i]);
        }
        q = newQueue;
      };

      this.length = function () {
        return q.length;
      }
    }

    /**
     *
     * @param {HTMLElement} element
     * @param {Function}    resized
     */
    function attachResizeEvent(element, resized) {
      if (!element) return;
      if (element.resizedAttached) {
        element.resizedAttached.add(resized);
        return;
      }

      element.resizedAttached = new EventQueue();
      element.resizedAttached.add(resized);

      element.resizeSensor = document.createElement('div');
      element.resizeSensor.dir = 'ltr';
      element.resizeSensor.className = 'resize-sensor';

      var style = {
        pointerEvents: 'none',
        position: 'absolute',
        left: '0px',
        top: '0px',
        right: '0px',
        bottom: '0px',
        overflow: 'hidden',
        zIndex: '-1',
        visibility: 'hidden',
        maxWidth: '100%'
      };
      var styleChild = {
        position: 'absolute',
        left: '0px',
        top: '0px',
        transition: '0s',
      };

      setStyle(element.resizeSensor, style);

      var expand = document.createElement('div');
      expand.className = 'resize-sensor-expand';
      setStyle(expand, style);

      var expandChild = document.createElement('div');
      setStyle(expandChild, styleChild);
      expand.appendChild(expandChild);

      var shrink = document.createElement('div');
      shrink.className = 'resize-sensor-shrink';
      setStyle(shrink, style);

      var shrinkChild = document.createElement('div');
      setStyle(shrinkChild, styleChild);
      setStyle(shrinkChild, { width: '200%', height: '200%' });
      shrink.appendChild(shrinkChild);

      element.resizeSensor.appendChild(expand);
      element.resizeSensor.appendChild(shrink);
      element.appendChild(element.resizeSensor);

      var computedStyle = window.getComputedStyle(element);
      var position = computedStyle ? computedStyle.getPropertyValue('position') : null;
      if ('absolute' !== position && 'relative' !== position && 'fixed' !== position && 'sticky' !== position) {
        element.style.position = 'relative';
      }

      var dirty = false;

      //last request animation frame id used in onscroll event
      var rafId = 0;
      var size = getElementSize(element);
      var lastWidth = 0;
      var lastHeight = 0;
      var initialHiddenCheck = true;
      lastAnimationFrameForInvisibleCheck = 0;

      var resetExpandShrink = function () {
        var width = element.offsetWidth;
        var height = element.offsetHeight;

        expandChild.style.width = (width + 10) + 'px';
        expandChild.style.height = (height + 10) + 'px';

        expand.scrollLeft = width + 10;
        expand.scrollTop = height + 10;

        shrink.scrollLeft = width + 10;
        shrink.scrollTop = height + 10;
      };

      var reset = function () {
        // Check if element is hidden
        if (initialHiddenCheck) {
          var invisible = element.offsetWidth === 0 && element.offsetHeight === 0;
          if (invisible) {
            // Check in next frame
            if (!lastAnimationFrameForInvisibleCheck) {
              lastAnimationFrameForInvisibleCheck = requestAnimationFrame(function () {
                lastAnimationFrameForInvisibleCheck = 0;
                reset();
              });
            }

            return;
          } else {
            // Stop checking
            initialHiddenCheck = false;
          }
        }

        resetExpandShrink();
      };
      element.resizeSensor.resetSensor = reset;

      var onResized = function () {
        rafId = 0;

        if (!dirty) return;

        lastWidth = size.width;
        lastHeight = size.height;

        if (element.resizedAttached) {
          element.resizedAttached.call(size);
        }
      };

      var onScroll = function () {
        size = getElementSize(element);
        dirty = size.width !== lastWidth || size.height !== lastHeight;

        if (dirty && !rafId) {
          rafId = requestAnimationFrame(onResized);
        }

        reset();
      };

      var addEvent = function (el, name, cb) {
        if (el.attachEvent) {
          el.attachEvent('on' + name, cb);
        } else {
          el.addEventListener(name, cb);
        }
      };

      addEvent(expand, 'scroll', onScroll);
      addEvent(shrink, 'scroll', onScroll);

      // Fix for custom Elements and invisible elements
      lastAnimationFrameForInvisibleCheck = requestAnimationFrame(function () {
        lastAnimationFrameForInvisibleCheck = 0;
        reset();
      });
    }

    forEachElement(element, function (elem) {
      attachResizeEvent(elem, callback);
    });

    this.detach = function (ev) {
      // clean up the unfinished animation frame to prevent a potential endless requestAnimationFrame of reset
      if (lastAnimationFrameForInvisibleCheck) {
        cancelAnimationFrame(lastAnimationFrameForInvisibleCheck);
        lastAnimationFrameForInvisibleCheck = 0;
      }
      ResizeSensor.detach(element, ev);
    };

    this.reset = function () {
      //To prevent invoking element.resizeSensor.resetSensor if it's undefined
      if (element.resizeSensor.resetSensor) {
        element.resizeSensor.resetSensor();
      }
    };
  };

  ResizeSensor.reset = function (element) {
    forEachElement(element, function (elem) {
      //To prevent invoking element.resizeSensor.resetSensor if it's undefined
      if (element.resizeSensor.resetSensor) {
        elem.resizeSensor.resetSensor();
      }
    });
  };

  ResizeSensor.detach = function (element, ev) {
    forEachElement(element, function (elem) {
      if (!elem) return;
      if (elem.resizedAttached && typeof ev === "function") {
        elem.resizedAttached.remove(ev);
        if (elem.resizedAttached.length()) return;
      }
      if (elem.resizeSensor) {
        if (elem.contains(elem.resizeSensor)) {
          elem.removeChild(elem.resizeSensor);
        }
        delete elem.resizeSensor;
        delete elem.resizedAttached;
      }
    });
  };

  if (typeof MutationObserver !== "undefined") {
    var observer = new MutationObserver(function (mutations) {
      for (var i in mutations) {
        if (mutations.hasOwnProperty(i)) {
          var items = mutations[i].addedNodes;
          for (var j = 0; j < items.length; j++) {
            if (items[j].resizeSensor) {
              ResizeSensor.reset(items[j]);
            }
          }
        }
      }
    });

    document.addEventListener("DOMContentLoaded", function (event) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  }

  return ResizeSensor;

}));


(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Sticky Sidebar JavaScript Plugin.
 * @version 3.2.0
 * @author Ahmed Bouhuolia <a.bouhuolia@gmail.com>
 * @license The MIT License (MIT)
 */
var StickySidebar = function () {

  // ---------------------------------
  // # Define Constants
  // ---------------------------------
  //
  var EVENT_KEY = '.stickySidebar';
  var DEFAULTS = {

    /**
     * Additional top spacing of the element when it becomes sticky.
     * @type {Numeric|Function}
     */
    topSpacing: 0,

    /**
     * Additional bottom spacing of the element when it becomes sticky.
     * @type {Numeric|Function}
     */
    bottomSpacing: 0,

    /**
     * Container sidebar selector to know what the beginning and end of sticky element.
     * @type {String|False}
     */
    containerSelector: false,

    /**
     * Inner wrapper selector.
     * @type {String}
     */
    innerWrapperSelector: '.inner-wrapper-sticky',

    /**
     * The name of CSS class to apply to elements when they have become stuck.
     * @type {String|False}
     */
    stickyClass: 'is-affixed',

    /**
     * Detect when sidebar and its container change height so re-calculate their dimensions.
     * @type {Boolean}
     */
    resizeSensor: true,

    /**
     * The sidebar returns to its normal position if its width below this value.
     * @type {Numeric}
     */
    minWidth: false
  };

  // ---------------------------------
  // # Class Definition
  // ---------------------------------
  //
  /**
   * Sticky Sidebar Class.
   * @public
   */

  var StickySidebar = function () {

    /**
     * Sticky Sidebar Constructor.
     * @constructor
     * @param {HTMLElement|String} sidebar - The sidebar element or sidebar selector.
     * @param {Object} options - The options of sticky sidebar.
     */
    function StickySidebar(sidebar) {
      var _this = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, StickySidebar);

      this.options = StickySidebar.extend(DEFAULTS, options);

      // Sidebar element query if there's no one, throw error.
      this.sidebar = 'string' === typeof sidebar ? document.querySelector(sidebar) : sidebar;
      if ('undefined' === typeof this.sidebar) throw new Error("There is no specific sidebar element.");

      this.sidebarInner = false;
      this.container = this.sidebar.parentElement;

      // Current Affix Type of sidebar element.
      this.affixedType = 'STATIC';
      this.direction = 'down';
      this.support = {
        transform: false,
        transform3d: false
      };

      this._initialized = false;
      this._breakpoint = false;
      this._resizeListeners = [];

      // Dimenstions of sidebar, container and screen viewport.
      this.dimensions = {
        translateY: 0,
        topSpacing: 0,
        bottomSpacing: 0,
        sidebarHeight: 0,
        sidebarWidth: 0,
        containerTop: 0,
        containerHeight: 0,
        viewportHeight: 0,
        viewportTop: 0,
        lastViewportTop: 0
      };

      // Bind event handlers for referencability.
      ['handleEvent'].forEach(function (method) {
        _this[method] = _this[method].bind(_this);
      });

      // Initialize sticky sidebar for first time.
      this.initialize();
    }

    /**
     * Initializes the sticky sidebar by adding inner wrapper, define its container, 
     * min-width breakpoint, calculating dimenstions, adding helper classes and inline style.
     * @private
     */


    _createClass(StickySidebar, [{
      key: 'initialize',
      value: function initialize() {
        var _this2 = this;

        this._setSupportFeatures();

        // Get sticky sidebar inner wrapper, if not found, will create one.
        if (this.options.innerWrapperSelector) {
          this.sidebarInner = this.sidebar.querySelector(this.options.innerWrapperSelector);

          if (null === this.sidebarInner) this.sidebarInner = false;
        }

        if (!this.sidebarInner) {
          var wrapper = document.createElement('div');
          wrapper.setAttribute('class', 'inner-wrapper-sticky');
          this.sidebar.appendChild(wrapper);

          while (this.sidebar.firstChild != wrapper) {
            wrapper.appendChild(this.sidebar.firstChild);
          }this.sidebarInner = this.sidebar.querySelector('.inner-wrapper-sticky');
        }

        // Container wrapper of the sidebar.
        if (this.options.containerSelector) {
          var containers = document.querySelectorAll(this.options.containerSelector);
          containers = Array.prototype.slice.call(containers);

          containers.forEach(function (container, item) {
            if (!container.contains(_this2.sidebar)) return;
            _this2.container = container;
          });

          if (!containers.length) throw new Error("The container does not contains on the sidebar.");
        }

        // If top/bottom spacing is not function parse value to integer.
        if ('function' !== typeof this.options.topSpacing) this.options.topSpacing = parseInt(this.options.topSpacing) || 0;

        if ('function' !== typeof this.options.bottomSpacing) this.options.bottomSpacing = parseInt(this.options.bottomSpacing) || 0;

        // Breakdown sticky sidebar if screen width below `options.minWidth`.
        this._widthBreakpoint();

        // Calculate dimensions of sidebar, container and viewport.
        this.calcDimensions();

        // Affix sidebar in proper position.
        this.stickyPosition();

        // Bind all events.
        this.bindEvents();

        // Inform other properties the sticky sidebar is initialized.
        this._initialized = true;
      }

      /**
       * Bind all events of sticky sidebar plugin.
       * @protected
       */

    }, {
      key: 'bindEvents',
      value: function bindEvents() {
        window.addEventListener('resize', this, { passive: true });
        window.addEventListener('scroll', this, { passive: true });

        this.sidebar.addEventListener('update' + EVENT_KEY, this);

        if (this.options.resizeSensor && 'undefined' !== typeof ResizeSensor) {
          new ResizeSensor(this.sidebarInner, this.handleEvent);
          new ResizeSensor(this.container, this.handleEvent);
        }
      }

      /**
       * Handles all events of the plugin.
       * @param {Object} event - Event object passed from listener.
       */

    }, {
      key: 'handleEvent',
      value: function handleEvent(event) {
        this.updateSticky(event);
      }

      /**
       * Calculates dimesntions of sidebar, container and screen viewpoint
       * @public
       */

    }, {
      key: 'calcDimensions',
      value: function calcDimensions() {
        if (this._breakpoint) return;
        var dims = this.dimensions;

        // Container of sticky sidebar dimensions.
        dims.containerTop = StickySidebar.offsetRelative(this.container).top;
        dims.containerHeight = this.container.clientHeight;
        dims.containerBottom = dims.containerTop + dims.containerHeight;

        // Sidebar dimensions.
        dims.sidebarHeight = this.sidebarInner.offsetHeight;
        dims.sidebarWidth = this.sidebar.offsetWidth;

        // Screen viewport dimensions.
        dims.viewportHeight = window.innerHeight;

        this._calcDimensionsWithScroll();
      }

      /**
       * Some dimensions values need to be up-to-date when scrolling the page.
       * @private
       */

    }, {
      key: '_calcDimensionsWithScroll',
      value: function _calcDimensionsWithScroll() {
        var dims = this.dimensions;

        dims.sidebarLeft = StickySidebar.offsetRelative(this.sidebar).left;

        dims.viewportTop = document.documentElement.scrollTop || document.body.scrollTop;
        dims.viewportBottom = dims.viewportTop + dims.viewportHeight;
        dims.viewportLeft = document.documentElement.scrollLeft || document.body.scrollLeft;

        dims.topSpacing = this.options.topSpacing;
        dims.bottomSpacing = this.options.bottomSpacing;

        if ('function' === typeof dims.topSpacing) dims.topSpacing = parseInt(dims.topSpacing(this.sidebar)) || 0;

        if ('function' === typeof dims.bottomSpacing) dims.bottomSpacing = parseInt(dims.bottomSpacing(this.sidebar)) || 0;
      }

      /**
       * Detarmine wheather the sidebar is bigger than viewport.
       * @public
       * @return {Boolean}
       */

    }, {
      key: 'isSidebarFitsViewport',
      value: function isSidebarFitsViewport() {
        return this.dimensions.sidebarHeight < this.dimensions.viewportHeight;
      }

      /**
       * Observe browser scrolling direction top and down.
       */

    }, {
      key: 'observeScrollDir',
      value: function observeScrollDir() {
        var dims = this.dimensions;
        if (dims.lastViewportTop === dims.viewportTop) return;

        var furthest = 'down' === this.direction ? Math.min : Math.max;

        // If the browser is scrolling not in the same direction.
        if (dims.viewportTop === furthest(dims.viewportTop, dims.lastViewportTop)) this.direction = 'down' === this.direction ? 'up' : 'down';
      }

      /**
       * Gets affix type of sidebar according to current scrollTop and scrollLeft.
       * Holds all logical affix of the sidebar when scrolling up and down and when sidebar 
       * is bigger than viewport and vice versa.
       * @public
       * @return {String|False} - Proper affix type.
       */

    }, {
      key: 'getAffixType',
      value: function getAffixType() {
        var dims = this.dimensions,
            affixType = false;

        this._calcDimensionsWithScroll();

        var sidebarBottom = dims.sidebarHeight + dims.containerTop;
        var colliderTop = dims.viewportTop + dims.topSpacing;
        var colliderBottom = dims.viewportBottom - dims.bottomSpacing;

        // When browser is scrolling top.
        if ('up' === this.direction) {
          if (colliderTop <= dims.containerTop) {
            dims.translateY = 0;
            affixType = 'STATIC';
          } else if (colliderTop <= dims.translateY + dims.containerTop) {
            dims.translateY = colliderTop - dims.containerTop;
            affixType = 'VIEWPORT-TOP';
          } else if (!this.isSidebarFitsViewport() && dims.containerTop <= colliderTop) {
            affixType = 'VIEWPORT-UNBOTTOM';
          }
          // When browser is scrolling up.
        } else {
          // When sidebar element is not bigger than screen viewport.
          if (this.isSidebarFitsViewport()) {

            if (dims.sidebarHeight + colliderTop >= dims.containerBottom) {
              dims.translateY = dims.containerBottom - sidebarBottom;
              affixType = 'CONTAINER-BOTTOM';
            } else if (colliderTop >= dims.containerTop) {
              dims.translateY = colliderTop - dims.containerTop;
              affixType = 'VIEWPORT-TOP';
            }
            // When sidebar element is bigger than screen viewport.
          } else {

            if (dims.containerBottom <= colliderBottom) {
              dims.translateY = dims.containerBottom - sidebarBottom;
              affixType = 'CONTAINER-BOTTOM';
            } else if (sidebarBottom + dims.translateY <= colliderBottom) {
              dims.translateY = colliderBottom - sidebarBottom;
              affixType = 'VIEWPORT-BOTTOM';
            } else if (dims.containerTop + dims.translateY <= colliderTop) {
              affixType = 'VIEWPORT-UNBOTTOM';
            }
          }
        }

        // Make sure the translate Y is not bigger than container height.
        dims.translateY = Math.max(0, dims.translateY);
        dims.translateY = Math.min(dims.containerHeight, dims.translateY);

        dims.lastViewportTop = dims.viewportTop;
        return affixType;
      }

      /**
       * Gets inline style of sticky sidebar wrapper and inner wrapper according 
       * to its affix type.
       * @private
       * @param {String} affixType - Affix type of sticky sidebar.
       * @return {Object}
       */

    }, {
      key: '_getStyle',
      value: function _getStyle(affixType) {
        if ('undefined' === typeof affixType) return;

        var style = { inner: {}, outer: {} };
        var dims = this.dimensions;

        switch (affixType) {
          case 'VIEWPORT-TOP':
            style.inner = { position: 'fixed', top: this.options.topSpacing,
              left: dims.sidebarLeft - dims.viewportLeft, width: dims.sidebarWidth };
            break;
          case 'VIEWPORT-BOTTOM':
            style.inner = { position: 'fixed', top: 'auto', left: dims.sidebarLeft,
              bottom: this.options.bottomSpacing, width: dims.sidebarWidth };
            break;
          case 'CONTAINER-BOTTOM':
          case 'VIEWPORT-UNBOTTOM':
            var translate = this._getTranslate(0, dims.translateY + 'px');

            if (translate) style.inner = { transform: translate };else style.inner = { position: 'absolute', top: dims.translateY, width: dims.sidebarWidth };
            break;
        }

        switch (affixType) {
          case 'VIEWPORT-TOP':
          case 'VIEWPORT-BOTTOM':
          case 'VIEWPORT-UNBOTTOM':
          case 'CONTAINER-BOTTOM':
            style.outer = { height: dims.sidebarHeight, position: 'relative' };
            break;
        }

        style.outer = StickySidebar.extend({ height: '', position: '' }, style.outer);
        style.inner = StickySidebar.extend({ position: 'relative', top: '', left: '',
          bottom: '', width: '', transform: this._getTranslate() }, style.inner);

        return style;
      }

      /**
       * Cause the sidebar to be sticky according to affix type by adding inline
       * style, adding helper class and trigger events.
       * @function
       * @protected
       * @param {string} force - Update sticky sidebar position by force.
       */

    }, {
      key: 'stickyPosition',
      value: function stickyPosition(force) {
        if (this._breakpoint) return;

        force = force || false;

        var affixType = this.getAffixType();
        var style = this._getStyle(affixType);

        if ((this.affixedType != affixType || force) && affixType) {
          var affixEvent = 'affix.' + affixType.toLowerCase().replace('viewport-', '') + EVENT_KEY;
          StickySidebar.eventTrigger(this.sidebar, affixEvent);

          if ('STATIC' === affixType) StickySidebar.removeClass(this.sidebar, this.options.stickyClass);else StickySidebar.addClass(this.sidebar, this.options.stickyClass);

          for (var key in style.outer) {
            this.sidebar.style[key] = style.outer[key];
          }

          for (var _key in style.inner) {
            var _unit2 = 'number' === typeof style.inner[_key] ? 'px' : '';
            this.sidebarInner.style[_key] = style.inner[_key] + _unit2;
          }

          var affixedEvent = 'affixed.' + affixType.toLowerCase().replace('viewport', '') + EVENT_KEY;
          StickySidebar.eventTrigger(this.sidebar, affixedEvent);
        } else {
          if (this._initialized) this.sidebarInner.style.left = style.inner.left;
        }

        this.affixedType = affixType;
      }

      /**
       * Breakdown sticky sidebar when window width is below `options.minWidth` value.
       * @protected
       */

    }, {
      key: '_widthBreakpoint',
      value: function _widthBreakpoint() {

        if (window.innerWidth <= this.options.minWidth) {
          this._breakpoint = true;
          this.affixedType = 'STATIC';

          this.sidebar.removeAttribute('style');
          StickySidebar.removeClass(this.sidebar, this.options.stickyClass);
          this.sidebarInner.removeAttribute('style');
        } else {
          this._breakpoint = false;
        }
      }

      /**
       * Switchs between functions stack for each event type, if there's no 
       * event, it will re-initialize sticky sidebar.
       * @public
       */

    }, {
      key: 'updateSticky',
      value: function updateSticky() {
        var _this3 = this;

        var event = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        if (this._running) return;
        this._running = true;

        (function (eventType) {

          requestAnimationFrame(function () {
            switch (eventType) {
              // When browser is scrolling and re-calculate just dimensions
              // within scroll. 
              case 'scroll':
                _this3._calcDimensionsWithScroll();
                _this3.observeScrollDir();
                _this3.stickyPosition();
                break;

              // When browser is resizing or there's no event, observe width
              // breakpoint and re-calculate dimensions.
              case 'resize':
              default:
                _this3._widthBreakpoint();
                _this3.calcDimensions();
                _this3.stickyPosition(true);
                break;
            }
            _this3._running = false;
          });
        })(event.type);
      }

      /**
       * Set browser support features to the public property.
       * @private
       */

    }, {
      key: '_setSupportFeatures',
      value: function _setSupportFeatures() {
        var support = this.support;

        support.transform = StickySidebar.supportTransform();
        support.transform3d = StickySidebar.supportTransform(true);
      }

      /**
       * Get translate value, if the browser supports transfrom3d, it will adopt it.
       * and the same with translate. if browser doesn't support both return false.
       * @param {Number} y - Value of Y-axis.
       * @param {Number} x - Value of X-axis.
       * @param {Number} z - Value of Z-axis.
       * @return {String|False}
       */

    }, {
      key: '_getTranslate',
      value: function _getTranslate() {
        var y = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        var x = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var z = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

        if (this.support.transform3d) return 'translate3d(' + y + ', ' + x + ', ' + z + ')';else if (this.support.translate) return 'translate(' + y + ', ' + x + ')';else return false;
      }

      /**
       * Destroy sticky sidebar plugin.
       * @public
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        window.removeEventListener('resize', this);
        window.removeEventListener('scroll', this);

        this.sidebar.classList.remove(this.options.stickyClass);
        this.sidebar.style.minHeight = '';

        this.sidebar.removeEventListener('update' + EVENT_KEY, this);

        var styleReset = { inner: {}, outer: {} };

        styleReset.inner = { position: '', top: '', left: '', bottom: '', width: '', transform: '' };
        styleReset.outer = { height: '', position: '' };

        for (var key in styleReset.outer) {
          this.sidebar.style[key] = styleReset.outer[key];
        }for (var _key2 in styleReset.inner) {
          this.sidebarInner.style[_key2] = styleReset.inner[_key2];
        }if (this.options.resizeSensor && 'undefined' !== typeof ResizeSensor) {
          ResizeSensor.detach(this.sidebarInner, this.handleEvent);
          ResizeSensor.detach(this.container, this.handleEvent);
        }
      }

      /**
       * Detarmine if the browser supports CSS transfrom feature.
       * @function
       * @static
       * @param {Boolean} transform3d - Detect transform with translate3d.
       * @return {String}
       */

    }], [{
      key: 'supportTransform',
      value: function supportTransform(transform3d) {
        var result = false,
            property = transform3d ? 'perspective' : 'transform',
            upper = property.charAt(0).toUpperCase() + property.slice(1),
            prefixes = ['Webkit', 'Moz', 'O', 'ms'],
            support = document.createElement('support'),
            style = support.style;

        (property + ' ' + prefixes.join(upper + ' ') + upper).split(' ').forEach(function (property, i) {
          if (style[property] !== undefined) {
            result = property;
            return false;
          }
        });
        return result;
      }

      /**
       * Trigger custom event.
       * @static
       * @param {DOMObject} element - Target element on the DOM.
       * @param {String} eventName - Event name.
       * @param {Object} data - 
       */

    }, {
      key: 'eventTrigger',
      value: function eventTrigger(element, eventName, data) {
        try {
          var event = new CustomEvent(eventName, { detail: data });
        } catch (e) {
          var event = document.createEvent('CustomEvent');
          event.initCustomEvent(eventName, true, true, data);
        }
        element.dispatchEvent(event);
      }

      /**
       * Extend options object with defaults.
       * @function
       * @static
       */

    }, {
      key: 'extend',
      value: function extend(defaults, options) {
        var results = {};
        for (var key in defaults) {
          if ('undefined' !== typeof options[key]) results[key] = options[key];else results[key] = defaults[key];
        }
        return results;
      }

      /**
       * Get current coordinates left and top of specific element.
       * @static
       */

    }, {
      key: 'offsetRelative',
      value: function offsetRelative(element) {
        var result = { left: 0, top: 0 };
        do {
          var offsetTop = element.offsetTop;
          var offsetLeft = element.offsetLeft;

          if (!isNaN(offsetTop)) result.top += offsetTop;

          if (!isNaN(offsetLeft)) result.left += offsetLeft;
        } while (element = element.offsetParent);
        return result;
      }

      /**
       * Add specific class name to specific element.
       * @static 
       * @param {ObjectDOM} element 
       * @param {String} className 
       */

    }, {
      key: 'addClass',
      value: function addClass(element, className) {
        if (!StickySidebar.hasClass(element, className)) {
          if (element.classList) element.classList.add(className);else element.className += ' ' + className;
        }
      }

      /**
       * Remove specific class name to specific element
       * @static
       * @param {ObjectDOM} element 
       * @param {String} className 
       */

    }, {
      key: 'removeClass',
      value: function removeClass(element, className) {
        if (StickySidebar.hasClass(element, className)) {
          if (element.classList) element.classList.remove(className);else element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
      }

      /**
       * Detarmine weather the element has specific class name.
       * @static
       * @param {ObjectDOM} element 
       * @param {String} className 
       */

    }, {
      key: 'hasClass',
      value: function hasClass(element, className) {
        if (element.classList) return element.classList.contains(className);else return new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className);
      }
    }]);

    return StickySidebar;
  }();

  return StickySidebar;
}();

// Global
// -------------------------
window.StickySidebar = StickySidebar;

(function () {
  if ('undefined' === typeof window) return;

  var plugin = window.$ || window.jQuery || window.Zepto;
  var DATA_NAMESPACE = 'stickySidebar';

  // Make sure the site has jquery or zepto plugin.
  if (plugin) {
    /**
     * Sticky Sidebar Plugin Defintion.
     * @param {Object|String} - config
     */
    var _jQueryPlugin = function (config) {
      return this.each(function () {
        var $this = plugin(this),
            data = plugin(this).data(DATA_NAMESPACE);

        if (!data) {
          data = new StickySidebar(this, typeof config == 'object' && config);
          $this.data(DATA_NAMESPACE, data);
        }

        if ('string' === typeof config) {
          if (data[config] === undefined && ['destroy', 'updateSticky'].indexOf(config) === -1) throw new Error('No method named "' + config + '"');

          data[config]();
        }
      });
    };

    plugin.fn.stickySidebar = _jQueryPlugin;
    plugin.fn.stickySidebar.Constructor = StickySidebar;

    var old = plugin.fn.stickySidebar;

    /**
     * Sticky Sidebar No Conflict.
     */
    plugin.fn.stickySidebar.noConflict = function () {
      plugin.fn.stickySidebar = old;
      return this;
    };
  }
})();

})));

//# sourceMappingURL=jquery.sticky-sidebar.js.map

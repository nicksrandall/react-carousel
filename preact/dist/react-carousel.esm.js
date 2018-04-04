import React from 'preact';

function noop() {}

function unwrapArray(arg, defaultValue) {
  arg = Array.isArray(arg) ? arg[0] : arg;
  if (!arg && defaultValue) {
    return defaultValue;
  } else {
    return arg;
  }
}

function composeEventHandlers() {
  for (var _len = arguments.length, fns = Array(_len), _key = 0; _key < _len; _key++) {
    fns[_key] = arguments[_key];
  }

  return function (event) {
    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    fns.forEach(function (fn) {
      fn && fn.apply(undefined, [event].concat(args));
    });
  };
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};









var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};



var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};









var objectWithoutProperties = function (obj, keys) {
  var target = {};

  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var clock = (typeof performance === 'undefined' ? 'undefined' : _typeof(performance)) === 'object' && performance.now ? performance : Date;

var Carousel$1 = function (_React$Component) {
  inherits(Carousel, _React$Component);

  function Carousel(props) {
    classCallCheck(this, Carousel);

    var _this = possibleConstructorReturn(this, _React$Component.call(this, props));

    _this.calculateSizes = function () {
      _this.setState({
        windowWidth: _this._windowRef.offsetWidth,
        trackWidth: _this._windowRef.offsetWidth * 3
      });
    };

    _this.play = function () {
      if (_this.state.focused) {
        _this.timeout = setTimeout(function () {
          _this.goToSlide(_this.nextIndex(_this.state.currentIndex));
        }, _this.props.slideDuration);
      }
    };

    _this.pause = function () {
      clearTimeout(_this.timeout);
    };

    _this.resize = function () {
      if (_this.running) {
        return;
      }
      _this.running = true;
      window.requestAnimationFrame(function () {
        _this.calculateSizes();
        _this.running = false;
      });
    };

    _this.handleVisibilityChange = function () {
      _this.setState({ focused: !document.hidden }, function () {
        document.hidden ? _this.pause() : _this.props.autoPlay && _this.play();
      });
    };

    _this.keydown = function (e) {
      if (e.keyCode === 37) {
        // previous
        _this.goToSlide(_this.prevIndex(_this.state.currentIndex), true);
      }
      if (e.keyCode === 39) {
        // next
        _this.goToSlide(_this.nextIndex(_this.state.currentIndex), true);
      }
    };

    _this.commitUpdate = function () {
      _this.setState({
        finalPrevIndex: _this.state.prevIndex,
        finalCurrentIndex: _this.state.currentIndex,
        finalNextIndex: _this.state.nextIndex
      });
    };

    _this.goToSlide = function (index) {
      var jump = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      _this.pause();
      _this.now = clock.now();

      var transitionDirection = 1;
      if (index === _this.props.slideCount - 1) {
        if (_this.state.currentIndex === 0) {
          transitionDirection = 0;
        } else {
          transitionDirection = 2;
        }
      } else if (index === 0) {
        if (_this.state.currentIndex === _this.props.slideCount - 1) {
          transitionDirection = 2;
        } else {
          transitionDirection = 0;
        }
      } else {
        if (index > _this.state.currentIndex) {
          transitionDirection = 2;
        } else if (index < _this.state.currentIndex) {
          transitionDirection = 0;
        }
      }

      var animationMS = Math.abs(_this.state.windowWidth + _this.state.dragOffset - _this.state.windowWidth * transitionDirection) * _this.props.animationDuration / _this.state.windowWidth;

      if (_this.props.animationDuration <= 0) {
        _this.commitUpdate();
      }

      var prevIndex = _this.prevIndex(index);

      var nextIndex = _this.nextIndex(index);

      if (jump) {
        switch (transitionDirection) {
          case 0:
            _this.setState({ finalPrevIndex: index });
            break;
          case 2:
            _this.setState({ finalNextIndex: index });
            break;
        }
      }

      _this.setState({
        transitionDirection: transitionDirection,
        animationMS: animationMS,
        prevIndex: prevIndex,
        currentIndex: index,
        nextIndex: nextIndex
      }, function () {
        if (_this.props.autoPlay) {
          _this.play();
        }
      });
    };

    _this.prevIndex = function (index) {
      return index > 0 ? index - 1 : _this.props.slideCount - 1;
    };

    _this.nextIndex = function (index) {
      return index < _this.props.slideCount - 1 ? index + 1 : 0;
    };

    _this.getRootProps = function () {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var rest = objectWithoutProperties(_ref, []);

      return _extends({}, rest);
    };

    _this.windowRef = function (node) {
      return _this._windowRef = node;
    };

    _this.getWindowProps = function () {
      var _babelHelpers$extends;

      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var _ref2$refKey = _ref2.refKey,
          refKey = _ref2$refKey === undefined ? 'ref' : _ref2$refKey,
          rest = objectWithoutProperties(_ref2, ['refKey']);

      return _extends((_babelHelpers$extends = {}, _babelHelpers$extends[refKey] = _this.windowRef, _babelHelpers$extends), rest);
    };

    _this.trackRef = function (node) {
      return _this._trackRef = node;
    };

    _this.track_handleTransitionEnd = function () {
      _this.commitUpdate();
      _this.setState({ animationMS: 0, transitionDirection: 1 });
    };

    _this.getTrackProps = function () {
      var _babelHelpers$extends2;

      var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var _ref3$refKey = _ref3.refKey,
          refKey = _ref3$refKey === undefined ? 'ref' : _ref3$refKey,
          onTransitionEnd = _ref3.onTransitionEnd,
          style = _ref3.style,
          rest = objectWithoutProperties(_ref3, ['refKey', 'onTransitionEnd', 'style']);

      return _extends((_babelHelpers$extends2 = {}, _babelHelpers$extends2[refKey] = _this.trackRef, _babelHelpers$extends2.style = _extends({}, style, {
        width: _this.state.trackWidth,
        transition: _this.state.animationMS > 0 ? 'transform ' + (_this.state.transitionDirection === 1 ? _this.state.animationMS * 2 : _this.state.animationMS) + 'ms ' + (_this.state.transitionDirection === 1 ? 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'ease-out') : null,
        transform: 'translate3d(-' + (_this.state.windowWidth * _this.state.transitionDirection + _this.state.dragOffset) + 'px, 0px, 0px)'
      }), _babelHelpers$extends2.onTransitionEnd = composeEventHandlers(onTransitionEnd, _this.track_handleTransitionEnd), _babelHelpers$extends2), rest);
    };

    _this.slide_handleSwipeStart = function (e) {
      var posX = e.touches !== undefined ? e.touches[0].pageX : e.clientX;
      _this.setState({
        dragging: true,
        touchObject: {
          startX: posX,
          curX: posX
        }
      });
    };

    _this.slide_handleSwipeMove = function (e) {
      var touchObject = _this.state.touchObject;
      touchObject.curX = e.touches ? e.touches[0].pageX : e.clientX;
      var dragOffset = Math.round(Math.sqrt(Math.pow(touchObject.curX - touchObject.startX, 2))) * (touchObject.curX > touchObject.startX ? -1 : 1);
      _this.setState({ dragOffset: dragOffset, touchObject: touchObject });
    };

    _this.slide_handleSwipeEnd = function () {
      if (_this.state.dragOffset > (_this.state.windowWidth > 1280 ? 250 : 100)) {
        _this.goToSlide(_this.nextIndex(_this.state.currentIndex));
      } else if (_this.state.dragOffset < (_this.state.windowWidth > 1280 ? -250 : -100)) {
        _this.goToSlide(_this.prevIndex(_this.state.currentIndex));
      } else if (_this.state.dragOffset !== 0) {
        _this.goToSlide(_this.state.currentIndex);
      }
      _this.setState({
        dragging: false,
        dragOffset: 0,
        touchObject: {
          startX: 0,
          curX: 0
        }
      });
    };

    _this.getNextSlideProps = function () {
      var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var style = _ref4.style,
          rest = objectWithoutProperties(_ref4, ['style']);

      return _extends({
        key: _this.state.finalNextIndex,
        'data-index': _this.state.finalNextIndex,
        style: _extends({}, style, {
          width: _this.state.windowWidth
        })
      }, rest);
    };

    _this.getCurrentSlideProps = function () {
      var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var onMouseDown = _ref5.onMouseDown,
          onMouseMove = _ref5.onMouseMove,
          onMouseUp = _ref5.onMouseUp,
          onMouseLeave = _ref5.onMouseLeave,
          onTouchStart = _ref5.onTouchStart,
          onTouchMove = _ref5.onTouchMove,
          onTouchEnd = _ref5.onTouchEnd,
          onTouchCancel = _ref5.onTouchCancel,
          style = _ref5.style,
          rest = objectWithoutProperties(_ref5, ['onMouseDown', 'onMouseMove', 'onMouseUp', 'onMouseLeave', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel', 'style']);

      return _extends({
        key: _this.state.finalCurrentIndex,
        'data-index': _this.state.finalCurrentIndex,
        onTouchStart: composeEventHandlers(_this.slide_handleSwipeStart, onTouchStart),
        onTouchMove: composeEventHandlers(_this.state.dragging ? _this.slide_handleSwipeMove : null, onTouchMove),
        onTouchEnd: composeEventHandlers(_this.slide_handleSwipeEnd, onTouchEnd),
        onTouchCancel: composeEventHandlers(_this.state.dragging ? _this.slide_handleSwipeEnd : null, onTouchCancel),
        onMouseDown: composeEventHandlers(_this.slide_handleSwipeStart, onMouseDown),
        onMouseMove: composeEventHandlers(_this.state.dragging ? _this.slide_handleSwipeMove : null, onMouseMove),
        onMouseUp: composeEventHandlers(_this.slide_handleSwipeEnd, onMouseUp),
        onMouseLeave: composeEventHandlers(_this.state.dragging ? _this.slide_handleSwipeEnd : null, onMouseLeave),
        style: _extends({}, style, {
          width: _this.state.windowWidth
        })
      }, rest);
    };

    _this.getPrevSlideProps = function () {
      var _ref6 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var style = _ref6.style,
          rest = objectWithoutProperties(_ref6, ['style']);

      return _extends({
        key: _this.state.finalPrevIndex,
        'data-index': _this.state.finalPrevIndex,
        style: _extends({}, style, {
          width: _this.state.windowWidth
        })
      }, rest);
    };

    _this.prevButton_handleClick = function () {
      _this.goToSlide(_this.prevIndex(_this.state.currentIndex));
    };

    _this.getPrevButtonProps = function () {
      var _ref7 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var onClick = _ref7.onClick,
          rest = objectWithoutProperties(_ref7, ['onClick']);

      return _extends({
        type: 'button',
        'data-role': 'none',
        onClick: composeEventHandlers(onClick, _this.prevButton_handleClick)
      }, rest);
    };

    _this.nextButton_handleClick = function () {
      _this.goToSlide(_this.nextIndex(_this.state.currentIndex));
    };

    _this.getNextButtonProps = function () {
      var _ref8 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var onClick = _ref8.onClick,
          rest = objectWithoutProperties(_ref8, ['onClick']);

      return _extends({
        type: 'button',
        'data-role': 'none',
        onClick: composeEventHandlers(onClick, _this.nextButton_handleClick)
      }, rest);
    };

    _this.getIndicatorListProps = function () {
      var _ref9 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var rest = objectWithoutProperties(_ref9, []);

      return _extends({}, rest);
    };

    _this.indicator_makeHandleClick = function (idx) {
      return function () {
        _this.goToSlide(idx, true);
      };
    };

    _this.getIndicatorProps = function () {
      var _ref10 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var onClick = _ref10.onClick,
          index = _ref10.index,
          rest = objectWithoutProperties(_ref10, ['onClick', 'index']);

      return _extends({
        tabindex: index === _this.state.currentIndex ? '-1' : null,
        onClick: composeEventHandlers(onClick, _this.indicator_makeHandleClick(index))
      }, rest);
    };

    _this.state = {
      focused: true,
      prevIndex: _this.props.slideCount - 1,
      currentIndex: 0,
      nextIndex: 1,
      finalPrevIndex: _this.props.slideCount - 1,
      finalCurrentIndex: 0,
      finalNextIndex: 1,
      windowWidth: 0,
      trackWidth: 0,
      dragOffset: 0,
      transitionDirection: 1
    };
    _this.running = false;
    return _this;
  }

  Carousel.prototype.componentDidMount = function componentDidMount() {
    this.calculateSizes();
    window.addEventListener('resize', this.resize, false);
    document.addEventListener('visibilitychange', this.handleVisibilityChange, false);
    document.addEventListener('keydown', this.keydown, false);

    if (this.props.autoPlay) {
      this.now = clock.now();
      this.play();
    }
  };

  Carousel.prototype.componentWillUnmount = function componentWillUnmount() {
    window.removeEventListener('resize', this.resize, false);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange, false);
    document.removeEventListener('keydown', this.keydown, false);
  };

  Carousel.prototype.getStateAndHelpers = function getStateAndHelpers() {
    var getRootProps = this.getRootProps,
        getWindowProps = this.getWindowProps,
        getTrackProps = this.getTrackProps,
        getPrevSlideProps = this.getPrevSlideProps,
        getCurrentSlideProps = this.getCurrentSlideProps,
        getNextSlideProps = this.getNextSlideProps,
        getPrevButtonProps = this.getPrevButtonProps,
        getNextButtonProps = this.getNextButtonProps,
        getIndicatorListProps = this.getIndicatorListProps,
        getIndicatorProps = this.getIndicatorProps,
        goToSlide = this.goToSlide,
        nextIndex = this.nextIndex,
        prevIndex = this.prevIndex;

    return {
      // props
      getRootProps: getRootProps,
      getWindowProps: getWindowProps,
      getTrackProps: getTrackProps,
      getPrevSlideProps: getPrevSlideProps,
      getCurrentSlideProps: getCurrentSlideProps,
      getNextSlideProps: getNextSlideProps,
      getPrevButtonProps: getPrevButtonProps,
      getNextButtonProps: getNextButtonProps,
      getIndicatorListProps: getIndicatorListProps,
      getIndicatorProps: getIndicatorProps,

      // fnunctional helpers
      goToSlide: goToSlide,
      getNextIndex: nextIndex,
      getPrevIndex: prevIndex,

      // state helpers
      dragOffset: this.state.dragOffset,
      slideCount: this.props.slideCount,
      finalPrevIndex: this.state.finalPrevIndex,
      finalCurrentIndex: this.state.finalCurrentIndex,
      finalNextIndex: this.state.finalNextIndex,
      prevIndex: this.state.prevIndex,
      currentIndex: this.state.currentIndex,
      nextIndex: this.state.nextIndex,

      // can be used by indicators to show progress
      startTime: this.now
    };
  };

  Carousel.prototype.render = function render() {
    var children = unwrapArray(this.props.render || this.props.children, noop);
    var element = unwrapArray(children(this.getStateAndHelpers()));
    if (!element) {
      return null;
    }
    return element;
  };

  return Carousel;
}(React.Component);

Carousel$1.defaultProps = {
  animationDuration: 250,
  slideDuration: 0,
  calculateWidth: function calculateWidth(context) {
    return context._windowRef.offsetWidth;
  },
  dynamicSizes: false,
  autoPlay: true
};

Carousel$1.default = Carousel$1;

export default Carousel$1;

import React from 'react'
import PropTypes from 'prop-types'

import {unwrapArray, noop, composeEventHandlers} from './utils'

class Carousel extends React.Component {
  static propTypes = {
    children: PropTypes.func,
    render: PropTypes.func,
    animationDuration: PropTypes.number,
    calculateWidth: PropTypes.func,
    dynamicSizes: PropTypes.bool,
    slideDuration: PropTypes.number,
    slideCount: PropTypes.number.isRequired,
    autoPlay: PropTypes.bool,
  }
  static defaultProps = {
    animationDuration: 250,
    slideDuration: 0,
    calculateWidth: context => context._windowRef.offsetWidth,
    dynamicSizes: false,
    autoPlay: true,
  }
  constructor(props) {
    super(props)
    this.state = {
      focused: true,
      prevIndex: this.props.slideCount - 1,
      currentIndex: 0,
      nextIndex: 1,
      finalPrevIndex: this.props.slideCount - 1,
      finalCurrentIndex: 0,
      finalNextIndex: 1,
      windowWidth: 0,
      trackWidth: 0,
      dragOffset: 0,
      transitionDirection: 1,
    }
    this.running = false
  }
  calculateSizes = () => {
    this.setState({
      windowWidth: this._windowRef.offsetWidth,
      trackWidth: this._windowRef.offsetWidth * 3,
    })
  }
  componentDidMount() {
    this.calculateSizes()
    window.addEventListener('resize', this.resize, false)
    document.addEventListener(
      'visibilitychange',
      this.handleVisibilityChange,
      false,
    )
    document.addEventListener('keydown', this.keydown, false)

    if (this.props.autoPlay) {
      this.play()
    }
  }
  play = () => {
    if (this.state.focused) {
      this.timeout = setTimeout(() => {
        this.goToSlide(this.nextIndex(this.state.currentIndex))
      }, this.props.slideDuration)
    }
  }
  pause = () => {
    clearTimeout(this.timeout)
  }
  resize = () => {
    if (this.running) {
      return
    }
    this.running = true
    window.requestAnimationFrame(() => {
      this.calculateSizes()
      this.running = false
    })
  }
  handleVisibilityChange = () => {
    this.setState({focused: !document.hidden}, () => {
      document.hidden ? this.pause() : this.props.autoPlay && this.play()
    })
  }
  keydown = e => {
    if (e.keyCode === 37) {
      // previous
      this.goToSlide(this.prevIndex(this.state.currentIndex), true)
    }
    if (e.keyCode === 39) {
      // next
      this.goToSlide(this.nextIndex(this.state.currentIndex), true)
    }
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resize, false)
    document.removeEventListener(
      'visibilitychange',
      this.handleVisibilityChange,
      false,
    )
    document.removeEventListener('keydown', this.keydown, false)
  }
  commitUpdate = () => {
    this.setState({
      finalPrevIndex: this.state.prevIndex,
      finalCurrentIndex: this.state.currentIndex,
      finalNextIndex: this.state.nextIndex,
    })
  }
  goToSlide = (index, jump = false) => {
    this.pause()

    let transitionDirection = 1
    if (
      index > this.state.currentIndex ||
      (index === 0 && this.state.currentIndex === this.props.slideCount - 1)
    ) {
      transitionDirection = 2
    } else if (
      index < this.state.currentIndex ||
      (this.state.currentIndex === 0 && index === this.props.slideCount - 1)
    ) {
      transitionDirection = 0
    }

    let animationMS =
      Math.abs(
        this.state.windowWidth +
          this.state.dragOffset -
          this.state.windowWidth * transitionDirection,
      ) *
      this.props.animationDuration /
      this.state.windowWidth

    if (this.props.animationDuration <= 0) {
      this.commitUpdate()
    }

    let prevIndex = this.prevIndex(index)
    let currentIndex = index
    let nextIndex = this.nextIndex(index)

    if (jump) {
      switch (transitionDirection) {
        case 0:
          this.setState({finalPrevIndex: index})
          break
        case 2:
          this.setState({finalNextIndex: index})
          break
      }
    }

    this.setState(
      {
        transitionDirection,
        animationMS,
        prevIndex,
        currentIndex,
        nextIndex,
      },
      () => {
        if (this.props.autoPlay) {
          this.play()
        }
      },
    )
  }
  prevIndex = index => {
    return index > 0 ? index - 1 : this.props.slideCount - 1
  }
  nextIndex = index => {
    return index < this.props.slideCount - 1 ? index + 1 : 0
  }
  getRootProps = ({...rest} = {}) => {
    return {
      ...rest,
    }
  }
  windowRef = node => (this._windowRef = node)
  getWindowProps = ({refKey = 'ref', ...rest} = {}) => {
    return {
      [refKey]: this.windowRef,
      ...rest,
    }
  }
  trackRef = node => (this._trackRef = node)
  track_handleTransitionEnd = () => {
    this.commitUpdate()
    this.setState({animationMS: 0, transitionDirection: 1})
  }
  getTrackProps = ({refKey = 'ref', onTransitionEnd, style, ...rest} = {}) => {
    return {
      [refKey]: this.trackRef,
      style: {
        ...style,
        width: this.state.trackWidth,
        transition:
          this.state.animationMS > 0
            ? `transform ${this.state.animationMS}ms`
            : null,
        transform: `translate3d(-${this.state.windowWidth *
          this.state.transitionDirection +
          this.state.dragOffset}px, 0px, 0px)`,
      },
      onTransitionEnd: composeEventHandlers(
        onTransitionEnd,
        this.track_handleTransitionEnd,
      ),
      ...rest,
    }
  }
  slide_handleSwipeStart = e => {
    const posX = e.touches !== undefined ? e.touches[0].pageX : e.clientX
    this.setState({
      dragging: true,
      touchObject: {
        startX: posX,
        curX: posX,
      },
    })
  }
  slide_handleSwipeMove = e => {
    const touchObject = this.state.touchObject
    touchObject.curX = e.touches ? e.touches[0].pageX : e.clientX
    let dragOffset =
      Math.round(
        Math.sqrt(Math.pow(touchObject.curX - touchObject.startX, 2)),
      ) * (touchObject.curX > touchObject.startX ? -1 : 1)
    this.setState({dragOffset, touchObject})
  }
  slide_handleSwipeEnd = () => {
    if (this.state.dragOffset > 100) {
      this.goToSlide(this.nextIndex(this.state.currentIndex))
    } else if (this.state.dragOffset < -100) {
      this.goToSlide(this.prevIndex(this.state.currentIndex))
    }
    this.setState({
      dragging: false,
      dragOffset: 0,
      touchObject: {
        startX: 0,
        curX: 0,
      },
    })
  }
  getNextSlideProps = ({style, ...rest} = {}) => {
    return {
      key: this.state.finalNextIndex,
      'data-index': this.state.finalNextIndex,
      style: {
        ...style,
        width: this.state.windowWidth,
      },
      ...rest,
    }
  }
  getCurrentSlideProps = ({
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    style,
    ...rest
  } = {}) => {
    return {
      key: this.state.finalCurrentIndex,
      'data-index': this.state.finalCurrentIndex,
      onMouseDown: composeEventHandlers(
        onMouseDown,
        this.slide_handleSwipeStart,
      ),
      onMouseMove: composeEventHandlers(
        onMouseMove,
        this.state.dragging ? this.slide_handleSwipeMove : null,
      ),
      onMouseUp: composeEventHandlers(onMouseUp, this.slide_handleSwipeEnd),
      onMouseLeave: composeEventHandlers(
        onMouseLeave,
        this.state.dragging ? this.slide_handleSwipeEnd : null,
      ),
      style: {
        ...style,
        width: this.state.windowWidth,
      },
      ...rest,
    }
  }
  getPrevSlideProps = ({style, ...rest} = {}) => {
    return {
      key: this.state.finalPrevIndex,
      'data-index': this.state.finalPrevIndex,
      style: {
        ...style,
        width: this.state.windowWidth,
      },
      ...rest,
    }
  }
  prevButton_handleClick = () => {
    this.goToSlide(this.prevIndex(this.state.currentIndex))
  }
  getPrevButtonProps = ({onClick, ...rest} = {}) => {
    return {
      type: 'button',
      'data-role': 'none',
      onClick: composeEventHandlers(onClick, this.prevButton_handleClick),
      ...rest,
    }
  }
  nextButton_handleClick = () => {
    this.goToSlide(this.nextIndex(this.state.currentIndex))
  }
  getNextButtonProps = ({onClick, ...rest} = {}) => {
    return {
      type: 'button',
      'data-role': 'none',
      onClick: composeEventHandlers(onClick, this.nextButton_handleClick),
      ...rest,
    }
  }
  getIndicatorListProps = ({...rest} = {}) => {
    return {
      ...rest,
    }
  }
  indicator_makeHandleClick = idx => () => {
    this.goToSlide(idx, true)
  }
  getIndicatorProps = ({onClick, index, ...rest} = {}) => {
    return {
      tabindex: index === this.state.currentIndex ? '-1' : null,
      onClick: composeEventHandlers(
        onClick,
        this.indicator_makeHandleClick(index),
      ),
      ...rest,
    }
  }
  getStateAndHelpers() {
    const {
      getRootProps,
      getWindowProps,
      getTrackProps,
      getPrevSlideProps,
      getCurrentSlideProps,
      getNextSlideProps,
      getPrevButtonProps,
      getNextButtonProps,
      getIndicatorListProps,
      getIndicatorProps,

      goToSlide,
      nextIndex,
      prevIndex,
    } = this
    return {
      // props
      getRootProps,
      getWindowProps,
      getTrackProps,
      getPrevSlideProps,
      getCurrentSlideProps,
      getNextSlideProps,
      getPrevButtonProps,
      getNextButtonProps,
      getIndicatorListProps,
      getIndicatorProps,

      // fnunctional helpers
      goToSlide,
      nextIndex,
      prevIndex,

      // state helpers
      dragOffset: this.state.dragOffset,
      slideCount: this.props.slideCount,
      prevIndex: this.state.finalPrevIndex,
      currentIndex: this.state.finalCurrentIndex,
      nextIndex: this.state.finalNextIndex,
    }
  }
  render() {
    const children = unwrapArray(this.props.render || this.props.children, noop)
    const element = unwrapArray(children(this.getStateAndHelpers()))
    if (!element) {
      return null
    }
    return element
  }
}

export default Carousel

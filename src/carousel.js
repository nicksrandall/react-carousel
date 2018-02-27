import React from 'react'
import PropTypes from 'prop-types'

import {unwrapArray, noop, composeEventHandlers, isDOMElement} from './utils'

class Carousel extends React.Component {
  static propTypes = {
    children: PropTypes.func,
    render: PropTypes.func,
    animationDuration: PropTypes.number,
    slidesPerPage: PropTypes.number,
    calculateWidth: PropTypes.func,
    dynamicSizes: PropTypes.bool,
  }
  static defaultProps = {
    animationDuration: 250,
    slidesPerPage: 1,
    calculateWidth: context => context._windowRef.offsetWidth,
    dynamicSizes: false,
  }
  constructor(props) {
    super(props)
    this.state = {
      currentIndex: 0,
      countOfSlides: 0,
      windowWidth: 0,
      trackWidth: 0,
      dragOffset: 0,
    }
    this.running = false
    this.widths = []
  }
  calculateSizes = () => {
    let countOfSlides = 0
    let trackWidth = 0

    if (this.props.dynamicSizes) {
      if (isDOMElement(this._trackRef)) {
        Array.from(this._trackRef.childNodes).forEach(node => {
          let width = this.props.calculateWidth(this, node)
          this.widths.push(width)
          trackWidth += width
          countOfSlides++
        })
      } else {
        this._trackRef.props.children.forEach(child => {
          let width = this.props.calculateWidth(this, child)
          this.widths.push(width)
          trackWidth += width
          countOfSlides++
        })
      }
    } else {
      countOfSlides = isDOMElement(this._trackRef)
        ? this._trackRef.childNodes.length
        : this._trackRef.props.children.length
      trackWidth = this._windowRef.offsetWidth * countOfSlides
      for (let i = 0; i < countOfSlides; i++) {
        this.widths.push(this._windowRef.offsetWidth / this.props.slidesPerPage)
      }
    }
    this.setState({
      countOfSlides,
      windowWidth: this._windowRef.offsetWidth,
      trackWidth: trackWidth,
    })
  }
  componentDidMount() {
    this.calculateSizes()
    window.addEventListener('resize', this.resize, false)
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
  componentWillUnmount() {
    window.removeEventListener('resize', this.resize, false)
  }
  calculateOffset = index => {
    let offset = 0
    for (let i = 0; i < index; i++) {
      offset += this.widths[i]
    }
    return offset
  }
  goToSlide = (idx, animate = true) => {
    const index =
      Math.floor(idx / this.props.slidesPerPage) * this.props.slidesPerPage
    let animationMS = 0
    if (animate) {
      animationMS =
        Math.abs(
          this.calculateOffset(this.state.currentIndex) +
            this.state.dragOffset -
            this.calculateOffset(index),
        ) *
        this.props.animationDuration /
        this.state.windowWidth
    }

    this.setState({
      animationMS,
      currentIndex: index,
    })
  }
  prevSlide = (animate = true) => {
    const currentIndex =
      this.state.currentIndex > 0
        ? this.state.currentIndex - 1
        : this.state.countOfSlides - 1

    this.goToSlide(currentIndex, animate)
  }
  nextSlide = (animate = true) => {
    const currentIndex =
      this.state.currentIndex < this.state.countOfSlides - 1
        ? this.state.currentIndex + 1
        : 0
    this.goToSlide(currentIndex, animate)
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
    this.setState({animationMS: 0})
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
        transform: `translate3d(-${this.calculateOffset(
          this.state.currentIndex,
        ) + this.state.dragOffset}px, 0px, 0px)`,
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
    if (this.state.currentIndex === 0 && dragOffset < 0) {
      dragOffset = 0
    } else if (
      this.state.currentIndex === this.state.countOfSlides - 1 &&
      dragOffset > 0
    ) {
      dragOffset = 0
    }
    this.setState({dragOffset, touchObject})
  }
  slide_handleSwipeEnd = () => {
    if (this.state.dragOffset > 100) {
      this.nextSlide()
    } else if (this.state.dragOffset < -100) {
      this.prevSlide()
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
  getSlideProps = ({
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    index,
    style,
    ...rest
  } = {}) => {
    return {
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
        width: this.widths[index],
      },
      ...rest,
    }
  }
  prevButton_handleClick = () => {
    this.prevSlide()
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
    this.nextSlide()
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
    this.goToSlide(idx)
  }
  getIndicatorProps = ({onClick, index, ...rest} = {}) => {
    return {
      onClick: composeEventHandlers(onClick, this.indicator_makeHandleClick(index)),
      ...rest,
    }
  }
  getStateAndHelpers() {
    const {
      getRootProps,
      getWindowProps,
      getTrackProps,
      getSlideProps,
      getPrevButtonProps,
      getNextButtonProps,
      getIndicatorListProps,
      getIndicatorProps,
    } = this
    return {
      getRootProps,
      getWindowProps,
      getTrackProps,
      getSlideProps,
      getPrevButtonProps,
      getNextButtonProps,
      getIndicatorListProps,
      getIndicatorProps,

      currentIndex: this.state.currentIndex,
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

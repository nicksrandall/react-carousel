import React, {Component} from 'react'
import Carousel from '../../src'

import styled from 'react-emotion'

const ExampleContent = styled('div')`
  padding: 20px;
  margin: auto;
  width: 90%;
`

const Slider = styled('div')`
  margin: 30px auto 50px;
  position: relative;
  display: block;
  box-sizing: border-box;
  user-select: none;
  touch-action: pan-y;
`

const PrevButton = styled('button')`
  left: -30px;
  cursor: pointer;
  top: 50%;
  transform: translate(0, -50%);
  border: none;
  outline: 0;
  position: absolute;
`

const NextButton = styled('button')`
  right: -30px;
  cursor: pointer;
  top: 50%;
  transform: translate(0, -50%);
  border: none;
  outline: 0;
  position: absolute;
`

const Window = styled('div')`
  transform: translate3d(0,0,0);
  margin: 0;
  padding: 0;
  position: relative;
  display: block;
  overflow: hidden;
}
`

const Slide = styled('div')`
  outline: none;
  display: flex;
  float: left;
  height: 100%;
  min-height: 1px;
`

const Track = styled('div')`
  left: 0;
  right: 0;
  position: relative;
  display: block;
`

const Title = styled('h3')`
  font-size: 36px;
  margin: 10px;
  padding: 2%;
  width: 100%;
  position: relative;
  background: #0055bb;
  color: #fff;
  line-height: 100px;
  position: relative;
`

const Dots = styled('ul')`
  display: block;
  bottom: -25px;
  list-style: none;
  text-align: center;
  margin: 0 auto;
  width: 100%;
  position: absolute;
  padding: 0;
`

const Dot = styled('li')`
  position: relative;
  display: inline-block;
  height: 20px;
  width: 20px;
  margin: 0 5px;
  padding: 0;
  cursor: pointer;
`

class Examples extends Component {
  render() {
    return (
      <ExampleContent>
        <h2>Basic example</h2>
        <BasicCarousel />
      </ExampleContent>
    )
  }
}

function BasicCarousel() {
  return (
    <Carousel
      slideCount={3}
      slideDuration={3000}
      animationDuration={1500}
      render={({
        getRootProps,
        getPrevButtonProps,
        getWindowProps,
        getTrackProps,
        getNextSlideProps,
        getCurrentSlideProps,
        getPrevSlideProps,
        getNextButtonProps,
        getIndicatorListProps,
        getIndicatorProps,
        prevIndex,
        currentIndex,
        nextIndex,
        slideCount,
      }) => (
        <Slider {...getRootProps()}>
          <PrevButton {...getPrevButtonProps()}>Prev</PrevButton>
          <Window {...getWindowProps({refKey: 'innerRef'})}>
            <Track {...getTrackProps()}>
              <Slide {...getPrevSlideProps()}>
                <Title>{prevIndex}</Title>
                <Title>{prevIndex + 1}</Title>
                <Title>{prevIndex + 2}</Title>
              </Slide>
              <Slide {...getCurrentSlideProps()}>
                <Title>{currentIndex + 3}</Title>
                <Title>{currentIndex + 4}</Title>
                <Title>{currentIndex + 5}</Title>
              </Slide>
              <Slide {...getNextSlideProps()}>
                <Title>{nextIndex + 6}</Title>
                <Title>{nextIndex + 7}</Title>
                <Title>{nextIndex + 8}</Title>
              </Slide>
            </Track>
          </Window>
          <NextButton {...getNextButtonProps()}>Next</NextButton>
          <Dots {...getIndicatorListProps()}>
            {Array.from({length: slideCount}).map((_, idx) => (
              <Dot key={idx} {...getIndicatorProps({index: idx})}>{idx}</Dot>
            ))}
          </Dots>
        </Slider>
      )}
    />
  )
}

export default Examples

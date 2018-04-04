# react-carousel 🎠

a carousel component using render props.

## Usage

Docs coming soon! For now, use the stories folder to see some code examples.

```js
function BasicCarousel() {
  return (
    <Carousel
      slideCount={6}
      slideDuration={10000}
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
        <div {...getRootProps({className: 'slider'})}>
          <button {...getPrevButtonProps({className: 'prev-btn'})}>Prev</button>
          <div {...getWindowProps({refKey: 'innerRef', className: 'window'})}>
            <div {...getTrackProps({className: 'track'})}>
              <div {...getPrevSlideProps({className: 'slide'})}>
                <h2>{prevIndex}</h2>
              </div>
              <div {...getCurrentSlideProps({className: 'slide'})}>
                <h2>{currentIndex}</h2>
              </div>
              <div {...getNextSlideProps({className: 'slide'})}>
                <h2>{nextIndex}</h2>
              </div>
            </div>
          </div>
          <button {...getNextButtonProps({className: 'next-btn'})}>Next</button>
          <ul {...getIndicatorListProps({className: 'dots'})}>
            {Array.from({length: slideCount}).map((_, idx) => (
              <li
                key={idx}
                {...getIndicatorProps({index: idx, className: 'dot'})}
              >
                {idx}
              </li>
            ))}
          </ul>
        </div>
      )}
    />
  )
}
```

import {configure, storiesOf} from '@storybook/react'
import React from 'react'

import Basic from './examples/basic'
import Multi from './examples/mulit'

function loadStories() {
  // clear the console to make debugging experience better
  console.clear()

  storiesOf('Examples', module)
    .add('basic', () => <Basic />)
    .add('multi', () => <Multi />)
}

configure(loadStories, module)

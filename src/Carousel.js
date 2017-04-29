import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import './Carousel.css';

import data from './data.json';

import Slide from './Slide';
import scrollTo from './scrollToAnimate';
import throttle from 'lodash.throttle';
import classNames from 'classnames';

class Carousel extends Component {
  constructor(props) {
    super(props);
    this.handleLeftNav = this.handleLeftNav.bind(this);
    this.onResize = this.onResize.bind(this);
    this.throttleResize = throttle(this.onResize, 250);
    this.throttleScroll = throttle(this.onScroll, 250);
    this.animatingLeft = false;
    this.animatingRight = false;
    this.state = {
      numOfSlidesToScroll: 4,
      allTheWayLeft: false,
      allTheWayRight: false
    }
  }

  onScroll = (e) => {
    this.checkIfAllTheWayOver();
  }

  onResize() {
    this.checkNumOfSlidesToScroll();
  }

  checkIfAllTheWayOver() {
    console.log('context',this);
    const { carouselViewport } = this.refs;
    // if scroll left === 0
      // do not show button

    var allTheWayLeft = false;
    if ( carouselViewport.scrollLeft === 0 ) {
      allTheWayLeft = true;
    }

    // if scrollLeft + lengthOfViewPortOffsetWidth === real length of the viewport
    // 50 states each with with of 120. 50 * 120 ==== real length of viewport
      // do not show right

    var allTheWayRight = false;
    var amountScrolled = carouselViewport.scrollLeft;
    var viewportLength = carouselViewport.clientWidth;
    var totalWidthOfCarousel = carouselViewport.scrollWidth;
    console.log('scrolling', totalWidthOfCarousel, amountScrolled + viewportLength, amountScrolled );
    if ( amountScrolled + viewportLength === totalWidthOfCarousel ) {
      allTheWayRight = true;
    } 

    if ( this.state.allTheWayLeft !== allTheWayLeft || this.state.allTheWayRight !== allTheWayRight ) {      
      this.setState({
        allTheWayLeft,
        allTheWayRight
      })
    }
  }

  componentDidMount() {
    this.checkNumOfSlidesToScroll();
    this.checkIfAllTheWayOver();
    window.addEventListener('resize', this.throttleResize);
    window.addEventListener('keydown', this.onKeydown)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.throttleResize);
    window.removeEventListener('keydown', this.onKeydown)
  }

  onKeydown = (e) => {
    console.log(e.keyCode);
    const { keyCode } = e;
    var leftArrow = keyCode === 37;
    var rightArrow = keyCode === 39;
    var animatingRight = this.animatingRight;
    if ( leftArrow && !this.state.allTheWayLeft ) {
      if ( !this.animatingLeft ) {
        this.animatingLeft = true;
        this.handleLeftNav().then(()=>{
          this.animatingLeft = false;
        });
      }
    } else if ( rightArrow && !this.state.allTheWayRight ) {
      if ( !this.animatingRight ) {
        this.animatingRight = true;
        this.handleRightNav().then(()=>{
          this.animatingRight = false;
        });
      }
    }

  }

  checkNumOfSlidesToScroll() {
    var numOfSlidesToScroll;
    if ( window.innerWidth <= 900 ) {
      numOfSlidesToScroll = 'full';
    } else {
      numOfSlidesToScroll = 4;
    }
    if ( this.state.numOfSlidesToScroll !== numOfSlidesToScroll ) {
      console.log('in here', numOfSlidesToScroll);   
      this.setState({
        numOfSlidesToScroll
      })
    }
  }


  widthAndTimeToScroll() {
    const { carouselViewport } = this.refs;
    var numOfSlidesToScroll = this.state.numOfSlidesToScroll;
    if ( numOfSlidesToScroll === 'full') {
      return {
        widthToScroll: carouselViewport.offsetWidth,
        timeToScroll: 400
      }
    } else {
      // var widthOfSlide = document.querySelector('.slide').offsetWidth;
      // console.log('WHAT IS HERE', this.slide, findDOMNode(this.slide));
      var widthOfSlide = findDOMNode(this.slide).offsetWidth;
      var timeToMoveOneSlide = 200;
      return {
        widthToScroll: numOfSlidesToScroll * widthOfSlide,
        timeToScroll: Math.min( (numOfSlidesToScroll * timeToMoveOneSlide), 400 )
      }
    }
  }

  handleLeftNav(e) {
    const { carouselViewport } = this.refs;
    var { widthToScroll, timeToScroll } = this.widthAndTimeToScroll();
    var newPos = carouselViewport.scrollLeft - widthToScroll;
    return scrollTo({
      element: carouselViewport, 
      to: newPos, 
      duration: timeToScroll, 
      scrollDirection: 'scrollLeft',
      callback: this.checkIfAllTheWayOver,
      context: this
    });
  }
  handleRightNav = (e) => {
    const { carouselViewport } = this.refs;
    var { widthToScroll, timeToScroll } = this.widthAndTimeToScroll();
    var newPos = carouselViewport.scrollLeft + widthToScroll;    
    var promise = scrollTo({
      element: carouselViewport, 
      to: newPos, 
      duration: timeToScroll, 
      scrollDirection: 'scrollLeft',
      callback: this.checkIfAllTheWayOver,
      context: this
    });
    return promise;
  }
  renderSlides() {
    return data.map((state)=>{
      return (
        <Slide
          name={state.name}
          key={state.abbreviation}
          ref={compSlide=> this.slide = compSlide}
        />
      );
    })
  }
  render() {
    const {
      allTheWayLeft,
      allTheWayRight
    } = this.state;
    const navClasses = classNames({
      'carousel-nav': true
    })
    const leftNavClasses = classNames({
      'carousel-left-nav': true,
      'carousel-nav-disabled': allTheWayLeft
    }, navClasses);
    const rightNavClasses = classNames({
      'carousel-right-nav': true,
      'carousel-nav-disabled': allTheWayRight
    }, navClasses);

    return (
      <div className="carousel-container">
        <button 
          className={leftNavClasses}
          onClick={this.handleLeftNav}
          >
            &#60;
        </button>
        <div 
          className="carousel-viewport" 
          ref="carouselViewport"
          onScroll={this.throttleScroll}
          >
            {this.renderSlides()}
        </div>
        <button 
          className={rightNavClasses}
          onClick={this.handleRightNav}
          >
            &#62;
        </button>
      </div>
    );
  }
}

export default Carousel;
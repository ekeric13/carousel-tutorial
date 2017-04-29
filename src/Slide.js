import React, { Component } from 'react';
import './Slide.css';

class Slide extends Component {
  render() {
    const {
      name
    } = this.props;
    return(
      <div className="slide">{name}</div>
    );
  }
}

export default Slide;
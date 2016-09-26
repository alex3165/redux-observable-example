import React, { Component } from 'react';

export default class Main extends Component {
  render() {
    const { onChangeAddress } = this.props;

    return (
      <div>
        <input onChange={onChangeAddress} placeholder="Enter an address"/>
      </div>
    );
  }
}
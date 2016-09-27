import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { FETCH_LOCATION, FETCH_VENUE, SELECT_LOCATION } from './constants';

const fetchLocations = query => ({
  type: FETCH_LOCATION,
  payload: query
});

const fetchVenues = ll => ({
  type: FETCH_VENUE,
  payload: ll
});

const selectLocation = locationId => ({
  type: SELECT_LOCATION,
  payload: locationId
});

class Main extends Component {
  onChangeAddress = evt => this.props.fetchLoc(evt.target.value)

  render() {
    const { selectLoc, locations, venues, selectedId } = this.props;

    return (
      <div>
        <input onChange={this.onChangeAddress} placeholder="Enter an address"/>
        <ul>
          {
            locations.map((loc, key) =>
              <li
                key={key}
                style={{
                  backgroundColor: selectedId === key ? 'blue' : 'white',
                  color: selectedId === key ? 'white' : 'black'
                }}
                onClick={selectLoc.bind(this, loc.get('id'))}>
                { loc.get('place_name') }
              </li>
            ).toArray()
          }
        </ul>
        <div>
          <h1>VENUES</h1>
          <ul>
            {
              venues.map((venue, key) =>
                <li key={key}>{ venue.get('name') }</li>
              ).toArray()
            }
          </ul>
        </div>
      </div>
    );
  }
}

export default connect(
  (state, props) => ({
    locations: state.get('locations'),
    venues: state.get('venues'),
    selectedId: state.get('selectedLocationId')
  }),
  dispatch => ({
    selectLoc: bindActionCreators(selectLocation, dispatch),
    fetchLoc: bindActionCreators(fetchLocations, dispatch),
    fetchV: bindActionCreators(fetchVenues, dispatch)
  })
)(Main)
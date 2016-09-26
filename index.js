import 'rxjs';
import React from 'react';
import { render } from "react-dom";
import { createEpicMiddleware, combineEpics } from 'redux-observable';
import { createStore, applyMiddleware, bindActionCreators } from 'redux';
import { Observable } from 'rxjs/Observable';
import { getLocations, getVenues } from './request';
import Immutable, { fromJS } from 'immutable';
import Main from './main';

// Default values / constants
const [ ADD_LOCATION, ADD_VENUE, SELECT_LOCATION, FETCH_LOCATION, FETCH_VENUE ] = ['ADD_LOCATION', 'ADD_VENUE', 'SELECT_LOCATION', 'FETCH_LOCATION', 'FETCH_VENUE'];
const initialState = fromJS({
  locations: {},
  venues: {},
  selectedLocationId: undefined
});

// Actions
const fetchLocations = query => ({
  type: FETCH_LOCATION,
  payload: query
});

const fetchVenues = ll => ({
  type: FETCH_VENUE,
  payload: ll
})

const addLocations = locations => ({
  type: ADD_LOCATION,
  payload: locations
});

const selectLocation = locationId => ({
  type: SELECT_LOCATION,
  payload: locationId
});

const addVenues = venues => ({
  type: ADD_VENUE,
  payload: venues
});


// Epics
function locationsEpic(action$) {
  return action$
    .ofType(FETCH_LOCATION)
    .map(action => action.payload)
    .switchMap((query) =>
      getLocations(query)
        .map(addLocations)
    )
}

function venuesEpic(action$) {
  return action$
    .ofType(FETCH_VENUE)
    .map(action => action.payload)
    .switchMap(ll =>
      getVenues(ll)
        .map(addVenues)
    )
}

// Redux / Middleware config
const epicMiddleware = createEpicMiddleware(combineEpics(locationsEpic, venuesEpic));
const reducer = (state, action) => {
  const { type, payload } = action;

  switch(type) {
    case ADD_LOCATION:
      return state.update('locations', (locations) => (
        locations.merge(
          payload.reduce((acc, location) => acc.set(location.get('id'), location), new Map())
        )
      ));
    case SELECT_LOCATION:
      return state.set('selectedLocationId', payload);
    case ADD_VENUE:
      return state.update('venues', (venues) => (
        venues.merge(
          payload.reduce((acc, venue) => acc.set(venue.get('id'), venue), new Map())
        )
      ));
    default:
      return state;
  }
}

const store = createStore(
  reducer,
  initialState,
  applyMiddleware(epicMiddleware)
);
const { dispatch } = store;
const selectLoc = bindActionCreators(selectLocation, dispatch);
const fetchLoc = bindActionCreators(fetchLocations, dispatch);
const fetchV = bindActionCreators(fetchVenues, dispatch);

// Automated user actions !!

// // Emulate user actions
const storeObs = Observable.from(store)
  .filter(state => state.get('locations').size >= 1)
  .take(1)
  .map(state => state.get('locations'))
  .do(locations => {
    selectLoc(locations.first().get('id'));
  })
  .withLatestFrom(
    Observable
      .from(store)
      .map(state => state.get('selectedLocationId'))
  )
  .do(([ locations, selectedLocationId ]) => {
    fetchV(locations.getIn([ selectedLocationId, 'center' ]).reverse().join(','))
  })
  .subscribe();

Observable.from(store).do(state => {
  console.log(state.toJS());
}).subscribe();


// User UI
const onChangeAddress = evt => {
  const { value } = evt.target;

  if (value.length > 6) {
    fetchLoc(value);
  }
};

render(<Main onChangeAddress={onChangeAddress}/>, document.getElementById('content'));

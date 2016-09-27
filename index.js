import 'rxjs';
import React from 'react';
import { render } from "react-dom";
import { createEpicMiddleware, combineEpics } from 'redux-observable';
import { createStore, applyMiddleware, bindActionCreators } from 'redux';
import { Observable } from 'rxjs/Observable';
import { getLocations, getVenues } from './request';
import { fromJS, Map } from 'immutable';
import Main from './main';
import { Provider } from 'react-redux';
import { ADD_LOCATION, ADD_VENUE, SET_LOCATION, FETCH_LOCATION, FETCH_VENUE, SELECT_LOCATION } from './constants';
// Default values / constants
// const [ ADD_LOCATION, ADD_VENUE, SELECT_LOCATION, FETCH_LOCATION, FETCH_VENUE ] = ['ADD_LOCATION', 'ADD_VENUE', 'SELECT_LOCATION', 'FETCH_LOCATION', 'FETCH_VENUE'];
const initialState = fromJS({
  locations: {},
  venues: {},
  selectedLocationId: undefined
});

// Actions
const addLocations = locations => ({
  type: ADD_LOCATION,
  payload: locations
});

const addVenues = venues => ({
  type: ADD_VENUE,
  payload: venues
});

const setLocation = id => ({
  type: SET_LOCATION,
  payload: id
});

// Utility
const defaultConfig = { retryCount: 2, delay: 500 };

function retry(operation, { retryCount, delay } = defaultConfig) {
  return Observable
    .interval(delay)
    .flatMap(() =>
      operation
    )
    .retry(retryCount)
    .take(1)
}

// Epics
const locationsEpic = (action$) => {
  return action$
    .ofType(FETCH_LOCATION)
    .map(action => action.payload)
    .filter(query => query.length > 2)
    .switchMap((query) =>
      getLocations(query)
        .map(addLocations)
    )
}

const selectLocations = state => state.get('locations')

const venuesEpic = (action$, store) => action$
  .ofType(SELECT_LOCATION)
  .map(({ payload }) => selectLocations(store.getState()).get(payload))
  .switchMap(location => Observable
    .merge(
      Observable.of(setLocation(location.get('id'))),
      retry(
        getVenues(
          location.get('center').reverse().join(',')
        ).map(addVenues)
      )
      .catch(() => {
        console.error("Couldn't complete your request");
      })
    )
  );

// Redux / Middleware config
const epicMiddleware = createEpicMiddleware(combineEpics(locationsEpic, venuesEpic));
const reducer = (state, action) => {
  const { type, payload } = action;

  switch(type) {
    case ADD_LOCATION:
      return state
        .set('locations', payload.reduce((acc, location) => acc.set(location.get('id'), location), new Map()))
        .set('venues', new Map());
    case SET_LOCATION:
      return state.set('selectedLocationId', payload);
    case ADD_VENUE:
      return state.set('venues',
        payload.reduce((acc, venue) => acc.set(venue.get('id'), venue), new Map())
      );
    default:
      return state;
  }
}

const store = createStore(
  reducer,
  initialState,
  applyMiddleware(epicMiddleware)
);

Observable
  .from(store)
  .do(state => console.log(state))
  .subscribe();

// User UI
const content = (
  <Provider store={store}>
    <Main/>
  </Provider>
)

render(
  content,
  document.getElementById('content')
);

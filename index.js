import { createEpicMiddleware, combineEpics } from 'redux-observable';
import { createStore, applyMiddleware } from 'redux';
import 'rxjs';
import { ajax } from 'rxjs/observable/dom/ajax';
import fetch from 'isomorphic-fetch';
import { fromJS } from 'immutable';

// Default values / constants
const [ ADD_LOCATION, ADD_VENUE, SELECT_LOCATION, FETCH_LOCATION, FETCH_VENUE ] = ['ADD_LOCATION', 'ADD_VENUE', 'SELECT_LOCATION', 'FETCH_LOCATION', 'FETCH_VENUE'];
const initialState = fromJS({
  locations: {},
  venues: {},
  selectedLocationId: undefined
});

// Actions
const fetchLocations = (query) => ({
  type: FETCH_LOCATION,
  payload: query
});

const fetchVenues = () => ({
  type: FETCH_VENUE
})

const addLocations = (locations) => ({
  type: ADD_LOCATION,
  payload: locations
});

const selectLocation = (locationId) => ({
  type: SELECT_LOCATION,
  payload: locationId
});

const addVenues = (venues) => ({
  type: ADD_VENUE,
  payload: venues
});


// Epics
function locationsEpic(action$) {
  return action$
}

function venuesEpic(action$) {
  return action$;
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

const { dispatch, subscribe, getState } = createStore(
  reducer,
  initialState,
  applyMiddleware(epicMiddleware)
)

subscribe(() => {
  const state = getState();
  console.log(state);
});

// dispatch(fetchLocations);


/*
 - Auto-complete (debouncing ...)
*/

// Requests
const getLocations = (postcode) => (
ajax
  .getJSON(`https://api.mapbox.com/geocoding/v5/mapbox.places/${postcode}.json?access_token=pk.eyJ1IjoiYWxleDMxNjUiLCJhIjoiYWZ2b0ctdyJ9.8hDqOD5GlLfBfIxjHaa0qQ`)
  .map(res => fromJS(res.features))
)

const getVenues = (ll) => (
ajax
  .getJSON(`https://api.foursquare.com/v2/venues/search`)
  .map(res => fromJS(res))
)
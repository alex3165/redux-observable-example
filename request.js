import { ajax } from 'rxjs/observable/dom/ajax';
import { fromJS } from 'immutable';

// import fetch from 'isomorphic-fetch';

// Requests
export const getLocations = postcode => (
ajax
  .getJSON(`https://api.mapbox.com/geocoding/v5/mapbox.places/${postcode}.json?access_token=pk.eyJ1IjoiYWxleDMxNjUiLCJhIjoiYWZ2b0ctdyJ9.8hDqOD5GlLfBfIxjHaa0qQ`)
  .map(res => fromJS(res.features))
)

export const getVenues = ll => (
ajax
  .getJSON(`http://localhost:8080/api/foursquareLocations/search-location?location=${ll}`)
  .map(res =>
    fromJS(res)
      .get('response')
      .first()
      .get('venues')
  )
)

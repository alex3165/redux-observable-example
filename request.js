import { ajax } from 'rxjs/observable/dom/ajax';
import { fromJS } from 'immutable';

// import fetch from 'isomorphic-fetch';

// Requests
export const getLocations = postcode => (
ajax
  .getJSON(`https://api.mapbox.com/geocoding/v5/mapbox.places/${postcode}.json?access_token=pk.eyJ1IjoiYWxleDMxNjUiLCJhIjoiYWZ2b0ctdyJ9.8hDqOD5GlLfBfIxjHaa0qQ`)
  .map(res => fromJS(res.features))
)

export const getVenues = (ll, query) => (
ajax
  .getJSON(`https://api.foursquare.com/v2/venues/search?ll=${ll}&client_id=ZWZL2ECVQUGANU4URFLSESP1U3YP3NMTJPJ1QN4U3HQH1WKR&client_secret=001FNYSHSPYL4V1I5XNCOWYELO3DEGVOAJVC10ZK0VPC3CX5&v=20160925`)
  .map(res => fromJS(res))
)

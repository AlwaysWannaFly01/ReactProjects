import {
    createStore,
    combineReducers,
    applyMiddleware
} from 'redux';
import reducers from './reducer';
import chunk from 'redux-chunk';

export default createStore(
    combineReducers(reducers), {},
    applyMiddleware(chunk)
);
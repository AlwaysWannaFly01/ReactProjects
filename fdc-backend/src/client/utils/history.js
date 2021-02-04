import { createMemoryHistory, createBrowserHistory } from 'history'
import isNode from 'detect-node'

export default (isNode ? createMemoryHistory() : createBrowserHistory())

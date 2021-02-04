import React, { Component } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'

import router from 'client/router'
import DatasourceManage from './DatasourceManage'

class BackconfigRoutes extends Component {
  render() {
    return (
      <Switch>
        <Route
          path={router.BACKCONFIG}
          exact
          render={() => <Redirect to={router.BACKCONFIG_DATA_SOURCE_MANAGE} />}
        />

        <Route
          path={router.BACKCONFIG_DATA_SOURCE_MANAGE}
          component={DatasourceManage}
        />
      </Switch>
    )
  }
}

export default BackconfigRoutes

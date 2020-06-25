import React, { Component } from "react";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import createHistory from "history/createBrowserHistory";
import Header from "./Header";
import Login from "./Login";
import Profile from "./Profile";
import Edit from "./Edit";
import error404 from "./404";
import Main from "./Main";
import "../scss/app.scss";

const history = createHistory();

const App = () => {
  return (
    <Router history={history}>
      <div className='app-container'>
        <Switch>
          <Route exact path='/login' component={Login} />
          <Route exact path='/edit'>
            <Header />
            <Edit />
          </Route>
          <Route exact path='/home'>
            <Header />
            <Main />
          </Route>
          <Route exact path='/'>
            <Header />
            <Main />
          </Route>
          <Route exact path='/:userId'>
            <Header />
            <Profile />
          </Route>
          <Route exact path='/*' component={error404} />
        </Switch>
      </div>
    </Router>
  );
};

export default App;

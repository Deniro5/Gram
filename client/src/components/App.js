import React, { Component } from 'react';
import { Router } from 'react-router';
import { Switch, Route } from 'react-router-dom';
import createHistory from 'history/createBrowserHistory';
import Header from './Header';  
import Login from './Login';  
import Footer from './Footer';
import Profile from './Profile';
import Edit from './Edit';
import error404 from './404'
import '../scss/app.scss';

const history = createHistory();



class App extends Component {
  render() {
    return (
      <Router history={history}>
      <div className="app-container">
        <Header/>
        <Switch>
          <Route exact path="/" component={Edit} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/home" component={Edit} />
          <Route exact path="/:userId" component={Profile} />
          <Route exact path="/*" component={error404} />
        </Switch>
        <Footer/>
      </div>
      </Router>
    );
  }
}

export default App;

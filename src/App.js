import React, { Component } from 'react';
import NavBar from './NavBar/NavBar';
import Streams from './Streams/Streams';
import Stream from './Stream/Stream';
import { Route, withRouter } from 'react-router-dom';
import Callback from './Callback';
import SecuredRoute from './SecuredRoute/SecuredRoute';
import auth0Client from './Auth.js'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkingSession: true,
    }
  }
  async componentDidMount() {
    if (this.props.location.pathname === '/callback') {
      this.setState({ checkingSession: false });
      return;
    }
    try {
      await auth0Client.silentAuth();
      this.forceUpdate();
    } catch (err) {
      if (err.error !== 'login_required') console.log(err.error);
    }
    this.setState({ checkingSession: false });
  }
  render() {
    return (
      <div>
        <NavBar />
        <Route exact path='/' component={Streams} />
        <Route path='/video/:id' component={Stream} />
        <Route exact path='/callback' component={Callback} />
      </div>
    );
  }
}

export default withRouter(App);
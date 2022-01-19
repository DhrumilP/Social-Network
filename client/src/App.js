import './App.css';
import { Fragment } from 'react';
import Navbar from './components/Navbar';
import Landing from './components/Landing';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
//redux
import { Provider } from 'react-redux';
import store from './store';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Fragment>
          <Navbar />
          <Route exact path='/' component={Landing} />
          <section className='container'>
            <Route exact path='/register' component={Register} />
            <Route exact path='/login' component={Login} />
          </section>
        </Fragment>
      </Router>
    </Provider>
  );
}

export default App;

import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom';

import './App.css';
import ListArtifactPage from './pages/list-artifact';

const App: React.FC = () => {
  return (
    <Router>
      <div id="app">
        <ul>
          <li>
            <Link to="/list-artifact">List Artifact</Link>
          </li>
          <li>
            <a href="https://github.com/geekdada/surgio" rel="noopener noreferrer" target="_blank">GitHub</a>
          </li>
        </ul>

        <Switch>
          <Route path="/list-artifact">
            <ListArtifactPage />
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

export default App;

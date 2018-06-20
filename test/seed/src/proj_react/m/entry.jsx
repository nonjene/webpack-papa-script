const React = require('react');

const ReactDOM = require('react-dom');
const { HashRouter: Router, Route } = require('react-router-dom');

const App = function(){
  return <div>ok</div>
};

const Root = React.createClass({
    render() {
        return <Router>
            <Route exact path="/" component={App}/>
        </Router>
    }
});

module.exports = function(){
    ReactDOM.render(<Root />, document.getElementById('container'));
};

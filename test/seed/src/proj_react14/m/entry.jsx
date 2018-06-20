const React = require('react14');

const ReactDOM = require('react-dom');
const { HashRouter: Router, Route } = require('react-router-dom');
const App = require('./App');
const Root = React.createClass({
    render() {
        return <Router>
            <Route exact path="/" component={App}/>
        </Router>
    }
});

export default function(){

    ReactDOM.render(<Root />, document.getElementById('container'));
};

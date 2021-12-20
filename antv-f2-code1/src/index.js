import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import vConsole from './utils/vconsole'

/*手机端启用调试工具*/
new vConsole();

ReactDOM.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>,
    document.getElementById('root')
);


import React, {Component} from 'react';
import axios from 'axios';

class App extends Component {
    getData = () => {
        axios.get(
            'http://localhost:3000/students'
        ).then(res => {
            console.log(res)
        }).catch(err => {
            console.log(err)
        })
    }

    render() {
        return (
            <div>
                <button onClick={this.getData}>获取学生数据</button>
            </div>
        );
    }
}

export default App;

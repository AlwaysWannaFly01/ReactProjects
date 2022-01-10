import React, {Component} from 'react';
import axios from 'axios';

class App extends Component {
    getData = () => {
        axios.get(
            'http://localhost:3000/api/students'
        ).then(res => {
            console.log(res)
        }).catch(err => {
            console.log(err)
        })
    }
    getData2 = () => {
        axios.get(
            'http://localhost:3000/api2/cars'
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
                <button onClick={this.getData2}>获取骑车数据</button>
            </div>
        );
    }
}

export default App;

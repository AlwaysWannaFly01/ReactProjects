import React, {Component, createContext} from 'react';
import './App.css';

const BatteryContext = createContext();
const OnlineContext = createContext();

class Leaf extends Component {
    render() {
        return (
            <BatteryContext.Consumer>
                {/*Consumer里面必须声明一个函数`*/}
                {
                    battery => (
                        <OnlineContext.Consumer>
                            {
                                /*布尔值这里可能会显示不出来,需要转成字符串*/
                                online => <h1>Battery:{battery}, Online: {String(online)}</h1>
                            }
                        </OnlineContext.Consumer>
                    )
                }
            </BatteryContext.Consumer>
        )
    }
}

class Middle extends Component {
    render() {
        return <Leaf/>
    }
}

class App extends Component {
    state = {
        battery: 60,
        online: false
    }

    render() {
        const {battery, online} = this.state
        return (
            <BatteryContext.Provider value={battery}>
                <OnlineContext.Provider value={online}>
                    <button type="button" onClick={
                        () => {
                            this.setState({
                                    battery: battery + 5
                                }
                            )
                        }
                    }>
                        加5
                    </button>
                    <button type="button" onClick={
                        () => {
                            this.setState({
                                    online: !online
                                }
                            )
                        }
                    }>
                        切换
                    </button>
                    <Middle/>
                </OnlineContext.Provider>
            </BatteryContext.Provider>
        )
    }


}

export default App;

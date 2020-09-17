import React, {Component, useState, useEffect} from 'react';
import './App.css';

class App2 extends Component {
    state = {
        count: 0,
        size: {
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
        }
    }

    onResize = () => {
        this.setState({
            size: {
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeight,
            }
        })
    }

    componentDidMount() {
        document.title = this.state.count;
        window.addEventListener('resize', this.onResize, false)
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onResize, false)
    }

    render() {
        const {count, size} = this.state
        return (
            <button
                type="button"
                onClick={() => {
                    this.setState({count: count + 1})
                }}>
                Click({count})
                size:{size.width} * {size.height}
            </button>
        )
    }
}


function App(props) {
    const [count, setCount] = useState(0);
    const [size, setSize] = useState({
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
    })

    const onResize = () => {
        setSize({
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
        })
    }
    useEffect(() => {
        console.log('count', count);
        /*第二个参数count改变,才会触发effect执行*/
    }, [count])

    useEffect(() => {
        document.title = count;
    })

    useEffect(() => {
        window.addEventListener('resize', onResize, false);
        return () => {
            window.removeEventListener('resize', onResize, false)
        }
    }, [])

    const onClick = () => {
        console.log('click')
    }

    useEffect(() => {
        document.querySelector('#size').addEventListener('click', onClick, false)
        return () => {
            document.querySelector('#size').removeEventListener('click', onClick, false)
        }
    })

    return (
        <div>
            <button
                type="button"
                onClick={() => {
                    setCount(count + 1)
                }}>
                Click({count})
                size:{size.width} * {size.height}
            </button>
            {
                count % 2 ?
                    <span id="size">size:{size.width} * {size.height}</span> :
                    <p id="size">size:{size.width} * {size.height}</p>
            }

        </div>

    )
}

export default App;

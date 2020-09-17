import React, {Component, useState, PureComponent, useMemo, memo, useCallback, useRef, useEffect} from 'react';
import './App.css';


// class Counter extends PureComponent {
//     render() {
//         const {props} = this;
//         return (
//             <h1>{props.count}</h1>
//         )
//
//     }
// }

function useCounter(count) {
    return (
        <h1>{count}</h1>
    )
}

function useCount(defaultCount) {
    const [count, setCount] = useState(defaultCount);
    let it = useRef();

    useEffect(() => {
        it.current = setInterval(() => {
            setCount(count => count + 1)
        }, 1000)
    }, [])

    useEffect(() => {
        if (count >= 10) {
            clearInterval(it.current)
        }
    })
    return [count, setCount]
}

function App(props) {
    const [count, setCount] = useCount(0);
    const Counter = useCounter(count)
    return (
        <div>
            <button
                type="button"
                onClick={() => {
                    setCount(count + 1)
                }}>
                Click({count})
            </button>
            {Counter}
        </div>
    )
}

export default App;

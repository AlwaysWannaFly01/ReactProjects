import React, {Component} from "react";
import F2 from "@antv/f2";

export default class BarChart extends Component {
    static defaultProps = {
        data: [
            {genre: 'Sports', sold: 275},
            {genre: 'Strategy', sold: 115},
            {genre: 'Action', sold: 120},
            {genre: 'Shooter', sold: 350},
            {genre: 'Other', sold: 150}
        ]
    };

    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(nextProps.data) !== JSON.stringify(this.props.data)) {
            this.chart.clear();
            this.initDraw(nextProps.data);
        }
    }

    componentDidMount() {
        console.log(this.props.data)
        this.initDraw(this.props.data);
    }

    initDraw = (data) => {
        const chart = new F2.Chart({
            id: "container",
            pixelRatio: window.devicePixelRatio,
        });
        this.chart = chart;
        chart.source(data);
        chart.interval()
            .position('genre*sold')
            .color('genre');
        chart.render();
    };

    render() {
        return (
            <div>
                <canvas id="container" width="320" height="280"></canvas>
            </div>
        );
    }
}

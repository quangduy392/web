<template>
    <div>
        <h5 v-line-clamp="1">{{ input.title }}</h5>
        <LineChart
            :data="dataChart"
            :height="200"
            :options="options"
            style="height: 200px;"
        ></LineChart>
    </div>
</template>
<script>
import LineChart from '../LineChart';
import _ from 'lodash';
import CONSTANTS from '@/constants';
export default {
    props: {
        input: ''
    },
    name: 'line-chart',
    components: {
        LineChart
    },
    data() {
        return {
            dataChart: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    display: false
                }
            }
        };
    },
    watch: {
        input(newValue) {
            this.loadData();
        }
    },
    mounted() {
        this.loadData();
    },
    methods: {
        async loadData() {
            let filteredVideoObjects = _.filter(this.input.videoObjects, obj =>
                this.input.ox.includes(obj.class)
            );
            const oy = this.input.oy;

            if (oy === 'color') {
                const temp = [];
                _.each(filteredVideoObjects, obj => {
                    _.each(obj.colors, color => {
                        obj.color = color;
                        temp.push(obj);
                    });
                });
                filteredVideoObjects = temp;
            }

            const dataSource = _.groupBy(filteredVideoObjects, function(item) {
                if (oy === 'time') return item.shortTime;
                else if (oy === 'color') return item.color;
                return item.video.vmsCameraId + ' ' + item.video.vmsId;
            });

            let labels = _.keys(dataSource);

            const datasets = [];

            _.each(this.input.items, item => {
                const countData = labels.map(label => {
                    const data = _.groupBy(
                        dataSource[label],
                        Array.isArray(this.input.ox) ? 'class' : this.input.ox
                    );
                    return data[item.field] ? data[item.field].length : 0;
                });
                const dataset = {
                    label: item.name,
                    data: countData,
                    backgroundColor: item.color,
                    borderColor: item.color,
                    fill: false
                };
                datasets.push(dataset);
            });
            if (oy === 'location') {
                labels = await Promise.all(
                    labels.map(label => {
                        const res = this.getCameraInfo({
                            vmsCameraId: label.split(' ')[0],
                            vmsId: label.split(' ')[1]
                        });
                        return label.includes('undefined')
                            ? 'Không xác định'
                            : res.length
                                ? res[0].name
                                : 'Không xác định';
                    })
                );
            } else if (oy === 'color') {
                labels = _.map(labels, color => CONSTANTS.COLOR_FILTERS[color].text);
            }
            this.dataChart = Object.assign({}, this.dataChart, {
                labels: labels,
                datasets: datasets
            });
        }
    }
};
</script>
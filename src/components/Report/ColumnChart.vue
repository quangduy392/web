<template>
    <div>
        <h5 v-line-clamp="1">{{ input.title }}</h5>
        <BarChart :data="dataChart" :options="options" :height="200" style="height: 200px;"></BarChart>
    </div>
</template>
<script>
import BarChart from '../BarChart';
import _ from 'lodash';
import { mapActions } from 'vuex';
import CONSTANTS from '@/constants';
export default {
    props: {
        input: Object
    },
    name: 'column-chart',
    components: {
        BarChart
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
                },
                scales: {
                    xAxes: [
                        {
                            stacked: this.input.stacked === undefined ? true : this.input.stacked,
                            maxBarThickness: '30',
                            minBarLength: 2
                        }
                    ],
                    yAxes: [
                        {
                            stacked: this.input.stacked === undefined ? true : this.input.stacked
                        }
                    ]
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
        ...mapActions({
            getCameraInfo: 'camera/getVmsCameraInfo'
        }),
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
                    fill: false,
                    borderColor: item.color,
                    type: item.type
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
                            : res.length ? res[0].name : 'Không xác định';
                    })
                );
            } else if (oy === 'color') {
                labels = _.map(labels, color => CONSTANTS.COLOR_FILTERS[color].text);
            }
            this.dataChart = Object.assign({}, this.dataChart, {
                labels: labels,
                datasets: datasets
            });
            console.log(this.dataChart);
        }
    }
};
</script>
<template>
    <div>
        <h5 v-line-clamp="1">{{$t('report.chartLateHistory')}}</h5>
        <BarChart
            :data="dataChart"
            :options="options"
            :height="reportBodyHeight"
            :style="{height: `${reportBodyHeight}px`}"
        ></BarChart>
    </div>
</template>
<script>
import BarChart from '../BarChart';
import _ from 'lodash';

export default {
    name: 'history-time-late-chart',
    props: {
        staffTime: {
            type: Object,
            default: {}
        },
        reportBodyHeight: {
            type: Number,
            default: 0
        }
    },
    components: {
        BarChart
    },
    data() {
        return {
            dataChart: {
                labels: [],
                datasets: []
            }
        };
    },
    computed: {
        options() {
            return {
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    display: false
                },
                scales: {
                    xAxes: [
                        {
                            stacked: true,
                            maxBarThickness: '30',
                            minBarLength: 2
                        }
                    ],
                    yAxes: [
                        {
                            stacked: true
                        }
                    ]
                },
                tooltips: {
                    callbacks: {
                        label: item => `${item.yLabel} ${this.$t('report.person')}`
                    }
                }
            };
        }
    },
    methods: {
        async getData() {
            const data = {
                labels: [],
                datasets: [
                    {
                        backgroundColor: '#FF3D00',
                        data: []
                    }
                ]
            };
            for (const label of _.keys(this.staffTime)) {
                data.labels.push(label);
                const totalTime = _.filter(this.staffTime[label], item => item.startTimeSec > 28800)
                    .length;
                data.datasets[0].data.push(totalTime);
            }
            this.dataChart = data;
        }
    },
    mounted() {
        this.getData();
    },
    watch: {
        staffTime() {
            this.getData();
        }
    }
};
</script>
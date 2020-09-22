<template>
    <div>
        <h5 v-line-clamp="1">{{$t('report.chartTimeHistory')}}</h5>
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
    name: 'history-time-in-company-chart',
    props: {
        staffTime: {
            type: Object,
            default: {}
        },
        reportBodyHeight: {
            type: Number,
            default: 0
        },
        startDate: {
            type: String,
            default: ''
        },
        endDate: {
            type: String,
            default: ''
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
                            maxBarThickness: '30',
                            minBarLength: 2
                        }
                    ]
                },
                tooltips: {
                    callbacks: {
                        label: item =>
                            `${Math.floor(item.yLabel)} ${this.$t('report.hour')} ${Math.floor(
                                (item.yLabel - Math.floor(item.yLabel)) * 60
                            )} ${this.$t('report.minute')}`
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
                        backgroundColor: '#008b00',
                        data: []
                    }
                ]
            };
            for (const label of _.keys(this.staffTime)) {
                data.labels.push(label);
                const totalTime =
                    _.sumBy(this.staffTime[label], 'workTimeSec') /
                    3600 /
                    this.staffTime[label].length;
                data.datasets[0].data.push(totalTime);
            }
            this.dataChart = data;
        }
    },
    watch: {
        staffTime() {
            this.getData();
        }
    }
};
</script>
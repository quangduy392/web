<template>
    <div>
        <h5 v-line-clamp="1">{{$t('report.chartAbsentHistory')}}</h5>
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
    name: 'history-absent-chart',
    props: {
        staffTime: {
            type: Object,
            default: {}
        },
        listProfile: {
            type: Array,
            default: []
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
                        backgroundColor: '#f87979',
                        data: []
                    }
                ]
            };

            for (const label of _.keys(this.staffTime)) {
                data.labels.push(label);
                const listName = this.staffTime[label].map(item => item.name);
                const count = _.xor(listName, this.listProfile).length;
                data.datasets[0].data.push(count);
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
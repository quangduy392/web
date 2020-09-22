<template>
    <div>
        <h5 v-line-clamp="1">{{$t('report.chartLate')}}</h5>
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
import { mapActions } from 'vuex';
import moment from 'moment-timezone';

export default {
    name: 'time-late-chart',
    props: {
        filterCondition: {
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
                        label: item =>
                            `${
                                item.datasetIndex === 0
                                    ? `${this.$t('report.lateAfter')} 8h:`
                                    : `${this.$t('report.lateAfter')} 8h30:`
                            } ${item.yLabel}%`
                    }
                }
            };
        }
    },
    methods: {
        ...mapActions({
            getLateReport: 'summaryReport/getLateReport'
        }),
        async getData() {
            const groups = await this.getLateReport({
                from: moment(this.filterCondition.startDate).format('YYYY-MM-DD'),
                to: moment(this.filterCondition.endDate).format('YYYY-MM-DD'),
                late1: '08:00:00',
                late2: '08:30:00'
            });
            const data = {
                labels: [],
                datasets: []
            };
            data.datasets.push(
                {
                    backgroundColor: '#FFD600',
                    data: []
                },
                {
                    backgroundColor: '#FF3D00',
                    data: []
                }
            );
            for (const group of groups) {
                data.labels.push(group.group);
                data.datasets[0].data.push(group.avgLate1Rate);
                data.datasets[1].data.push(group.avgLate2Rate);
            }
            this.dataChart = data;
        }
    },
    mounted() {
        this.getData();
    },
    watch: {
        'filterCondition.startDate'() {
            this.getData();
        },
        'filterCondition.endDate'() {
            this.getData();
        }
    }
};
</script>
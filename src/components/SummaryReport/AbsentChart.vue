<template>
    <div>
        <h5 v-line-clamp="1">{{$t('report.chartAbsent')}}</h5>
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
    name: 'absent-chart',
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
                        label: item => `${this.$t('report.absent')} ${item.yLabel.toFixed(0)}%`
                    }
                }
            };
        }
    },
    methods: {
        ...mapActions({
            getAbsentReport: 'summaryReport/getAbsentReport'
        }),
        async getData() {
            const groups = await this.getAbsentReport({
                from: moment(this.filterCondition.startDate).format('YYYY-MM-DD'),
                to: moment(this.filterCondition.endDate).format('YYYY-MM-DD')
            });
            const data = {
                labels: [],
                datasets: []
            };
            data.datasets.push({
                backgroundColor: '#f87979',
                data: []
            });
            for (const group of groups) {
                data.labels.push(group.group);
                data.datasets[0].data.push(group.avgAbsentRate);
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
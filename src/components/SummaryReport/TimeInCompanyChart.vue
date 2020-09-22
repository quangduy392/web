<template>
    <div>
        <h5 v-line-clamp="1">{{$t('report.chartTime')}}</h5>
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
// import _ from 'lodash';
export default {
    name: 'time-in-company-chart',
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
        ...mapActions({
            getTimeReport: 'summaryReport/getTimeReport'
        }),
        async getData() {
            const groups = await this.getTimeReport({
                from: moment(this.filterCondition.startDate).format('YYYY-MM-DD'),
                to: moment(this.filterCondition.endDate).format('YYYY-MM-DD')
            });
            const data = {
                labels: [],
                datasets: []
            };
            data.datasets.push({
                label: 'Thời gian',
                backgroundColor: '#008b00',
                data: []
            });
            for (const group of groups) {
                data.labels.push(group.group);
                data.datasets[0].data.push(group.avgWorkTimeSec ? group.avgWorkTimeSec / 3600 : 0);
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
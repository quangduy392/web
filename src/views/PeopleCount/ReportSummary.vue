<template>
    <div class="animated fadeIn h-100">
        <sub-header hideBreadcrumb>
            <template slot="sub-header-left">
                <b-navbar-nav class="d-flex flex-row">
                    <b-nav-item to="/people-count/report/summary" class="text-nowrap">{{
                        $t('alert.report.summary')
                    }}</b-nav-item>
                    <b-nav-item to="/people-count/report/detail" class="text-nowrap">{{
                        $t('alert.report.detail')
                    }}</b-nav-item>
                </b-navbar-nav>
            </template>
            <template slot="sub-header-middle"></template>
        </sub-header>

        <div class="page-content sub-header-page-content py-0 px-1">
            <div class="d-flex h-100">
                <div
                    class="pl-3 mr-1 h-100 overflow-y-auto flex-1 d-flex flex-column"
                    ref="reportBody"
                >
                    <b-row class="mr-0">
                        <b-col :cols="12" class="template-card">
                            <b-card>
                                <PeopleCountChart
                                    :reportBodyHeight="reportBodyHeight"
                                    :title="$t('report.chartCountPeople')"
                                    :dataChart="averageHourDataChart"
                                    :options="options"
                                />
                            </b-card>
                        </b-col>
                        <b-col :cols="12" class="template-card">
                            <b-card>
                                <ListPeopleCount
                                    :reportBodyHeight="reportBodyHeight"
                                    :fields="fieldsTime"
                                    :items="itemsTime"
                                />
                            </b-card>
                        </b-col>
                    </b-row>
                </div>
                <div class="case-detail_sidebar h-100">
                    <FilterSidebar @doFilter="doFilter" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import PeopleCountChart from '@/components/SummaryReport/PeopleCountChart';
import ListPeopleCount from '@/components/SummaryReport/ListPeopleCount';
import FilterSidebar from '@/components/PeopleCountFilterSidebar';
import _ from 'lodash';
import moment from 'moment-timezone';

export default {
    components: {
        PeopleCountChart,
        ListPeopleCount,
        FilterSidebar
    },
    data() {
        return {
            filterCondition: {},
            isFiltering: false,
            reportBodyHeight: 0,
            averageHourDataChart: { labels: [], datasets: [] },
            itemsTime: [],
            itemsDate: []
        };
    },
    methods: {
        ...mapActions({
            getStatisticSummaryReport: 'countPeople/getStatisticSummaryReport'
        }),
        doFilter(value) {
            if (_.isEqual(this.filterCondition, value)) return;
            this.filterCondition = value;
        },
        getReportData() {
            const endDate = moment(this.filterCondition.endDate)
                .add(1, 'days')
                .format('YYYY-MM-DD');
            const body = {
                from: this.filterCondition.startDate,
                to: endDate
            };
            if (this.filterCondition.zone !== 'all') body.zone = this.filterCondition.zone;
            this.getStatisticSummaryReport(body);
        },
        onWindowSizeChange(e) {
            this.updateReportHeight();
        },
        updateReportHeight() {
            this.reportBodyHeight = (this.$refs.reportBody.clientHeight - 105) / 2;
        },
        updateAverageHourDataChart() {
            const labels = [];
            const datasets = [
                {
                    barThickness: 20,
                    maxBarThickness: 30,
                    backgroundColor: '#4CAF50',
                    data: []
                },
                {
                    barThickness: 20,
                    maxBarThickness: 30,
                    backgroundColor: '#F44336',
                    data: []
                },
                {
                    barThickness: 20,
                    maxBarThickness: 30,
                    backgroundColor: '#FFD600',
                    data: []
                }
            ];
            const countDate = moment
                .duration(
                    moment(this.filterCondition.endDate).diff(
                        moment(this.filterCondition.startDate)
                    )
                )
                .asDays();
            if (this.filterCondition.time === 'hour') {
                const map = _.groupBy(this.statisticSummaryReport, 'hour');
                for (let i = 0; i < 24; i++) {
                    labels.push(i + 'h');
                    let comeIn = 0;
                    let comeOut = 0;
                    if (map[i]) {
                        for (const item of map[i]) {
                            if (item.comeIn) comeIn += item.comeIn;
                            if (item.comeOut) comeOut += item.comeOut;
                        }
                    }
                    datasets[0].data.push(Math.floor(comeIn / countDate));
                    datasets[1].data.push(Math.floor(comeOut / countDate));
                    datasets[2].data.push(Math.floor((comeIn + comeOut) / countDate));
                }
            } else {
                const map = _.groupBy(this.statisticSummaryReport, this.filterCondition.time);
                const listKeys = _.sortBy(_.keys(map), item => {
                    return moment(item, 'YYYY-MM-DD');
                });
                for (const date of listKeys) {
                    labels.push(date);
                    let comeIn = 0;
                    let comeOut = 0;
                    if (map[date]) {
                        for (const item of map[date]) {
                            if (item.comeIn) comeIn += item.comeIn;
                            if (item.comeOut) comeOut += item.comeOut;
                        }
                    }
                    datasets[0].data.push(comeIn);
                    datasets[1].data.push(comeOut);
                    datasets[2].data.push(comeIn + comeOut);
                }
            }

            this.averageHourDataChart = { labels, datasets };
        },
        updateListTime() {
            this.itemsTime = [];
            const map = _.groupBy(this.statisticSummaryReport, 'date');
            const listKeys = _.sortBy(_.keys(map), item => {
                return -moment(item, 'YYYY-MM-DD');
            });
            for (const date of listKeys) {
                let comeIn = 0;
                let comeOut = 0;
                if (map[date]) {
                    for (const item of map[date]) {
                        if (item.comeIn) comeIn += item.comeIn;
                        if (item.comeOut) comeOut += item.comeOut;
                    }
                }
                this.itemsTime.push({ date, comeIn, comeOut, sum: comeIn + comeOut });
            }
        }
    },
    created() {
        window.addEventListener('resize', this.onWindowSizeChange);
    },
    watch: {
        'filterCondition.startDate'() {
            this.getReportData();
        },
        'filterCondition.endDate'() {
            this.getReportData();
        },
        'filterCondition.zone'() {
            this.getReportData();
        },
        'filterCondition.time'() {
            this.updateAverageHourDataChart();
        },
        statisticSummaryReport() {
            this.updateAverageHourDataChart();
            this.updateListTime();
        }
    },
    computed: {
        ...mapState({
            statisticSummaryReport: state => state.countPeople.statisticSummaryReport
        }),
        fieldsTime() {
            return [
                {
                    key: 'date',
                    label: this.$t('report.date')
                },
                {
                    key: 'comeIn',
                    label: this.$t('report.comeIn'),
                    tdClass: 'txtComeIn'
                },
                {
                    key: 'comeOut',
                    label: this.$t('report.comeOut'),
                    tdClass: 'txtComeOut'
                },
                {
                    key: 'sum',
                    label: this.$t('report.sum'),
                    tdClass: 'txtSum'
                }
            ];
        },
        options() {
            return {
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    display: false
                },
                tooltips: {
                    callbacks: {
                        label: item => {
                            let type = '';
                            switch (item.datasetIndex) {
                                case 0:
                                    type = this.$t('report.comeIn');
                                    break;
                                case 1:
                                    type = this.$t('report.comeOut');
                                    break;
                                default:
                                    type = this.$t('report.sum');
                                    break;
                            }
                            return `${type} ${item.yLabel} ${this.$t('report.person')}`;
                        }
                    }
                }
            };
        }
    },
    mounted() {
        this.$nextTick(async () => {
            this.getReportData();
        });
        this.updateReportHeight();
    },
    destroyed() {
        window.removeEventListener('resize', this.onWindowSizeChange);
    }
};
</script>

<style scoped>
.card {
    background-color: #3d4247;
    margin-bottom: 5px;
    margin-left: 2.5px;
    margin-right: 2.5px;
    border: none;
    padding: 0px;
}
.card-body {
    padding: 5px 10px;
}
.template-card {
    padding-right: 0px;
    padding-left: 0px;
    margin-right: 0px;
}
</style>

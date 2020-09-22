<template>
    <div class="animated fadeIn h-100">
        <sub-header hideBreadcrumb>
            <template slot="sub-header-left">
                <b-navbar-nav class="d-flex flex-row">
                    <b-nav-item to="/welcome/report/summary" class="text-nowrap">{{
                        $t('attendanceCommon.report.summary')
                    }}</b-nav-item>
                    <b-nav-item to="/welcome/report/detail" class="text-nowrap">{{
                        $t('attendanceCommon.report.detail')
                    }}</b-nav-item>
                    <!-- <b-nav-item
                        to="/attendance/report/staff-report"
                        class="text-nowrap"
                    >{{ $t('attendanceCommon.report.employees') }}</b-nav-item>-->
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
                        <b-col :cols="4" class="template-card">
                            <b-card>
                                <TimeInCompanyChart
                                    :filterCondition="filterCondition"
                                    :reportBodyHeight="reportBodyHeight"
                                />
                            </b-card>
                        </b-col>
                        <b-col :cols="4" class="template-card">
                            <b-card>
                                <TimeLateChart
                                    :filterCondition="filterCondition"
                                    :reportBodyHeight="reportBodyHeight"
                                />
                            </b-card>
                        </b-col>
                        <b-col :cols="4" class="template-card">
                            <b-card>
                                <AbsentChart
                                    :filterCondition="filterCondition"
                                    :reportBodyHeight="reportBodyHeight"
                                />
                            </b-card>
                        </b-col>
                        <b-col :cols="6" class="template-card">
                            <b-card>
                                <ListLate :filterCondition="filterCondition" />
                            </b-card>
                        </b-col>
                        <b-col :cols="6" class="template-card">
                            <b-card>
                                <ListAbsent :filterCondition="filterCondition" />
                            </b-card>
                        </b-col>
                        <b-col :cols="4" class="template-card">
                            <b-card>
                                <HistoryTimeInCompanyChart
                                    :filterCondition="filterCondition"
                                    :staffTime="staffTime"
                                    :reportBodyHeight="reportBodyHeight"
                                    :startDate="filterCondition.startDate"
                                    :endDate="filterCondition.endDate"
                                />
                            </b-card>
                        </b-col>
                        <b-col :cols="4" class="template-card">
                            <b-card>
                                <HistoryLateChart
                                    :filterCondition="filterCondition"
                                    :staffTime="staffTime"
                                    :reportBodyHeight="reportBodyHeight"
                                    :startDate="filterCondition.startDate"
                                    :endDate="filterCondition.endDate"
                                />
                            </b-card>
                        </b-col>
                        <b-col :cols="4" class="template-card">
                            <b-card>
                                <HistoryAbsentChart
                                    :filterCondition="filterCondition"
                                    :staffTime="staffTime"
                                    :listProfile="listProfile"
                                    :reportBodyHeight="reportBodyHeight"
                                    :startDate="filterCondition.startDate"
                                    :endDate="filterCondition.endDate"
                                />
                            </b-card>
                        </b-col>
                    </b-row>
                </div>
                <div class="case-detail_sidebar h-100">
                    <report-filter-sidebar
                        @doFilter="doFilter"
                        :listGroup="listGroup"
                        :listProfile="allProfiles"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import TimeInCompanyChart from '@/components/SummaryReport/TimeInCompanyChart';
import TimeLateChart from '@/components/SummaryReport/TimeLateChart';
import AbsentChart from '@/components/SummaryReport/AbsentChart';
import ReportFilterSidebar from '@/components/SummaryReport/ReportFilterSidebar';
import ListLate from '@/components/SummaryReport/ListLate';
import ListAbsent from '@/components/SummaryReport/ListAbsent';
import HistoryAbsentChart from '@/components/SummaryReport/HistoryAbsentChart';
import HistoryLateChart from '@/components/SummaryReport/HistoryLateChart';
import HistoryTimeInCompanyChart from '@/components/SummaryReport/HistoryTimeInCompanyChart';
import _ from 'lodash';
import moment from 'moment-timezone';

export default {
    components: {
        TimeInCompanyChart,
        TimeLateChart,
        AbsentChart,
        ReportFilterSidebar,
        ListLate,
        ListAbsent,
        HistoryAbsentChart,
        HistoryLateChart,
        HistoryTimeInCompanyChart
    },
    data() {
        return {
            filterCondition: {},
            staffTime: {},
            isFiltering: false,
            listProfile: [],
            listGroup: [],
            reportBodyHeight: 0
        };
    },
    methods: {
        ...mapActions({
            getStaffTimeReport: 'summaryReport/getStaffTimeReport',
            getListProfile: 'profile/getList'
        }),
        doFilter(value) {
            this.filterCondition = _.cloneDeep(value);
        },
        getStaffTime() {
            if (this.isFiltering) return;
            this.isFiltering = true;
            setTimeout(async () => {
                const body = {
                    from: moment(this.filterCondition.startDate).format('YYYY-MM-DD'),
                    to: moment(this.filterCondition.endDate).format('YYYY-MM-DD')
                };
                if (this.filterCondition.typeSelected === 'profile') {
                    body.profileId = this.filterCondition.profileSelected.id;
                } else if (this.filterCondition.typeSelected === 'group') {
                    body.group = this.filterCondition.groupSelected;
                }
                const res = await this.getStaffTimeReport(body);
                for (const item of res) {
                    item.date = moment(item.date).format('DD/MM/YYYY');
                }
                this.staffTime = _.groupBy(res, 'date');

                const start = new Date(this.startDate);
                const end = new Date(this.endDate);
                let loop = new Date(start);
                while (loop <= end) {
                    const key = moment(loop).format('DD/MM/YYYY');
                    if (!this.staffTime[key]) this.staffTime[key] = [];
                    const newDate = loop.setDate(loop.getDate() + 1);
                    loop = new Date(newDate);
                }

                this.isFiltering = false;
            }, 100);
        },
        onWindowSizeChange(e) {
            this.updateReportHeight();
        },
        updateReportHeight() {
            this.reportBodyHeight = (this.$refs.reportBody.clientHeight - 331) / 2 - 44;
        },
        goTo(link) {
            this.$router.push(link);
        }
    },
    created() {
        window.addEventListener('resize', this.onWindowSizeChange);
    },
    watch: {
        'filterCondition.typeSelected'() {
            if (this.filterCondition.typeSelected === 'all') {
                this.getStaffTime();
                this.listProfile = this.allProfiles.map(item => item.name);
            }
        },
        'filterCondition.profileSelected'() {
            if (this.filterCondition.typeSelected === 'profile') {
                this.getStaffTime();
                this.listProfile = [this.filterCondition.profileSelected.name];
            }
        },
        'filterCondition.groupSelected'() {
            if (this.filterCondition.typeSelected === 'group') this.getStaffTime();
        },
        'filterCondition.startDate'() {
            this.getStaffTime();
        },
        'filterCondition.endDate'() {
            this.getStaffTime();
        },
        allProfiles() {
            this.listGroup = _.keys(_.groupBy(this.allProfiles, 'group'));
        }
    },
    computed: {
        ...mapState({
            allProfiles: state => state.profile.items
        })
    },
    mounted() {
        this.$nextTick(async () => {
            this.getListProfile();
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

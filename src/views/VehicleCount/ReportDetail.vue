<template>
    <div class="animated fadeIn h-100">
        <sub-header hideBreadcrumb>
            <template slot="sub-header-left">
                <b-navbar-nav class="d-flex flex-row">
                    <b-nav-item to="/vehicle-count/report/summary" class="text-nowrap">{{
                        $t('alert.report.summary')
                    }}</b-nav-item>
                    <b-nav-item to="/vehicle-count/report/detail" class="text-nowrap">{{
                        $t('alert.report.detail')
                    }}</b-nav-item>
                </b-navbar-nav>
            </template>
            <template slot="sub-header-middle"></template>
        </sub-header>

        <div class="page-content sub-header-page-content pb-0 p-4">
            <div class="mb-3">
                <div class="d-inline-block mr-3">
                    <div>{{ $t('report.selectStart') }}:</div>
                    <DateTimePicker
                        class="peopleCountInput"
                        @input="onChangeTimeStart"
                        v-model="paramFilter.start"
                    />
                </div>
                <div class="d-inline-block mr-3">
                    <div>{{ $t('report.selectEnd') }}:</div>
                    <DateTimePicker
                        class="peopleCountInput"
                        @input="onChangeTimeEnd"
                        v-model="paramFilter.end"
                    />
                </div>
                <div class="d-inline-block">
                    <div>{{ $t('peopleCount.manage.region') }}:</div>
                    <b-form-select
                        v-model="paramFilter.group"
                        class="mr-3 mx-input"
                        :options="zones"
                        value-field="name"
                        text-field="name"
                        style="border-radius: 0.25rem; height: 34px; margin-bottom: 3px;"
                        @change="onFilterGroup"
                    >
                        <template slot="first">
                            <option value>{{ $t('report.all') }}</option>
                        </template>
                    </b-form-select>
                </div>
            </div>
            <b-table
                v-if="!isShowLoading"
                bordered
                striped
                dark
                responsive
                :fields="fields"
                :items="statisticReport"
                :current-page="currentPage"
                :per-page="CONSTANTS.ITEM_PEOPLE_COUNT_PER_PAGE"
            >
                <template slot="index" slot-scope="data">
                    {{
                        (currentPage - 1) * CONSTANTS.ITEM_PEOPLE_COUNT_PER_PAGE + (data.index + 1)
                    }}
                </template>
                <template slot="createdAt" slot-scope="data">{{
                    data.item.createdAt | formatDateTime
                }}</template>
            </b-table>
            <div
                class="my-1"
                v-if="
                    !isShowLoading && statisticReport.length > CONSTANTS.ITEM_PEOPLE_COUNT_PER_PAGE
                "
            >
                <b-pagination
                    v-model="currentPage"
                    :total-rows="statisticReport.length"
                    :per-page="CONSTANTS.ITEM_PEOPLE_COUNT_PER_PAGE"
                    :hide-goto-end-buttons="true"
                    :prev-text="$t('common.prevPage')"
                    :next-text="$t('common.nextPage')"
                    class="my-0"
                    align="center"
                ></b-pagination>
            </div>
            <div
                v-if="isShowLoading"
                class="h-100 d-flex flex-column justify-content-center align-items-center"
            >
                <img src="/static/img/loader-green.gif" class="standalone-loading" />
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import CONSTANTS from '@/constants';
import moment from 'moment-timezone';
import DateTimePicker from '@/components/DateTimePicker';

export default {
    components: { DateTimePicker },
    mounted: function() {
        this.$nextTick(function() {
            this.getListZones();
            this.loadData();
        });
    },
    computed: {
        ...mapState({
            rawStatisticReport: state => state.countPeople.statisticReport,
            zones: state => state.zone.items
        }),
        fields() {
            return [
                {
                    thClass: 'text-center',
                    tdClass: 'text-center',
                    key: 'index',
                    label: '#'
                },
                {
                    key: 'createdAt',
                    label: this.$t('report.time')
                },
                {
                    key: 'name',
                    label: this.$t('peopleCount.manage.region')
                },
                {
                    class: 'text-center',
                    key: 'count',
                    label: this.$t('report.number')
                }
            ];
        }
    },
    data() {
        return {
            isShowLoading: true,
            statisticReport: [],
            CONSTANTS,
            currentPage: 1,
            paramFilter: {
                start: moment(),
                end: moment(),
                group: ''
            }
        };
    },
    methods: {
        ...mapActions({
            getStatisticReport: 'countPeople/getStatisticReport',
            getListZones: 'zone/getListZones'
        }),
        onFilterGroup() {
            this.statisticReport = this.rawStatisticReport.filter(
                item => !this.paramFilter.group || item.name === this.paramFilter.group
            );
        },
        onChangeTimeStart(e) {
            setTimeout(() => {
                if (this.isShowLoading) return;
                this.loadData();
            }, 100);
        },
        onChangeTimeEnd(e) {
            setTimeout(() => {
                if (this.isShowLoading) return;
                this.loadData();
            }, 100);
        },
        async loadData() {
            this.isShowLoading = true;
            await this.getStatisticReport({
                from: this.paramFilter.start,
                to: this.paramFilter.end
            });
            this.isShowLoading = false;
        }
    },
    watch: {
        rawStatisticReport() {
            this.onFilterGroup();
        }
    }
};
</script>
<style>
.peopleCountInput input {
    width: 100%;
    height: 34px !important;
    padding: 6px 30px;
    padding-left: 10px;
    border: 1px solid #ccc !important;
    border-radius: 4px !important;
    min-height: unset !important;
}
.peopleCountInput button {
    height: 34px !important;
    border-radius: 4px !important;
    min-height: unset !important;
}
</style>

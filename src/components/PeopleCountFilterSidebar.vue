<template>
    <div
        class="border-left border-gray-500 h-100 d-flex flex-column justify-content-between text-gray-300"
    >
        <div
            class="objects-filter-sidebar_filter-container h-100 overflow-y-auto report-filter-sidebar_filter-container"
        >
            <!-- Type filter -->
            <b-dropdown
                dropleft
                ref="zoneDropdown"
                no-caret
                class="w-100 object-filter-item report-filter-item"
                toggle-class="bg-transparent border-none border-bottom border-gray-500 text-left p-3 shadow-none"
                menu-class="bg-gray-900 border border-right-0 border-gray-500"
            >
                <template slot="button-content">
                    <div class="text-white font-weight-bold">{{$t('peopleCount.manage.region')}}</div>
                    <div
                        class="text-muted font-weight-normal small"
                        v-line-clamp="1"
                    >{{ getSourceTreeSelectedText() }}</div>
                </template>
                <b-dropdown-form class="p-0">
                    <treeselect
                        v-model="filter.zone"
                        :options="getSourceTreeOptions()"
                        always-open
                        @select="()=> {$refs.zoneDropdown.hide(true)}"
                        :default-expand-level="1"
                    />
                </b-dropdown-form>
            </b-dropdown>

            <!-- Type time filter -->
            <b-dropdown
                dropleft
                ref="timeDropdown"
                no-caret
                class="w-100 object-filter-item report-filter-item"
                toggle-class="bg-transparent border-none border-bottom border-gray-500 text-left p-3 shadow-none"
                menu-class="bg-gray-900 border border-right-0 border-gray-500"
            >
                <template slot="button-content">
                    <div class="text-white font-weight-bold">{{$t('report.displayBy')}}</div>
                    <div
                        class="text-muted font-weight-normal small"
                        v-line-clamp="1"
                    >{{ getTimeTreeSelectedText() }}</div>
                </template>
                <b-dropdown-form class="p-0">
                    <treeselect
                        v-model="filter.time"
                        :options="getTimeOptions"
                        always-open
                        @select="()=> {$refs.timeDropdown.hide(true)}"
                        :default-expand-level="1"
                    />
                </b-dropdown-form>
            </b-dropdown>

            <!-- Time range filter -->
            <b-dropdown
                dropleft
                no-caret
                class="w-100 object-filter-item"
                toggle-class="bg-transparent text-gray-300 border-none border-bottom border-gray-500 text-left p-3 shadow-none"
                menu-class="bg-gray-900 border border-right-0 border-gray-500 text-white"
            >
                <template slot="button-content">
                    <div
                        class="text-white font-weight-bold"
                    >{{ $t('objectFilterSidebar.timeRange') }}</div>
                    <div class="text-muted font-weight-normal">
                        <div v-if="filter.startDate">
                            {{ $t('objectFilterSidebar.timeRangeFrom') }}:
                            {{ filter.startDate | formatDate }}
                        </div>
                        <div v-if="filter.endDate">
                            {{ $t('objectFilterSidebar.timeRangeTo') }}:
                            {{ filter.endDate | formatDate }}
                        </div>
                    </div>
                </template>
                <b-dropdown-form class="p-2">
                    <div class="mb-2">{{ $t('objectFilterSidebar.timeRangeFrom') }}:</div>
                    <DateTimePicker class="mb-3" v-model="filter.startDate" @input="updateFilter" />
                    <div class="mb-2">{{ $t('objectFilterSidebar.timeRangeTo') }}:</div>
                    <DateTimePicker v-model="filter.endDate" @input="updateFilter" class="mb-1" />
                    <div>
                        <b-button
                            variant="primary"
                            class="mt-1 btnDatePreset"
                            @click="updateDateRange('today')"
                        >{{$t('report.today')}}</b-button>
                        <b-button
                            variant="primary"
                            class="mt-1 btnDatePreset"
                            @click="updateDateRange('yesterday')"
                        >{{$t('report.yesterday')}}</b-button>
                    </div>
                    <div>
                        <b-button
                            variant="primary"
                            class="mt-1 btnDatePreset"
                            @click="updateDateRange('thisWeek')"
                        >{{$t('report.thisWeek')}}</b-button>
                        <b-button
                            variant="primary"
                            class="mt-1 btnDatePreset"
                            @click="updateDateRange('lastMonth')"
                        >{{$t('report.lastMonth')}}</b-button>
                    </div>
                    <div>
                        <b-button
                            variant="primary"
                            class="mt-1 btnDatePreset"
                            @click="updateDateRange('thisMonth')"
                        >{{$t('report.thisMonth')}}</b-button>
                        <b-button
                            variant="primary"
                            class="mt-1 btnDatePreset"
                            @click="updateDateRange('thisQuarter')"
                        >{{$t('report.thisQuarter')}}</b-button>
                    </div>
                </b-dropdown-form>
            </b-dropdown>
        </div>

        <div class="d-flex border-top border-gray-500">
            <div class="flex-1 text-center p-2 filter-preset-btn active" @click="resetFilter">
                <i class="fa fa-undo" aria-hidden="true"></i>
                <br />
                <span class="font-10">{{ $t('objectFilterSidebar.resetFilter') }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import Treeselect from '@riophae/vue-treeselect';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
import DateTimePicker from '@/components/SummaryReport/DateTimePicker';
import VSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
import _ from 'lodash';
import moment from 'moment-timezone';

const DEFAULT_FILTER = {
    startDate: new Date(new Date().getTime() - 50 * 86400000),
    endDate: new Date(),
    zone: 'all',
    time: 'hour'
};

export default {
    name: 'people-count-filter-sidebar',
    components: { Treeselect, DateTimePicker, VSelect },
    mounted() {
        this.$nextTick(async () => {
            this.getListZones();
        });
    },
    data() {
        return {
            filter: _.cloneDeep(DEFAULT_FILTER)
        };
    },
    computed: {
        ...mapState({
            zones: state => state.zone.items
        }),
        getTimeOptions() {
            return [
                {
                    id: 'hour',
                    label: this.$t('common.hour2')
                },
                {
                    id: 'date',
                    label: this.$t('common.date')
                },
                {
                    id: 'month',
                    label: this.$t('common.month')
                },
                {
                    id: 'year',
                    label: this.$t('common.year')
                }
            ];
        }
    },
    methods: {
        ...mapActions({
            getListZones: 'zone/getListZones'
        }),
        getSourceTreeOptions() {
            return [
                {
                    id: 'all',
                    label: this.$t('alert.all')
                }
            ].concat(
                this.zones.map(item => ({
                    id: item.name,
                    label: item.name
                }))
            );
        },
        getSourceTreeSelectedText() {
            const options = this.getSourceTreeOptions();
            const selected = options.filter(op => this.filter.zone.indexOf(op.id) > -1);
            return selected.map(item => item.label).join(', ');
        },
        getTimeTreeSelectedText() {
            const selected = this.getTimeOptions.filter(op => this.filter.time.indexOf(op.id) > -1);
            return selected.map(item => item.label).join(', ');
        },
        resetFilter() {
            this.filter = _.cloneDeep(DEFAULT_FILTER);
        },
        updateFilter(e) {
            const newFilter = _.cloneDeep(this.filter);
            newFilter.startDate = moment(newFilter.startDate).format('YYYY-MM-DD');
            newFilter.endDate = moment(newFilter.endDate).format('YYYY-MM-DD');
            this.$emit('doFilter', newFilter);
        },
        updateDateRange(preset) {
            const today = new Date();
            let firstDay = new Date();
            let lastDay = new Date();
            switch (preset) {
                case 'today':
                    this.filter.startDate = today;
                    this.filter.endDate = today;
                    break;
                case 'yesterday':
                    const yesterday = new Date(today);
                    yesterday.setDate(today.getDate() - 1);
                    this.filter.startDate = yesterday;
                    this.filter.endDate = yesterday;
                    break;
                case 'thisWeek':
                    this.filter.startDate = new Date(
                        today.setDate(today.getDate() - today.getDay() + 1)
                    );
                    this.filter.endDate = new Date(
                        today.setDate(today.getDate() - today.getDay() + 7)
                    );
                    break;
                case 'lastMonth':
                    firstDay = new Date(today.setDate(1));
                    firstDay.setMonth(firstDay.getMonth() - 1);
                    lastDay = new Date(today.setDate(0));
                    this.filter.startDate = firstDay;
                    this.filter.endDate = lastDay;
                    break;
                case 'thisMonth':
                    this.filter.startDate = new Date(today.setDate(1));
                    lastDay = new Date(today);
                    lastDay.setMonth(lastDay.getMonth() + 1);
                    lastDay.setDate(0);
                    this.filter.endDate = lastDay;
                    break;
                case 'thisQuarter':
                    firstDay = new Date(today.setDate(1));
                    if (today.getMonth() < 3) {
                        firstDay.setMonth(0);
                        lastDay.setMonth(2);
                        lastDay.setDate(31);
                    } else if (today.getMonth() < 6) {
                        firstDay.setMonth(3);
                        lastDay.setMonth(5);
                        lastDay.setDate(30);
                    } else if (today.getMonth() < 9) {
                        firstDay.setMonth(6);
                        lastDay.setMonth(8);
                        lastDay.setDate(30);
                    } else {
                        firstDay.setMonth(9);
                        lastDay.setMonth(11);
                        lastDay.setDate(31);
                    }
                    this.filter.startDate = firstDay;
                    this.filter.endDate = lastDay;
                    break;
            }
        }
    }
};
</script>
<style>
.report-filter-item .dropdown-menu {
    width: 300px;
}
.report-filter-sidebar_filter-container {
    margin-left: -301px;
    padding-left: 301px;
}
.btnDatePreset {
    width: 49%;
}
</style>
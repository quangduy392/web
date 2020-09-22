<template>
    <div
        class="border-left border-gray-500 h-100 d-flex flex-column justify-content-between text-gray-300"
    >
        <div class="objects-filter-sidebar_filter-container h-100 overflow-y-auto">
            <!-- Source filter -->
            <b-dropdown
                ref="cameraDropdown"
                dropleft
                no-caret
                class="w-100 object-filter-item"
                toggle-class="bg-transparent text-gray-300 border-none border-bottom border-gray-500 text-left p-3 shadow-none"
                menu-class="bg-gray-900 border border-right-0 border-gray-500 has-treeselect"
            >
                <template slot="button-content">
                    <div
                        :class="{
                            'text-white font-weight-bold': isTreeSelectActive(filter.cameraId)
                        }"
                    >{{ $t('alert.camera') }}</div>
                    <div
                        class="text-muted font-weight-normal small"
                        v-line-clamp="1"
                        v-if="isTreeSelectActive(filter.cameraId)"
                    >{{ getSourceTreeSelectedText() }}</div>
                </template>
                <b-dropdown-form class="p-0">
                    <treeselect
                        v-model="filter.cameraId"
                        :options="getSourceTreeOptions()"
                        always-open
                        @select="()=> {$refs.cameraDropdown.hide(true)}"
                        :default-expand-level="1"
                        @input="updateFilter"
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
                        :class="{
                            'text-white font-weight-bold': from || to
                        }"
                    >{{ $t('objectFilterSidebar.timeRange') }}</div>
                    <div class="text-muted font-weight-normal" v-if="from || to">
                        <div v-if="to">
                            {{ $t('objectFilterSidebar.timeRangeFrom') }}:
                            {{ filter.to }}
                        </div>
                        <div v-if="from">
                            {{ $t('objectFilterSidebar.timeRangeTo') }}:
                            {{ filter.from }}
                        </div>
                    </div>
                </template>
                <b-dropdown-form class="p-2">
                    <div class="mb-2">{{ $t('objectFilterSidebar.timeRangeFrom') }}:</div>
                    <DateTimePicker
                        class="mb-3"
                        showClearBtn
                        v-model="from"
                        @dateInput="updateFromFilter"
                    ></DateTimePicker>
                    <div class="mb-2">{{ $t('objectFilterSidebar.timeRangeTo') }}:</div>
                    <DateTimePicker showClearBtn v-model="to" @dateInput="updateToFilter"></DateTimePicker>
                </b-dropdown-form>
            </b-dropdown>
        </div>

        <div class="d-flex border-top border-gray-500">
            <div
                class="flex-1 text-center p-2 filter-preset-btn"
                :class="{ active: isFiltering() }"
                @click="resetFilter"
            >
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
import DateTimePicker from '@/components/DateTimePicker';

export default {
    components: { Treeselect, DateTimePicker },
    mounted: function() {
        this.$nextTick(async function() {
            this.updateFilter();
        });
    },
    props: {
        cameras: {
            type: Array,
            default: []
        }
    },
    data() {
        return {
            filter: {
                cameraId: 'all',
                from: null,
                to: null
            },
            from: null,
            to: null
        };
    },
    computed: {
        ...mapState({})
    },
    methods: {
        ...mapActions({}),
        // Source filter
        getSourceTreeOptions() {
            return [
                {
                    id: 'all',
                    label: this.$t('alert.all')
                }
            ].concat(
                this.cameras.map(item => ({
                    id: item.id + '',
                    label: item.name
                }))
            );
        },
        getSourceTreeSelectedText() {
            const options = this.getSourceTreeOptions();
            const selected = options.filter(op => this.filter.cameraId.indexOf(op.id) > -1);
            return selected.map(item => item.label).join(', ');
        },

        // Time range filter
        updateFromFilter(value) {
            this.filter.to = value;
            this.updateFilter();
        },
        updateToFilter(value) {
            this.filter.from = value;
            this.updateFilter();
        },

        // Update filter
        updateFilter(value) {
            this.$emit('filterChange', this.filter);
        },
        isTreeSelectActive(filterValue, defaultValue = 'all') {
            return (
                filterValue && filterValue.length > 0 && filterValue.indexOf(defaultValue) === -1
            );
        },
        isDatePickerActive(filterValue, defaultValue = 'all') {
            return filterValue && filterValue !== defaultValue;
        },
        isFiltering() {
            return (
                this.isTreeSelectActive(this.filter.cameraId) ||
                this.isDatePickerActive(this.filter.from, '') ||
                this.isDatePickerActive(this.filter.to, '')
            );
        },
        resetFilter() {
            if (this.isFiltering()) {
                this.filter = {
                    cameraId: 'all',
                    type: 'all',
                    reviewed: 'false'
                };

                if (this.from || this.to) {
                    this.from = null;
                    this.to = null;
                    this.updateFilter();
                }
            }
        }
    }
};
</script>

<style lang="scss" scoped>
</style>

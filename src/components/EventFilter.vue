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
                    >
                        {{ $t('alert.camera') }}
                    </div>
                    <div
                        class="text-muted font-weight-normal small"
                        v-line-clamp="1"
                        v-if="isTreeSelectActive(filter.cameraId)"
                    >
                        {{ getSourceTreeSelectedText() }}
                    </div>
                </template>
                <b-dropdown-form class="p-0">
                    <treeselect
                        v-model="filter.cameraId"
                        :options="getSourceTreeOptions()"
                        always-open
                        @select="
                            () => {
                                $refs.cameraDropdown.hide(true);
                            }
                        "
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
                    >
                        {{ $t('objectFilterSidebar.timeRange') }}
                    </div>
                    <div class="text-muted font-weight-normal" v-if="from || to">
                        <div v-if="from">
                            {{ $t('objectFilterSidebar.timeRangeFrom') }}:
                            {{ filter.from }}
                        </div>
                        <div v-if="to">
                            {{ $t('objectFilterSidebar.timeRangeTo') }}:
                            {{ filter.to }}
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
                    <DateTimePicker
                        showClearBtn
                        v-model="to"
                        @dateInput="updateToFilter"
                    ></DateTimePicker>
                </b-dropdown-form>
            </b-dropdown>

            <!-- Type filter -->
            <b-dropdown
                ref="typeDropdown"
                dropleft
                no-caret
                class="w-100 object-filter-item"
                toggle-class="bg-transparent text-gray-300 border-none border-bottom border-gray-500 text-left p-3 shadow-none"
                menu-class="bg-gray-900 border border-right-0 border-gray-500 has-treeselect"
            >
                <template slot="button-content">
                    <div
                        :class="{
                            'text-white font-weight-bold': isTreeSelectActive(filter.type)
                        }"
                    >
                        {{ $t('alert.type') }}
                    </div>
                    <div
                        class="text-muted font-weight-normal small"
                        v-line-clamp="1"
                        v-if="isTreeSelectActive(filter.type)"
                    >
                        {{ getTypeTreeSelectedText() }}
                    </div>
                </template>
                <b-dropdown-form class="p-0">
                    <treeselect
                        v-model="filter.type"
                        :options="getTypeTreeOptions()"
                        always-open
                        @select="
                            () => {
                                $refs.typeDropdown.hide(true);
                            }
                        "
                        :default-expand-level="1"
                        @input="updateFilter"
                    />
                </b-dropdown-form>
            </b-dropdown>

            <!-- Reviewed filter -->
            <b-dropdown
                ref="reviewedDropdown"
                dropleft
                no-caret
                class="w-100 object-filter-item"
                toggle-class="bg-transparent text-gray-300 border-none border-bottom border-gray-500 text-left p-3 shadow-none"
                menu-class="bg-gray-900 border border-right-0 border-gray-500 has-treeselect"
            >
                <template slot="button-content">
                    <div
                        :class="{
                            'text-white font-weight-bold': isTreeSelectActive(
                                filter.reviewed,
                                'false'
                            )
                        }"
                    >
                        {{ $t('alert.status') }}
                    </div>
                    <div
                        class="text-muted font-weight-normal small"
                        v-line-clamp="1"
                        v-if="isTreeSelectActive(filter.reviewed, 'false')"
                    >
                        {{ getReviewedTreeText() }}
                    </div>
                </template>
                <b-dropdown-form class="p-0">
                    <treeselect
                        v-model="filter.reviewed"
                        :options="getReviewedTreeOptions()"
                        always-open
                        @select="
                            () => {
                                $refs.reviewedDropdown.hide(true);
                            }
                        "
                        :default-expand-level="1"
                        @input="updateFilter"
                    />
                </b-dropdown-form>
            </b-dropdown>

            <!-- Level filter -->
            <b-dropdown
                ref="levelDropdown"
                dropleft
                no-caret
                class="w-100 object-filter-item"
                toggle-class="bg-transparent text-gray-300 border-none border-bottom border-gray-500 text-left p-3 shadow-none"
                menu-class="bg-gray-900 border border-right-0 border-gray-500 has-treeselect"
            >
                <template slot="button-content">
                    <div
                        :class="{
                            'text-white font-weight-bold': isTreeSelectActive(filter.level)
                        }"
                    >
                        {{ $t('alert.level') }}
                    </div>
                    <div
                        class="text-muted font-weight-normal small"
                        v-line-clamp="1"
                        v-if="isTreeSelectActive(filter.level)"
                    >
                        {{ getLevelTreeSelectedText() }}
                    </div>
                </template>
                <b-dropdown-form class="p-0">
                    <treeselect
                        v-model="filter.level"
                        :options="levelOptions"
                        always-open
                        @select="
                            () => {
                                $refs.levelDropdown.hide(true);
                            }
                        "
                        :default-expand-level="1"
                        @input="updateFilter"
                    />
                </b-dropdown-form>
            </b-dropdown>
            <!-- Profile filter -->
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
import moment from 'moment-timezone';

export default {
    name: 'event-filter',
    components: { Treeselect, DateTimePicker },
    mounted: function() {
        this.$nextTick(async function() {
            this.updateFilter();
        });
    },
    props: {
        types: {
            type: Array,
            default: []
        },
        cameras: {
            type: Array,
            default: []
        }
    },
    data() {
        return {
            filter: {
                cameraId: 'all',
                type: 'all',
                reviewed: 'false',
                from: null,
                to: null,
                level: 'all'
            },
            selectedFilterTypeIndex: -1,
            presetName: '',
            selectedPresetId: null,
            from: null,
            to: null,
            text: '',
            levelOptions: [
                {
                    id: 'all',
                    label: this.$t('alert.all')
                },
                {
                    id: '0',
                    label: this.$t('alert.normal')
                },
                {
                    id: '1',
                    label: this.$t('alert.welcome')
                },
                {
                    id: '2',
                    label: this.$t('alert.warning')
                },
                {
                    id: '3',
                    label: this.$t('alert.redAlert')
                }
            ]
        };
    },
    computed: {
        ...mapState({
            caseVideoitems: state => state.caseVideo.items,
            localLang: state =>
                _.cloneDeep(_.get(state.auth, 'currentUser.userDetail.options.language'))
        })
    },
    methods: {
        ...mapActions({
            updateOrCreatePreset: 'preset/updateOrCreate',
            updatePresetState: 'preset/updateState',
            deletePresetAction: 'preset/delete'
        }),
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

        // Class filter
        getTypeTreeOptions() {
            if (this.localLang === 'vi') {
                // console.log(this.types);
                return [
                    {
                        id: 'all',
                        label: this.$t('alert.all')
                    }
                ].concat(
                    this.types.map(item => ({
                        id: item.value,
                        label: item.descVN
                    }))
                );
            }
            return [
                {
                    id: 'all',
                    label: this.$t('alert.all')
                }
            ].concat(
                this.types.map(item => ({
                    id: item.value,
                    label: item.descVN
                }))
            );
        },
        getTypeTreeSelectedText() {
            const options = this.getTypeTreeOptions();
            const selected = options.filter(op => this.filter.type.indexOf(op.id) > -1);
            return selected.map(item => item.label).join(', ');
        },

        getReviewedTreeOptions() {
            return [
                {
                    id: 'all',
                    label: this.$t('alert.all')
                },
                {
                    id: 'true',
                    label: this.$t('alert.reviewed')
                },
                {
                    id: 'false',
                    label: this.$t('alert.notReviewed')
                }
            ];
        },
        getReviewedTreeText() {
            const options = this.getReviewedTreeOptions();
            const selected = options.find(op => this.filter.reviewed === op.id);
            return selected.label;
        },
        getLevelTreeSelectedText() {
            const selected = this.levelOptions.find(op => this.filter.level === op.id);
            return selected.label;
        },
        // Time range filter
        updateFromFilter(value) {
            this.filter.from = value;
            this.updateFilter();
        },
        updateToFilter(value) {
            this.filter.to = value;
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
        getObjectTime(object) {
            if (!object.video || !object.frames || !object.frames.length) return '';
            const videoTime = object.video.time;
            const objectTime = moment(videoTime).add(object.frames[0].time, 'milliseconds');
            return objectTime;
        },
        isFiltering() {
            return (
                this.isTreeSelectActive(this.filter.cameraId) ||
                this.isTreeSelectActive(this.filter.type) ||
                this.isTreeSelectActive(this.filter.reviewed, 'false') ||
                this.isDatePickerActive(this.filter.from, '') ||
                this.isDatePickerActive(this.filter.to, '') ||
                this.isDatePickerActive(this.filter.level)
            );
        },
        resetFilter() {
            if (this.isFiltering()) {
                this.filter = {
                    cameraId: 'all',
                    type: 'all',
                    reviewed: 'false',
                    level: 'all'
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

<style lang="scss" scoped></style>

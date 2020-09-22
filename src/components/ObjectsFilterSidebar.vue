<template>
    <div
        class="
            border-left border-gray-500 h-100
            d-flex flex-column justify-content-between
            text-gray-300"
    >
        <div class="objects-filter-sidebar_filter-container h-100 overflow-y-auto">
            <!-- Source filter -->
            <b-dropdown
                dropleft
                no-caret
                class="w-100 object-filter-item"
                toggle-class="bg-transparent text-gray-300 border-none border-bottom border-gray-500 text-left p-3 shadow-none"
                menu-class="bg-gray-900 border border-right-0 border-gray-500 has-treeselect"
            >
                <template slot="button-content">
                    <div
                        :class="{
                            'text-white font-weight-bold': isTreeSelectActive(filter.sources)
                        }"
                    >
                        {{ $t('objectFilterSidebar.source') }}
                    </div>
                    <div
                        class="text-muted font-weight-normal small"
                        v-line-clamp="1"
                        v-if="isTreeSelectActive(filter.sources)"
                    >
                        {{ getSourceTreeSelectedText() }}
                    </div>
                </template>
                <b-dropdown-form class="p-0">
                    <treeselect
                        v-model="filter.sources"
                        :multiple="true"
                        :options="getSourceTreeOptions()"
                        always-open
                        :default-expand-level="1"
                        @input="updateFilter"
                    >
                        <label
                            slot="option-label"
                            slot-scope="{
                                node,
                                shouldShowCount,
                                count,
                                labelClassName,
                                countClassName
                            }"
                            :class="labelClassName"
                        >
                            <div>{{ node.isBranch ? node.label : node.label[0] }}</div>
                            <div v-if="!node.isBranch" class="text-gray-300 small">
                                {{ node.label[1] | formatDateTime }}
                            </div>
                        </label>
                    </treeselect>
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
                            'text-white font-weight-bold': isDateFilterActive()
                        }"
                    >
                        {{ $t('objectFilterSidebar.timeRange') }}
                    </div>
                    <div class="text-muted font-weight-normal" v-if="isDateFilterActive()">
                        <div v-if="filter.startTime">
                            {{ $t('objectFilterSidebar.timeRangeFrom') }}:
                            {{ filter.startTime | formatDateTime }}
                        </div>
                        <div v-if="filter.endTime">
                            {{ $t('objectFilterSidebar.timeRangeTo') }}:
                            {{ filter.endTime | formatDateTime }}
                        </div>
                    </div>
                </template>
                <b-dropdown-form class="p-2">
                    <div class="mb-2">{{ $t('objectFilterSidebar.timeRangeFrom') }}:</div>
                    <DateTimePicker class="mb-3" v-model="filter.startTime" @input="updateFilter" />
                    <div class="mb-2">{{ $t('objectFilterSidebar.timeRangeTo') }}:</div>
                    <DateTimePicker v-model="filter.endTime" @input="updateFilter" />
                </b-dropdown-form>
            </b-dropdown>

            <!-- Class filter -->
            <b-dropdown
                dropleft
                no-caret
                class="w-100 object-filter-item"
                toggle-class="bg-transparent text-gray-300 border-none border-bottom border-gray-500 text-left p-3 shadow-none"
                menu-class="bg-gray-900 border border-right-0 border-gray-500 has-treeselect"
            >
                <template slot="button-content">
                    <div
                        :class="{
                            'text-white font-weight-bold': isTreeSelectActive(filter.classes)
                        }"
                    >
                        {{ $t('objectFilterSidebar.class') }}
                    </div>
                    <div
                        class="text-muted font-weight-normal small"
                        v-line-clamp="1"
                        v-if="isTreeSelectActive(filter.classes)"
                    >
                        {{ getClassTreeSelectedText() }}
                    </div>
                </template>
                <b-dropdown-form class="p-0">
                    <treeselect
                        v-model="filter.classes"
                        :multiple="true"
                        :options="getClassTreeOptions()"
                        always-open
                        :default-expand-level="1"
                        @input="updateFilter"
                    />
                </b-dropdown-form>
            </b-dropdown>

            <!-- Color filter -->
            <b-dropdown
                dropleft
                no-caret
                class="w-100 object-filter-item"
                toggle-class="bg-transparent text-gray-300 border-none border-bottom border-gray-500 text-left p-3 shadow-none"
                menu-class="bg-gray-900 border border-right-0 border-gray-500 has-treeselect"
            >
                <template slot="button-content">
                    <div
                        :class="{
                            'text-white font-weight-bold': isTreeSelectActive(filter.colors)
                        }"
                    >
                        {{ $t('objectFilterSidebar.color') }}
                    </div>
                    <div
                        class="text-muted font-weight-normal small d-flex"
                        v-line-clamp="1"
                        v-if="isTreeSelectActive(filter.colors)"
                    >
                        <div
                            v-if="filter.colors.length"
                            v-for="color in filter.colors"
                            class="color-option-square small mr-1 border border-gray-500"
                            :style="{ background: getColorOptionColor(color) }"
                        ></div>

                        <div v-if="!filter.colors.length">
                            {{ $t('objectFilterSidebar.none') }}
                        </div>
                    </div>
                </template>
                <b-dropdown-form class="p-0">
                    <treeselect
                        v-model="filter.colors"
                        :multiple="true"
                        :options="getColorTreeOptions()"
                        always-open
                        :default-expand-level="1"
                        @input="updateFilter"
                    >
                        <label
                            slot="option-label"
                            slot-scope="{
                                node,
                                shouldShowCount,
                                count,
                                labelClassName,
                                countClassName
                            }"
                            class="d-flex align-items-center"
                            :class="labelClassName"
                        >
                            <div
                                v-if="!node.isBranch"
                                class="color-option-square mr-2 border border-gray-500"
                                :style="{ background: getColorOptionColor(node.id) }"
                            ></div>
                            <span>{{ getColorOptionLabel(node.id) }}</span>
                        </label>
                    </treeselect>
                </b-dropdown-form>
            </b-dropdown>

            <!-- Area filter -->
            <b-dropdown
                dropleft
                no-caret
                class="w-100 object-filter-item"
                toggle-class="bg-transparent text-gray-300 border-none border-bottom border-gray-500 text-left p-3 shadow-none"
                menu-class="bg-gray-900 border border-right-0 border-gray-500 has-treeselect"
                v-if="getAreaTreeOptions().length"
            >
                <template slot="button-content">
                    <div
                        :class="{
                            'text-white font-weight-bold': isAreaTreeSelectActive()
                        }"
                    >
                        {{ $t('objectFilterSidebar.area') }}
                    </div>
                    <div
                        class="text-muted font-weight-normal small"
                        v-line-clamp="1"
                        v-if="isAreaTreeSelectActive()"
                    >
                        {{ getAreaTreeSelectedText() }}
                    </div>
                </template>
                <b-dropdown-form class="p-0">
                    <treeselect
                        v-model="filter.areas"
                        :multiple="true"
                        :options="getAreaTreeOptions()"
                        always-open
                        :default-expand-level="1"
                        :disable-branch-nodes="true"
                        @input="updateFilter"
                    />
                </b-dropdown-form>
            </b-dropdown>
        </div>

        <div class="d-flex border-top border-gray-500">
            <div
                class="flex-1 text-center p-2 filter-preset-btn"
                :class="{ active: presetItems.length }"
                @click="openSelectPresetModal()"
            >
                <i class="fa fa-sliders" aria-hidden="true"></i><br />
                <span class="font-10">{{ $t('objectFilterSidebar.presets') }}</span>
            </div>
            <div
                class="flex-1 text-center p-2 border-left border-right border-gray-500 filter-preset-btn"
                :class="{ active: isFiltering() }"
                @click="openSavePresetModal()"
            >
                <i class="fa fa-floppy-o" aria-hidden="true"></i><br />
                <span class="font-10">{{ $t('objectFilterSidebar.savePreset') }}</span>
            </div>
            <div
                class="flex-1 text-center p-2 filter-preset-btn"
                :class="{ active: isFiltering() }"
                @click="resetFilter"
            >
                <i class="fa fa-undo" aria-hidden="true"></i><br />
                <span class="font-10">{{ $t('objectFilterSidebar.resetFilter') }}</span>
            </div>
        </div>

        <!-- the modal -->
        <!-- save preset modal -->
        <b-modal
            ref="savePresetModal"
            :title="$t('objectFilterSidebar.savePreset')"
            no-close-on-esc
            no-close-on-backdrop
            :cancel-title="$t('common.cancel')"
            @ok="handleSavePresetOk"
        >
            <form @submit.prevent="submitSavePresetForm">
                <b-form-group :label="$t('objectFilterSidebar.presetName')">
                    <b-form-input
                        maxlength="255"
                        v-model.trim="presetName"
                        :placeholder="$t('objectFilterSidebar.presetName')"
                        name="presetName"
                        v-validate="'required'"
                        :data-vv-as="$t('objectFilterSidebar.presetName')"
                        autofocus
                    ></b-form-input>
                    <div v-show="errors.has('presetName')" class="validation-message text-danger">
                        {{ errors.first('presetName') }}
                    </div>
                </b-form-group>
            </form>
        </b-modal>

        <!-- list preset modal -->
        <b-modal
            ref="selectPresetModal"
            :title="$t('objectFilterSidebar.selectPreset')"
            no-close-on-esc
            no-close-on-backdrop
            :cancel-title="$t('common.cancel')"
            @ok="handleSelectPresetOk"
        >
            <form @submit.prevent="submitSelectPresetForm">
                <b-form-group>
                    <div
                        class="d-flex align-items-center"
                        v-for="preset in presetItems"
                        :key="preset.id"
                    >
                        <b-form-radio
                            v-model="selectedPresetId"
                            :value="preset.id"
                            name="preset"
                            v-validate="'required'"
                            data-vv-as="Preset"
                            class="mr-2"
                        >
                            {{ preset.name }}
                        </b-form-radio>
                        <i
                            class="fa fa-times cursor-pointer text-danger"
                            v-b-tooltip.hover
                            title="Delete preset"
                            @click="deletePreset(preset.id)"
                        ></i>
                    </div>

                    <div v-show="errors.has('preset')" class="validation-message text-danger">
                        {{ errors.first('preset') }}
                    </div>
                </b-form-group>
            </form>
        </b-modal>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import Treeselect from '@riophae/vue-treeselect';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
import CONSTANTS from '@/constants';
import DateTimePicker from '@/components/DateTimePicker';
import moment from 'moment-timezone';
import polygonsIntersect from 'polygons-intersect';

export default {
    name: 'objects-filter-sidebar',
    components: { Treeselect, DateTimePicker },
    mounted: function() {
        this.$nextTick(async function() {
            this.getListPreset({
                caseId: this.caseId
            });
        });
    },
    props: {
        caseId: {
            type: Number | String
        },
        items: {
            type: Array,
            default: []
        },
        filterClasses: {
            type: Array,
            default: []
        },
        filterColors: {
            type: Array,
            default: []
        },
        minObjectTime: {
            type: Object | String,
            default: null
        },
        maxObjectTime: {
            type: Object | String,
            default: null
        },
        // v-model
        value: {
            type: Object,
            default: {}
        }
    },
    data() {
        return {
            filter: {
                ...CONSTANTS.DEFAULT_OBJECT_FILTER,
                startTime: this.minObjectTime,
                endTime: this.maxObjectTime
            },
            selectedFilterTypeIndex: -1,
            presetName: '',
            selectedPresetId: null
        };
    },
    computed: {
        ...mapState({
            caseVideoitems: state => state.caseVideo.items,
            presetItems: state => state.preset.items
        })
    },
    watch: {
        items(val) {
            this.updateFilter();
        },
        value(val) {
            this.filter = {
                ...CONSTANTS.DEFAULT_OBJECT_FILTER,
                startTime: this.minObjectTime,
                endTime: this.maxObjectTime,
                ...val
            };
        },
        minObjectTime(val) {
            this.filter = {
                ...this.filter,
                startTime: this.minObjectTime
            };
        },
        maxObjectTime(val) {
            this.filter = {
                ...this.filter,
                endTime: this.maxObjectTime
            };
        }
    },
    methods: {
        ...mapActions({
            getListPreset: 'preset/getList',
            updateOrCreatePreset: 'preset/updateOrCreate',
            updatePresetState: 'preset/updateState',
            deletePresetAction: 'preset/delete'
        }),
        // Source filter
        getSourceTreeOptions() {
            return [
                {
                    id: 'all',
                    label: this.$t('objectFilterSidebar.all'),
                    children: this.caseVideoitems.map(item => ({
                        id: item.video.id,
                        label: [item.video.name, item.video.time]
                    }))
                }
            ];
        },
        getSourceTreeSelectedText() {
            if (this.filter.sources.length === 0) {
                return this.$t('objectFilterSidebar.none');
            } else {
                const options = this.getSourceTreeOptions()[0].children;
                const selected = options.filter(op => this.filter.sources.indexOf(op.id) > -1);
                return selected.map(item => item.label[0]).join(', ');
            }
        },

        // Class filter
        getClassTreeOptions() {
            return [
                {
                    id: 'all',
                    label: this.$t('objectFilterSidebar.all'),
                    children: this.filterClasses.map(item => ({
                        id: item,
                        label: this.$t(`objectFilterSidebar.classes.${item}`)
                    }))
                }
            ];
        },
        getClassTreeSelectedText() {
            if (this.filter.classes.length === 0) {
                return this.$t('objectFilterSidebar.none');
            } else {
                const selectedClassText = this.filter.classes.map(item =>
                    this.$t(`objectFilterSidebar.classes.${item}`)
                );
                return selectedClassText.join(', ');
            }
        },

        // Color filter
        getColorTreeOptions() {
            return [
                {
                    id: 'all',
                    label: this.$t('objectFilterSidebar.all'),
                    children: _.sortBy(this.filterColors).map(item => ({
                        id: item,
                        label: item
                    }))
                }
            ];
        },
        getColorOptionLabel(nodeId) {
            if (nodeId === 'all') {
                return this.$t('objectFilterSidebar.all');
            } else {
                const colorOption = CONSTANTS.COLOR_FILTERS[nodeId];
                const colorText = _.get(colorOption, 'text');
                return this.$t(`objectFilterSidebar.colors.${colorText}`);
            }
        },
        getColorOptionColor(nodeId) {
            const colorOption = CONSTANTS.COLOR_FILTERS[nodeId];
            return _.get(colorOption, 'color');
        },

        // Time range filter
        updateTimeFilter(dataName, value) {
            this.filter[dataName] = value;

            this.updateFilter();
        },
        isDateFilterActive() {
            return (
                moment(this.filter.startTime).format() !== moment(this.minObjectTime).format() ||
                moment(this.filter.endTime).format() !== moment(this.maxObjectTime).format()
            );
        },

        // Area filter
        getAreaTreeOptions() {
            const areaTreeOptions = [];
            this.caseVideoitems.forEach(item => {
                if (item.video.areas && item.video.areas.length) {
                    areaTreeOptions.push({
                        id: `video-${item.video.id}`,
                        label: item.video.name,
                        children: item.video.areas.map((area, index) => ({
                            id: `${item.video.id}-${index}`,
                            label: area.title
                        }))
                    });
                }
            });
            return areaTreeOptions;
        },
        getAreaTreeSelectedText() {
            return `${this.filter.areas.length} ${this.$t('objectFilterSidebar.area')}`;
        },

        // Update filter
        updateFilter() {
            const isSourceFilter = this.isTreeSelectActive(this.filter.sources);
            const isClassFilter = this.isTreeSelectActive(this.filter.classes);
            const isColorFilter = this.isTreeSelectActive(this.filter.colors);
            const isAreaFilter = this.isAreaTreeSelectActive();
            const filterAreas = [];
            this.filter.areas.forEach(videoArea => {
                const videoAreaInfo = videoArea.split('-'); // [videoId, areaIndex]
                const caseVideo = this.caseVideoitems.find(
                    caseVideo => caseVideo.video.id === parseInt(videoAreaInfo[0])
                );
                if (!caseVideo) {
                    return;
                }

                filterAreas.push({
                    videoId: caseVideo.video.id,
                    areaPoints: caseVideo.video.areas[videoAreaInfo[1]].points
                });
            });

            let filteredItems = this.items.filter(item => {
                let isFiltered = true;
                if (isSourceFilter) {
                    isFiltered = isFiltered && this.filter.sources.indexOf(item.video.id) > -1;
                }

                if (isClassFilter) {
                    isFiltered = isFiltered && this.filter.classes.indexOf(item.class) > -1;
                }

                if (isColorFilter) {
                    isFiltered =
                        isFiltered && _.intersection(this.filter.colors, item.colors).length > 0;
                }

                if (this.filter.startTime) {
                    isFiltered =
                        isFiltered &&
                        this.getObjectTime(item).isAfter(
                            moment(this.filter.startTime)
                                .seconds(0)
                                .millisecond(0)
                        );
                }

                if (this.filter.endTime) {
                    isFiltered =
                        isFiltered &&
                        this.getObjectTime(item).isBefore(
                            moment(this.filter.endTime)
                                .seconds(59)
                                .millisecond(999)
                        );
                }

                return isFiltered;
            });

            // area filter
            if (isAreaFilter) {
                filteredItems = filteredItems.filter(item => {
                    const objectBox = item.frames[0].box;
                    const objectPolygon = [
                        {
                            x: objectBox[0],
                            y: objectBox[1]
                        },
                        {
                            x: objectBox[0] + objectBox[2],
                            y: objectBox[1]
                        },
                        {
                            x: objectBox[0] + objectBox[2],
                            y: objectBox[1] + objectBox[3]
                        },
                        {
                            x: objectBox[0],
                            y: objectBox[1] + objectBox[3]
                        }
                    ];
                    const intersectedAreas = filterAreas
                        .filter(area => area.videoId === item.video.id)
                        .filter(area => polygonsIntersect(area.areaPoints, objectPolygon).length);
                    return intersectedAreas.length;
                });
            }
            this.$emit('doFilter', filteredItems);
        },
        isTreeSelectActive(filterValue) {
            return filterValue.length === 0 || filterValue.indexOf('all') === -1;
        },
        isAreaTreeSelectActive() {
            return this.filter.areas.length > 0;
        },
        getObjectTime(object) {
            if (!object.video || !object.frames || !object.frames.length) return '';
            const videoTime = object.video.time;
            const objectTime = moment(videoTime).add(object.frames[0].time, 'milliseconds');

            return objectTime;
        },
        isFiltering() {
            return (
                this.isTreeSelectActive(this.filter.sources) ||
                this.isTreeSelectActive(this.filter.classes) ||
                this.isTreeSelectActive(this.filter.colors) ||
                this.isDateFilterActive() ||
                this.isAreaTreeSelectActive()
            );
        },
        resetFilter() {
            if (this.isFiltering()) {
                this.filter = {
                    ...CONSTANTS.DEFAULT_OBJECT_FILTER,
                    startTime: this.minObjectTime,
                    endTime: this.maxObjectTime
                };
            }
        },

        // Save preset
        openSavePresetModal() {
            if (this.isFiltering()) {
                // Reset form
                this.presetName = '';

                this.$refs.savePresetModal.show();
            }
        },

        handleSavePresetOk(modal) {
            // Prevent modal from closing
            modal.preventDefault();
            // Trigger submit handler
            this.submitSavePresetForm();
        },
        submitSavePresetForm: function() {
            this.$validator.validateAll().then(result => {
                if (result) {
                    this.updateOrCreatePreset({
                        name: this.presetName,
                        caseId: parseInt(this.caseId),
                        filter: this.filter
                    }).then(res => {
                        const presetItems = _.cloneDeep(this.presetItems);
                        presetItems.push(res);
                        this.updatePresetState({
                            stateName: 'items',
                            value: presetItems
                        });

                        this.$refs.savePresetModal.hide();
                        this.$toaster.success('Save preset successfully');
                    });
                }
            });
        },

        // select preset
        openSelectPresetModal() {
            if (this.presetItems.length) {
                // Reset form
                this.selectedPresetId = null;

                this.$refs.selectPresetModal.show();
            }
        },
        handleSelectPresetOk(modal) {
            // Prevent modal from closing
            modal.preventDefault();
            // Trigger submit handler
            this.submitSelectPresetForm();
        },
        submitSelectPresetForm: function() {
            this.$validator.validateAll().then(result => {
                if (result) {
                    const preset = this.presetItems.find(item => item.id === this.selectedPresetId);
                    if (preset) {
                        this.filter = {
                            ...CONSTANTS.DEFAULT_OBJECT_FILTER,
                            ...preset.filter
                        };
                    }
                    this.$refs.selectPresetModal.hide();
                }
            });
        },
        deletePreset(id) {
            const removeIndex = this.presetItems.findIndex(item => item.id === id);
            const preset = this.presetItems[removeIndex];
            const isComfirmed = confirm(`Are you sure want to delete preset '${preset.name}'?`);

            if (isComfirmed) {
                this.deletePresetAction({
                    id
                }).then(() => {
                    const newPresetItems = _.cloneDeep(this.presetItems);
                    newPresetItems.splice(removeIndex, 1);
                    this.updatePresetState({
                        stateName: 'items',
                        value: newPresetItems
                    });

                    if (newPresetItems.length === 0) {
                        this.$refs.selectPresetModal.hide();
                    }

                    this.$toaster.success('Delete preset successfully');
                });
            }
        }
    }
};
</script>

<style lang="scss" scoped>
</style>

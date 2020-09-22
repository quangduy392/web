<template>
    <div
        class="border-left border-gray-500 h-100 d-flex flex-column justify-content-between text-gray-300"
    >
        <div
            class="objects-filter-sidebar_filter-container h-100 overflow-y-auto d-flex flex-column report-filter-sidebar_filter-container"
        >
            <b-dropdown
                ref="profileDropdown"
                dropleft
                no-caret
                class="w-100 object-filter-item report-filter-item"
                toggle-class="bg-transparent border-none border-bottom border-gray-500 text-left p-3 shadow-none"
                menu-class="bg-gray-900 border border-right-0 border-gray-500"
            >
                <template slot="button-content">
                    <div class="text-white font-weight-bold'">Tìm kiếm</div>
                    <div
                        class="text-muted font-weight-normal small"
                        v-line-clamp="1"
                    >{{ getDoctorTreeSelectedText() }}</div>
                </template>
                <b-dropdown-form class="p-2">
                    <b-form-group>
                        <VSelect
                            class="bg-white"
                            v-model="profileSelected"
                            label="name"
                            @input="updateFilter"
                            :options="profiles"
                            @input.native="onKeyDown"
                        />
                    </b-form-group>
                </b-dropdown-form>
            </b-dropdown>

            <div class="flex-1 overflow-y-auto h-100">
                <b-table
                    v-if="eventNewest.length"
                    dark
                    :items="eventNewest"
                    :fields="fields"
                    class="mb-0"
                    select-mode="single"
                    selected-variant="active"
                    @row-selected="onZoneSelected"
                    selectable
                >
                    <template slot="cameraId" slot-scope="data">
                        <div>{{ data.item.createdAt | formatDateTime }}</div>
                        <div>{{ getZoneName(data.item.cameraId) }}</div>
                    </template>
                </b-table>

                <!-- event list -->
                <div
                    v-if="profileSelected&&!eventNewest.length"
                    class="h-100 d-flex flex-column justify-content-center align-items-center text-muted"
                >{{ $i18n.t('attendanceCamera.noData') }}</div>
            </div>
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
import { mapActions } from 'vuex';
import Treeselect from '@riophae/vue-treeselect';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
import VSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
import _ from 'lodash';

export default {
    name: 'attendance-welcome-sidebar',
    components: { Treeselect, VSelect },
    props: {
        listProfile: {
            type: Array,
            default: []
        },
        eventNewest: {
            type: Array,
            default: []
        },
        zones: {
            type: Array,
            default: []
        }
    },
    mounted: function() {
        this.$nextTick(async function() {
            this.zoneCamera = await this.getListZoneCamera();
        });
    },
    data() {
        return {
            profileSelected: null,
            fields: [
                {
                    thClass: 'd-none',
                    tdClass: 'text-center',
                    key: 'cameraId'
                }
            ],
            zoneCamera: [],
            isProfileChange: false
        };
    },
    computed: {
        profiles() {
            return _.sortBy(this.listProfile, 'name');
        }
    },
    methods: {
        ...mapActions({
            getListZoneCamera: 'zone/getListZoneCamera'
        }),
        getTypeTreeSelectedText() {
            return this.profileSelected ? this.profileSelected.name : '';
        },
        // Update filter
        updateFilter() {
            this.$emit('doFilter', this.profileSelected);
            this.isProfileChange = true;
            this.$refs.profileDropdown.hide(true);
        },
        getDoctorTreeSelectedText() {
            if (this.profileSelected) return 'Bác sĩ: ' + this.profileSelected.name;
            return null;
        },
        resetFilter() {
            this.profileSelected = null;
            this.updateFilter();
        },
        getZoneName(cameraId) {
            for (const zoneCam of this.zoneCamera) {
                if (zoneCam.cameraId === cameraId) {
                    const zone = _.find(this.zones, { id: zoneCam.zoneId });
                    if (zone) return zone.name;
                }
            }
            return 'Không xác định';
        },
        onZoneSelected(items) {
            for (const zoneCam of this.zoneCamera) {
                if (zoneCam.cameraId === items[0].cameraId) {
                    const zone = _.find(this.zones, { id: zoneCam.zoneId });
                    if (zone) {
                        return this.$emit('zoneSelectedChange', zone);
                    }
                }
            }
        },
        onKeyDown() {
            this.profileSelected = null;
        }
    },
    watch: {
        eventNewest() {
            if (this.eventNewest.length && this.isProfileChange) {
                this.onZoneSelected(this.eventNewest);
                this.isProfileChange = false;
            }
        }
    }
};
</script>
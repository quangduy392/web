<template>
    <div
        class="border-left border-gray-500 h-100 d-flex flex-column justify-content-between text-gray-300"
    >
        <div
            class="objects-filter-sidebar_filter-container h-100 overflow-y-auto d-flex flex-column"
        >
            <div class="p-2 text-center text-white border-bottom border-gray-500">
                <clock class="font-weight-bold"></clock>
                <h5 class="text-danger text-uppercase font-weight-bold">
                    Tổng số vi phạm: {{ totalReport }}
                </h5>
            </div>
            <div class="flex-1 overflow-y-auto h-100">
                <b-table
                    v-if="!isShowLoading && zones.length"
                    dark
                    hover
                    :items="zones"
                    :fields="zonesTableFields"
                    class="mb-0"
                    selectable
                    select-mode="single"
                    selected-variant="active"
                    @row-selected="onZoneSelected"
                >
                    <template slot="name" slot-scope="data">
                        <span :class="zoneSelected.includes(data.item) ? 'text-success' : ''">{{
                            data.item.name
                        }}</span>
                    </template>
                </b-table>

                <!-- event list -->
                <div
                    v-if="!isShowLoading && !zones.length"
                    class="h-100 d-flex flex-column justify-content-center align-items-center text-muted"
                >
                    {{ $i18n.t('attendanceCamera.noData') }}
                </div>

                <!-- Loader -->
                <div
                    v-if="isShowLoading"
                    class="h-100 d-flex flex-column justify-content-center align-items-center"
                >
                    <img src="/static/img/loader-green.gif" class="standalone-loading" />
                </div>
            </div>

            <!-- Camera filter -->
            <b-dropdown
                dropleft
                no-caret
                class="w-100 object-filter-item"
                toggle-class="bg-transparent text-gray-300 border-none border-bottom border-top border-gray-500 text-left p-3 shadow-none"
                menu-class="bg-gray-900 border border-right-0 border-gray-500 has-treeselect"
            >
                <template slot="button-content">
                    <div
                        :class="{
                            'text-white font-weight-bold': isTreeSelectActive(filter.cameras)
                        }"
                    >
                        {{ $t('attendanceCamera.selectCamera') }} {{ filter.cameras.length }}/{{
                            maxCameraSelect
                        }}
                    </div>
                    <!-- <div
                        class="text-muted font-weight-normal small"
                        v-line-clamp="1"
                        v-if="isTreeSelectActive(filter.cameras)"
                    >{{ getCameraTreeSelectedText() }}</div>-->
                </template>
                <b-dropdown-form class="p-0 drop-to-top">
                    <treeselect
                        v-model="filter.cameras"
                        :multiple="true"
                        v-if="cameraTreeOptions"
                        :options="cameraTreeOptions"
                        always-open
                        :default-expand-level="1"
                        @input="updateFilter"
                        :noOptionsText="$t('cam.empty')"
                    />
                </b-dropdown-form>
            </b-dropdown>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState, mapMutations } from 'vuex';
import Treeselect from '@riophae/vue-treeselect';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
import Clock from '@/components/Clock';

export default {
    name: 'traffic-sidebar',
    components: { Treeselect, Clock },
    props: {
        eventCountLevel: {
            type: Array,
            default: () => []
        }
    },
    mounted: function() {
        this.$nextTick(async function() {
            this.isShowLoading = true;
            await this.getListZones();
            this.isShowLoading = false;
            await this.getCameraList();
            this.getCameraTreeOptions();
            setTimeout(() => {
                // Load prevous selected cameras
                if (
                    this.currentUser.selectedTrafficCameras &&
                    this.currentUser.selectedTrafficCameras.length
                ) {
                    const previoutSelectedCameras = this.currentUser.selectedTrafficCameras.filter(
                        camera => camera
                    );
                    this.filter.cameras = previoutSelectedCameras
                        .filter(camera => camera.id)
                        .map(camera => camera.id)
                        .reverse();
                    this.$emit('doFilter', {
                        selectedCameras: previoutSelectedCameras
                    });
                }
            }, 300);
        });
    },
    data() {
        return {
            filter: {
                cameras: []
            },
            maxCameraSelect: 6,
            isShowLoading: true,
            fetchDataInterval: null,
            zonesTableFields: [
                {
                    thClass: 'd-none',
                    key: 'name'
                }
            ],
            zoneSelected: [],
            cameraTreeOptions: [],
            normalEventCount: 0,
            alertEventCount: 0,
            dangerEventCount: 0
        };
    },
    computed: {
        ...mapState({
            cameras: state => state.camera.items,
            zones: state => state.zone.items,
            currentUser: state => state.auth.currentUser
        }),
        totalReport() {
            if (this.eventCountLevel.length) {
                return this.eventCountLevel[0].count;
            } else return 0;
        }
    },
    methods: {
        ...mapActions({
            getCameraList: 'camera/getList',
            getListZones: 'zone/getListZones',
            getListZoneCamera: 'zone/getListZoneCamera'
        }),
        ...mapMutations({
            saveSelectedTrafficCameras: 'auth/SAVE_SELECTED_TRAFFIC_CAMERAS'
        }),
        // Camera filter
        getCameraTreeOptions(zoneCamera) {
            if (!zoneCamera) {
                this.cameraTreeOptions = this.cameras.map(item => ({
                    id: item.id,
                    label: item.name
                }));
            } else {
                this.cameraTreeOptions = this.cameras
                    .filter(item => zoneCamera.includes(item.id))
                    .map(item => ({
                        id: item.id,
                        label: item.name
                    }));
            }
        },
        getCameraTreeSelectedText() {
            const selected = this.cameraTreeOptions.filter(
                op => this.filter.cameras.indexOf(op.id) > -1
            );
            return selected.map(item => item.label).join(', ');
        },

        // Update filter
        updateFilter() {
            if (this.filter.cameras.length > this.maxCameraSelect) {
                this.filter.cameras.shift();
            }

            const selectedCameras = this.filter.cameras
                .map(cameraId => {
                    return this.cameras.find(camera => camera.id === cameraId);
                })
                .reverse();

            // Keep 2x1 layout
            if (selectedCameras.length > 0 && selectedCameras.length < this.maxCameraSelect) {
                for (let i = selectedCameras.length; i < this.maxCameraSelect; i++) {
                    selectedCameras.push({});
                }
            }
            // Save to store and localstorage
            this.saveSelectedTrafficCameras(selectedCameras);

            this.$emit('doFilter', {
                selectedCameras
            });
        },
        isTreeSelectActive(filterValue) {
            return filterValue.length > 0;
        },
        isFiltering() {
            return this.isTreeSelectActive(this.filter.cameras);
        },
        onZoneSelected(items) {
            this.zoneSelected = items;
        }
    },
    beforeDestroy() {
        if (this.fetchDataInterval) {
            clearInterval(this.fetchDataInterval);
        }
    },
    watch: {
        async zoneSelected() {
            if (this.zoneSelected.length > 0) {
                const zoneCamera = await this.getListZoneCamera({
                    zoneId: this.zoneSelected[0].id
                });
                this.getCameraTreeOptions(zoneCamera.map(item => item.cameraId));

                // auto select first 2 camera
                let count = 0;
                for (const camera of this.cameraTreeOptions) {
                    const position = this.filter.cameras.indexOf(camera.id);
                    if (position >= 0) this.filter.cameras.splice(position, 1);
                    this.filter.cameras.unshift(camera.id);
                    count++;
                    if (count > 5) break;
                }
                if (this.filter.cameras.length > 6) {
                    this.filter.cameras = this.filter.cameras.slice(0, 6);
                }
            } else {
                this.getCameraTreeOptions();
            }
        }
    }
};
</script>

<style lang="scss">
.att-alert_sidebar {
    .dropdown-menu {
        bottom: 0px !important;
    }
    .vue-treeselect__menu {
        border-bottom: none !important;
    }
}
</style>

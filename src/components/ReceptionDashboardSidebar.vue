<template>
    <div
        class="border-left border-gray-500 h-100 d-flex flex-column justify-content-between text-gray-300"
    >
        <div
            class="objects-filter-sidebar_filter-container h-100 overflow-y-auto d-flex flex-column"
        >
            <div class="p-2 text-center text-white border-bottom border-gray-500">
                <clock class="font-weight-bold"></clock>

                <h4 class="text-success text-uppercase font-weight-bold">
                    {{ $i18n.t('processMonitor.present') }}: {{ totalReport.presentTotal }}/{{
                        totalReport.total
                    }}
                </h4>

                <h4 class="text-danger text-uppercase font-weight-bold">
                    {{ $i18n.t('processMonitor.absent') }}: {{ totalReport.absentTotal }}/{{
                        totalReport.total
                    }}
                </h4>

                <h4 class="text-muted text-uppercase font-weight-bold">
                    {{ $i18n.t('processMonitor.brokenCam') }}: {{ totalReport.brokenTotal }}/{{
                        totalReport.total
                    }}
                </h4>
            </div>
            <div
                class="d-flex justify-content-between font-weight-bold text-white bg-dark"
                style="padding: 0.75rem;"
                v-if="!isShowLoading && regionTableData.length"
            >
                <div>{{ $i18n.t('processMonitor.region') }}</div>
                <div class="mr-2">{{ $i18n.t('processMonitor.present') }}</div>
            </div>
            <div class="flex-1 overflow-y-auto h-100">
                <b-table
                    v-if="!isShowLoading && regionTableData.length"
                    dark
                    :items="regionTableData"
                    :fields="regionTableFields"
                    class="mb-0"
                >
                    <template slot="district" slot-scope="data">
                        <span :class="getClassByRatio(data.item.present / data.item.total)">{{
                            data.item.district
                        }}</span>
                    </template>

                    <template slot="ward" slot-scope="data">
                        <span :class="getClassByRatio(data.item.present / data.item.total)">{{
                            data.item.ward
                        }}</span>
                    </template>

                    <template slot="present" slot-scope="data">
                        <span :class="getClassByRatio(data.item.present / data.item.total)"
                            >{{ data.item.present || 0 }}/{{ data.item.total || 0 }}</span
                        >
                    </template>
                </b-table>

                <div
                    v-if="!isShowLoading && !regionTableData.length"
                    class="h-100 d-flex flex-column justify-content-center align-items-center text-muted"
                >
                    {{ $i18n.t('processMonitor.noReceptionSchedule') }}
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
                toggle-class="bg-transparent text-gray-300 border-none border-top border-gray-500 text-left p-3 shadow-none"
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
                    <div
                        class="text-muted font-weight-normal small"
                        v-line-clamp="1"
                        v-if="isTreeSelectActive(filter.cameras)"
                    >
                        {{ getCameraTreeSelectedText() }}
                    </div>
                </template>
                <b-dropdown-form class="p-0 drop-to-top">
                    <treeselect
                        v-model="filter.cameras"
                        :multiple="true"
                        :options="getCameraTreeOptions()"
                        always-open
                        :default-expand-level="1"
                        @input="updateFilter"
                    />
                </b-dropdown-form>
            </b-dropdown>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import Treeselect from '@riophae/vue-treeselect';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
import CONSTANTS from '@/constants';
import Clock from '@/components/Clock';
import _ from 'lodash';

export default {
    name: 'reception-dashboard-sidebar',
    components: { Treeselect, Clock },
    props: {
        maxSelectedCam: {
            type: Number,
            default: 2
        },
        selectedCamId: {
            type: Number
        }
    },
    mounted: function() {
        this.$nextTick(async function() {
            await this.reloadData();

            setTimeout(() => {
                // Load prevous selected cameras
                if (
                    this.currentUser.selectedReceptionCameras &&
                    this.currentUser.selectedReceptionCameras.length
                ) {
                    const previoutSelectedCameras = this.currentUser.selectedReceptionCameras.filter(
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
            }, 100);
        });
    },
    watch: {
        selectedCamId(value) {
            if (value && this.filter.cameras.indexOf(value) === -1) {
                this.filter.cameras.push(value);
                this.updateFilter();
            }
        }
    },
    data() {
        return {
            filter: {
                cameras: []
            },
            maxCameraSelect: this.maxSelectedCam || 2,
            isShowLoading: true,
            fetchDataInterval: null,
            regionTableFields: [
                {
                    thClass: 'd-none',
                    key: 'district'
                },
                {
                    thClass: 'd-none',
                    key: 'ward'
                },
                {
                    thClass: 'd-none',
                    tdClass: 'text-center',
                    key: 'present'
                }
            ]
        };
    },
    computed: {
        ...mapState({
            receptionCameras: state => state.reception.receptionCameras,
            currentUser: state => state.auth.currentUser
        }),
        sortedCameraList() {
            const cameras = this.receptionCameras
                .map(camera => {
                    return {
                        ...camera,
                        district: camera.district ? camera.district.trim() : 'default',
                        ward: camera.ward ? camera.ward.trim() : 'default'
                    };
                })
                .sort((cam1, cam2) => {
                    if (cam1.district === 'default') {
                        return -1;
                    } else if (cam2.district === 'default') {
                        return 1;
                    } else if (cam1.district.localeCompare(cam2.district) === 0) {
                        if (cam1.ward === 'default') {
                            return -1;
                        } else if (cam2.ward === 'default') {
                            return 1;
                        } else {
                            return cam1.ward.localeCompare(cam2.ward);
                        }
                    } else {
                        return cam1.district.localeCompare(cam2.district);
                    }
                });
            return cameras;
        },
        regionTableData() {
            const regionData = [];

            const regions = _.groupBy(
                this.sortedCameraList.filter(
                    camera => camera.status !== CONSTANTS.RECEPTION_CAMERA_STATUSES.NO_SCHEDULE
                ),
                camera => `${camera.district}???${camera.ward}`
            );
            for (const regionName in regions) {
                if (regions.hasOwnProperty(regionName)) {
                    const regionNameArr = regionName.split('???');
                    regionData.push({
                        district: regionNameArr[0] === 'default' ? '' : regionNameArr[0],
                        ward: regionNameArr[1] === 'default' ? '' : regionNameArr[1],
                        present: regions[regionName].filter(
                            camera => camera.status === CONSTANTS.RECEPTION_CAMERA_STATUSES.PRESENT
                        ).length,
                        absent: regions[regionName].filter(
                            camera => camera.status === CONSTANTS.RECEPTION_CAMERA_STATUSES.ABSENT
                        ).length,
                        broken: regions[regionName].filter(
                            camera => camera.status === CONSTANTS.RECEPTION_CAMERA_STATUSES.BROKEN
                        ).length,
                        total: regions[regionName].length
                    });
                }
            }
            return regionData;
        },
        totalReport() {
            let total = 0;
            let presentTotal = 0;
            let absentTotal = 0;
            let brokenTotal = 0;
            this.regionTableData.forEach(region => {
                total += region.total;
                presentTotal += region.present;
                absentTotal += region.absent;
                brokenTotal += region.broken;
            });
            return {
                total,
                presentTotal,
                absentTotal,
                brokenTotal
            };
        }
    },
    methods: {
        ...mapActions({
            getReceptionCameras: 'reception/getReceptionCameras',
            saveSelectedReceptionCameras: 'auth/saveSelectedReceptionCameras'
        }),
        // Camera filter
        getCameraTreeOptions() {
            return this.sortedCameraList.map(item => ({
                id: item.id,
                label: item.name
            }));
        },
        getCameraTreeSelectedText() {
            const options = this.getCameraTreeOptions();
            const selected = options.filter(op => this.filter.cameras.indexOf(op.id) > -1);
            return selected.map(item => item.label).join(', ');
        },

        // Update filter
        updateFilter() {
            if (this.filter.cameras.length > this.maxCameraSelect) {
                this.filter.cameras.shift();
            }

            const selectedCameras = this.filter.cameras
                .map(cameraId => {
                    return this.receptionCameras.find(camera => camera.id === cameraId);
                })
                .reverse();

            // Keep maxCameraSelectx1 layout
            if (selectedCameras.length > 0 && selectedCameras.length < this.maxCameraSelect) {
                for (let i = selectedCameras.length; i < this.maxCameraSelect; i++) {
                    selectedCameras.push({});
                }
            }

            // Save to store and localstorage
            this.saveSelectedReceptionCameras(selectedCameras);

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
        async reloadData() {
            if (this.fetchDataInterval) {
                clearInterval(this.fetchDataInterval);
            }
            this.fetchDataInterval = setInterval(async () => {
                this.getReceptionCameras();
            }, CONSTANTS.RECEPTION_INTERVAL);
            this.isShowLoading = true;
            await this.getReceptionCameras();
            this.isShowLoading = false;
        },
        getClassByRatio(ratio) {
            if (ratio < 0.5) {
                return 'text-danger';
            } else if (ratio < 0.8) {
                return 'text-warning';
            } else {
                return 'text-success';
            }
        }
    },
    beforeDestroy() {
        if (this.fetchDataInterval) {
            clearInterval(this.fetchDataInterval);
        }
    }
};
</script>

<style lang="scss" scoped></style>

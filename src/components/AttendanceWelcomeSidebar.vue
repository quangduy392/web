<template>
    <div
        class="border-left border-gray-500 h-100 d-flex flex-column justify-content-between text-gray-300"
    >
        <div
            class="objects-filter-sidebar_filter-container h-100 overflow-y-auto d-flex flex-column"
        >
            <div class="p-2 text-center text-white border-bottom border-gray-500">
                <clock class="font-weight-bold" style="font-size: 18px;"></clock>

                <!-- <h4 class="text-success text-uppercase font-weight-bold" @click="toDetailToday()">
                    {{ $i18n.t('attendanceCamera.present') }}: {{ totalReport.presentTotal }}/{{
                    totalReport.total
                    }}
                </h4>-->
                <router-link
                    tag="h4"
                    class="text-success text-uppercase font-weight-bold"
                    to="/attendance/detailtoday"
                    :style="{ color: colorSS }"
                    @mouseover="changeColor()"
                >
                    {{ $i18n.t('attendanceCamera.present') }}: {{ totalReport.presentTotal }}/{{
                        totalReport.total
                    }}
                </router-link>
                <h4 class="text-danger text-uppercase font-weight-bold">
                    {{ $i18n.t('attendanceCamera.absent') }}:
                    {{ totalReport.total - totalReport.presentTotal }}/{{ totalReport.total }}
                </h4>
            </div>
            <div
                class="d-flex justify-content-between font-weight-bold text-white bg-dark"
                style="padding: 0.75rem;"
                v-if="!isShowLoading && groupPresentReport.length"
            >
                <div v-show="showlist">{{ $t('attendanceCamera.group') }}</div>
                <div v-show="showlist" class="mr-2">{{ $t('attendanceCamera.attendance') }}</div>
            </div>
            <div class="flex-1 overflow-y-auto h-100">
                <b-table
                    v-if="!isShowLoading && groupPresentReport.length"
                    dark
                    :items="groupPresentReport"
                    :fields="attendanceTableFields"
                    class="mb-0"
                >
                    <template slot="group" slot-scope="data">
                        <span
                            :class="getClassByAttendanceRatio(data.item.present / data.item.total)"
                            >{{ data.item.group }}</span
                        >
                    </template>

                    <template slot="attendance" slot-scope="data">
                        <span
                            :class="getClassByAttendanceRatio(data.item.present / data.item.total)"
                            >{{ data.item.present || 0 }}/{{ data.item.total || 0 }}</span
                        >
                    </template>
                </b-table>

                <!-- event list -->
                <div
                    v-if="!isShowLoading && !groupPresentReport.length"
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

export default {
    name: 'attendance-welcome-sidebar',
    components: { Treeselect, Clock },
    mounted: function() {
        this.$nextTick(async function() {
            this.getCameraList();
            this.getProfileList();
            await this.reloadData();

            setTimeout(() => {
                // Load prevous selected cameras
                if (
                    this.currentUser.selectedAttCamerasWelcome &&
                    this.currentUser.selectedAttCamerasWelcome.length
                ) {
                    const previoutSelectedCameras = this.currentUser.selectedAttCamerasWelcome.filter(
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
            maxCameraSelect: 1,
            isShowLoading: true,
            fetchDataInterval: null,
            attendanceTableFields: [
                {
                    thClass: 'd-none',
                    key: 'group'
                },
                {
                    thClass: 'd-none',
                    tdClass: 'text-center',
                    key: 'attendance'
                }
            ],
            showlist: true,
            fields: ['first', 'last', 'age'],
            items: [
                { age: 40, first: 'Dickerson', last: 'Macdonald' },
                { age: 21, first: 'Larsen', last: 'Shaw' },
                { age: 89, first: 'Geneva', last: 'Wilson' },
                { age: 38, first: 'Jami', last: 'Carney' }
            ],
            colorSS: 'green'
        };
    },
    computed: {
        ...mapState({
            cameras: state => state.camera.items,
            groupPresentReport: state => state.attendance.groupPresentReport,
            currentUser: state => state.auth.currentUser
        }),
        totalReport() {
            let total = 0;
            let presentTotal = 0;
            this.groupPresentReport.forEach(group => {
                total += group.total;
                presentTotal += group.present;
            });
            return {
                total,
                presentTotal
            };
        },
        customColor: function() {
            return {
                color: 'Blue'
            };
        }
    },
    methods: {
        ...mapActions({
            getCameraList: 'camera/getList',
            getProfileList: 'profile/getList',
            getGroupPresentReport: 'attendance/getGroupPresentReport',
            saveSelectedAttWelcomeCamera: 'auth/saveSelectedAttWelcomeCamera'
        }),
        // Camera filter
        getCameraTreeOptions() {
            return this.cameras.map(item => ({
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
            this.saveSelectedAttWelcomeCamera(selectedCameras);

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
                await this.getGroupPresentReport();
            }, CONSTANTS.ATTENDANCE_EVENT_INTERVAL);
            this.isShowLoading = true;
            await this.getGroupPresentReport();
            this.isShowLoading = false;
        },
        getClassByAttendanceRatio(ratio) {
            if (ratio < 0.5) {
                return 'text-danger';
            } else if (ratio < 0.8) {
                return 'text-warning';
            } else {
                return 'text-success';
            }
        },
        changeColor() {
            this.colorSS = 'blue';
        }
        // toDetailToday() {
        //     this.$Router.push('/attendance/detailtoday');
        // }
    },
    beforeDestroy() {
        if (this.fetchDataInterval) {
            clearInterval(this.fetchDataInterval);
        }
    }
};
</script>

<style lang="scss" scoped></style>

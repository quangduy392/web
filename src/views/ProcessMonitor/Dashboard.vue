<template>
    <div class="animated fadeIn h-100">
        <sub-header hideBreadcrumb>
            <template slot="sub-header-left">
                <b-navbar-nav class="d-flex flex-row">
                    <b-nav-item class="text-nowrap" active>
                        {{ $t('processMonitor.commonTitle') }}
                    </b-nav-item>
                </b-navbar-nav>
            </template>
            <template slot="sub-header-middle"></template>
        </sub-header>

        <div class="page-content sub-header-page-content">
            <div class="d-flex h-100">
                <div class="h-100 pr-0 overflow-y-auto flex-1 px-1 py-2">
                    <div v-if="selectedCameras.length" class="mih-100 d-flex flex-column">
                        <b-row class="mx-0">
                            <b-col
                                cols="4"
                                v-for="(camera, index) in selectedCameras"
                                :key="camera.id"
                                class="px-1 mb-2"
                            >
                                <cam-live-view :camera="camera"></cam-live-view>
                            </b-col>
                        </b-row>

                        <b-row class="mb-2 mx-0" v-if="events.length">
                            <b-col
                                cols="2"
                                v-for="(event, index) in events"
                                :key="event.id"
                                class="px-1"
                            >
                                <!-- Event list -->
                                <EventItem
                                    :event="event"
                                    hideTools
                                    @changeVideo="changeEventVideo"
                                />
                            </b-col>
                        </b-row>

                        <b-row class="flex-grow-1 mx-0">
                            <b-col class="px-1">
                                <div class="h-100 border border-gray-500 p-2 d-flex flex-column">
                                    <div class="d-flex mb-2 pb-2 border-bottom border-gray-500">
                                        <h5 class="text-uppercase flex-1 mb-0">
                                            {{
                                                $i18n.t('processMonitor.entireProvinceReport.title')
                                            }}
                                        </h5>
                                    </div>
                                    <div class="flex-1 d-flex flex-column">
                                        <table
                                            class="table table-borderless table-sm table-striped mb-0 text-white"
                                        >
                                            <tr
                                                v-if="
                                                    !hasScheduledDistrics.length &&
                                                        !hasScheduledWards.length
                                                "
                                            >
                                                <td class="font-weight-bold">
                                                    {{
                                                        $i18n.t(
                                                            'processMonitor.noReceptionSchedule'
                                                        )
                                                    }}
                                                </td>
                                                <td></td>
                                            </tr>

                                            <tr v-if="hasScheduledDistrics.length">
                                                <td class="font-weight-bold">
                                                    {{ $i18n.t('processMonitor.inReceiving') }}
                                                </td>
                                                <td>
                                                    {{ districtPresentNumber }}
                                                    {{ $i18n.t('processMonitor.district') }}
                                                </td>
                                            </tr>

                                            <tr v-if="hasScheduledWards.length">
                                                <td class="font-weight-bold">
                                                    {{ $i18n.t('processMonitor.inReceiving') }}
                                                </td>
                                                <td>
                                                    {{ wardPresentNumber }}
                                                    {{ $i18n.t('processMonitor.ward') }}
                                                </td>
                                            </tr>

                                            <tr>
                                                <td class="font-weight-bold">
                                                    {{
                                                        $i18n.t(
                                                            'processMonitor.entireProvinceReport.avgReceptionTime'
                                                        )
                                                    }}
                                                </td>
                                                <td>
                                                    {{
                                                        Math.floor(
                                                            entireProvinceReport.avgReceptionTime /
                                                                60
                                                        ) > 0
                                                            ? `${Math.floor(
                                                                  entireProvinceReport.avgReceptionTime /
                                                                      60
                                                              )} ${$i18n.t('processMonitor.hour')}`
                                                            : ''
                                                    }}
                                                    {{
                                                        Math.floor(
                                                            entireProvinceReport.avgReceptionTime
                                                        ) % 60
                                                    }}
                                                    {{ $i18n.t('processMonitor.minute') }}
                                                </td>
                                            </tr>

                                            <tr>
                                                <td class="font-weight-bold">
                                                    {{
                                                        $i18n.t(
                                                            'processMonitor.entireProvinceReport.avgReceptionRate'
                                                        )
                                                    }}
                                                </td>
                                                <td>
                                                    {{
                                                        (
                                                            entireProvinceReport.avgReceptionRate *
                                                            100
                                                        ).toFixed(0)
                                                    }}%
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                </div>
                            </b-col>

                            <b-col class="px-1">
                                <div class="h-100 border border-gray-500 p-2 d-flex flex-column">
                                    <div class="d-flex mb-2 pb-2 border-bottom border-gray-500">
                                        <h5 class="text-uppercase flex-1 mb-0 text-success">
                                            {{ $i18n.t('processMonitor.highestPresent') }}
                                        </h5>
                                    </div>
                                    <div class="flex-1">
                                        <b-table
                                            borderless
                                            small
                                            striped
                                            :items="
                                                [...sortedReceptionTimes]
                                                    .reverse()
                                                    .slice(0, topRegionsNumber)
                                            "
                                            class="mb-0 text-white"
                                            :fields="topRegionTableFields"
                                        >
                                            <template slot="presentTime" slot-scope="data">
                                                {{
                                                    Math.floor(data.item.presentTime / 60) > 0
                                                        ? `${Math.floor(
                                                              data.item.presentTime / 60
                                                          )} ${$i18n.t('processMonitor.hour')}`
                                                        : ''
                                                }}
                                                {{ data.item.presentTime % 60 }}
                                                {{ $i18n.t('processMonitor.minute') }}
                                            </template>
                                        </b-table>
                                    </div>
                                </div>
                            </b-col>

                            <b-col class="px-1">
                                <div class="h-100 border border-gray-500 p-2 d-flex flex-column">
                                    <div class="d-flex mb-2 pb-2 border-bottom border-gray-500">
                                        <h5 class="text-uppercase flex-1 mb-0 text-danger">
                                            {{ $i18n.t('processMonitor.lowestPresent') }}
                                        </h5>
                                    </div>
                                    <div class="flex-1">
                                        <b-table
                                            borderless
                                            small
                                            striped
                                            :items="sortedReceptionTimes.slice(0, topRegionsNumber)"
                                            class="mb-0 text-white"
                                            :fields="topRegionTableFields"
                                        >
                                            <template slot="presentTime" slot-scope="data">
                                                {{
                                                    Math.floor(data.item.presentTime / 60) > 0
                                                        ? `${Math.floor(
                                                              data.item.presentTime / 60
                                                          )} ${$i18n.t('processMonitor.hour')}`
                                                        : ''
                                                }}
                                                {{ data.item.presentTime % 60 }}
                                                {{ $i18n.t('processMonitor.minute') }}
                                            </template>
                                        </b-table>
                                    </div>
                                </div>
                            </b-col>
                        </b-row>
                    </div>

                    <div
                        v-if="!selectedCameras.length"
                        class="h-100 d-flex flex-column justify-content-center align-items-center text-center"
                    >
                        <h4>{{ $i18n.t('attendanceCamera.noSelectedVideo') }}</h4>
                        {{ $i18n.t('attendanceCamera.pleaseSelectVideo') }}
                    </div>
                </div>
                <div class="att-cam_sidebar h-100">
                    <reception-dashboard-sidebar
                        @doFilter="updateSelectedCameraList"
                        :maxSelectedCam="6"
                    ></reception-dashboard-sidebar>
                </div>
            </div>
        </div>

        <!-- Event detail modal -->
        <b-modal
            id="modal-video"
            hide-footer
            hide-header
            centered
            size="lg"
            body-class="p-0 d-flex justify-content-center align-items-center video-modal-border"
        >
            <video controls autoplay width="100%" height="auto" :poster="novideo">
                <source :src="eventVideoSrc" type="video/mp4" />
            </video>
            <div style="position: absolute; top: 9px; left:15px;" class="event-text-color">
                <div>{{ getCameraName(selectedEvent.cameraId) }}</div>
                <div>{{ selectedEvent.createdAt | formatDateTime }}</div>
            </div>
            <span
                style="position: absolute; top: 3px; max-width: 46%"
                class="event-text-color text-center"
                >{{ selectedEvent.text }}</span
            >
            <span style="position: absolute; top: 2px; right:5px; z-index: 1">
                <i
                    @click="$bvModal.hide('modal-video')"
                    class="fa fa-lg fa-times cursor-pointer"
                ></i>
            </span>
            <img
                style="position: absolute; top:20px; right: 20px;"
                class="border border-dark"
                height="30%"
                v-if="selectedEvent.image"
                :src="BASE_URL + selectedEvent.image.replace(/\/api/g, '')"
            />
        </b-modal>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
import CONSTANTS from '@/constants';
import getAlertEventImageUrl from '@/utils/getAlertEventImageUrl';
import API_CONFIG from '@/api-config';
import ReceptionDashboardSidebar from '@/components/ReceptionDashboardSidebar';
import EventItem from '@/components/EventItem.vue';
import CamLiveView from '@/components/CamLiveView';

export default {
    components: {
        ReceptionDashboardSidebar,
        EventItem,
        CamLiveView
    },
    mounted: function() {
        this.$nextTick(function() {
            this.getEventTypeList();
        });
    },
    computed: {
        ...mapState({
            receptionCameras: state => state.reception.receptionCameras
        }),
        sortedReceptionTimes() {
            let receptionTitleTotal = 0;
            const cameras = this.receptionCameras
                .filter(camera => camera.status !== CONSTANTS.RECEPTION_CAMERA_STATUSES.NO_SCHEDULE)
                .map(camera => {
                    receptionTitleTotal += camera.presentTime;
                    return {
                        ...camera,
                        district: camera.district ? camera.district.trim() : 'default',
                        ward: camera.ward ? camera.ward.trim() : 'default'
                    };
                });

            this.hasScheduledDistrics = cameras.filter(
                camera => camera.district !== 'default' && camera.ward === 'default'
            );
            this.districtPresentNumber = this.hasScheduledDistrics.filter(
                camera => camera.status === CONSTANTS.RECEPTION_CAMERA_STATUSES.PRESENT
            ).length;

            this.hasScheduledWards = cameras.filter(
                camera => camera.district !== 'default' && camera.ward !== 'default'
            );
            this.wardPresentNumber = this.hasScheduledWards.filter(
                camera => camera.status === CONSTANTS.RECEPTION_CAMERA_STATUSES.PRESENT
            ).length;

            const regionData = [];

            const regions = _.groupBy(cameras, camera => `${camera.district}???${camera.ward}`);
            for (const regionName in regions) {
                if (regions.hasOwnProperty(regionName)) {
                    let presentTime = 0;
                    regions[regionName].forEach(camera => {
                        presentTime += camera.presentTime;
                    });

                    const regionNameArr = regionName.split('???');
                    regionData.push({
                        district: regionNameArr[0] === 'default' ? '' : regionNameArr[0],
                        ward: regionNameArr[1] === 'default' ? '' : regionNameArr[1],
                        presentTime: Math.floor(presentTime / regions[regionName].length) // average time each camera
                    });
                }
            }

            this.entireProvinceReport.avgReceptionTime = receptionTitleTotal / cameras.length;
            this.entireProvinceReport.avgReceptionRate =
                this.entireProvinceReport.avgReceptionTime / 6 / 60; // Fix 6 hours per day

            return _.sortBy(regionData, 'presentTime');
        }
    },
    data() {
        return {
            BASE_URL: API_CONFIG.BASE_URL,
            isShowLoading: true,
            selectedCameras: [],
            events: [],
            novideo: '',
            fetchDataInterval: null,
            selectedEvent: {},
            eventVideoSrc: '',
            topRegionsNumber: CONSTANTS.RECEPTION_TOP_REGION_COUNT,
            topRegionTableFields: [
                {
                    key: 'district',
                    label: this.$t('processMonitor.district')
                },
                {
                    key: 'ward',
                    label: this.$t('processMonitor.ward')
                },
                {
                    thClass: 'text-center',
                    tdClass: 'text-center',
                    key: 'presentTime',
                    label: 'Thời gian có mặt'
                }
            ],
            entireProvinceReport: {},
            hasScheduledDistrics: [],
            hasScheduledWards: [],
            districtPresentNumber: 0,
            wardPresentNumber: 0
        };
    },
    methods: {
        ...mapActions({
            getNewestEventList: 'event/getNewestEventNoCommit',
            getEventTypeList: 'event/getEventTypes'
        }),
        getAlertEventImageUrl,
        async updateSelectedCameraList({ selectedCameras }) {
            this.selectedCameras = selectedCameras;
            await this.reloadData();
        },
        async reloadData() {
            if (this.fetchDataInterval) {
                clearInterval(this.fetchDataInterval);
            }
            this.fetchDataInterval = setInterval(async () => {
                this.fetchEventList();
            }, CONSTANTS.RECEPTION_INTERVAL);
            this.isShowLoading = true;
            await this.fetchEventList();
            this.isShowLoading = false;
        },
        async fetchEventList() {
            const response = await Promise.all(
                this.selectedCameras.map(camera => {
                    if (camera.id) {
                        return this.getNewestEventList({
                            count: CONSTANTS.RECEPTION_MAX_EVENT,
                            cameraId: camera.id
                        });
                    } else {
                        return [];
                    }
                })
            );
            this.events = _.sortBy(_.flatten(response), 'createdAt', 'asc')
                .reverse()
                .slice(0, CONSTANTS.RECEPTION_MAX_EVENT);
        },
        getCameraName(id) {
            const camera = this.receptionCameras.find(el => el.id === id);
            if (camera) return camera.name;
        },
        changeEventVideo(event) {
            this.selectedEvent = event;
            this.eventVideoSrc = `${this.BASE_URL}event-image/${event.id}/video.mp4`;
            this.novideo = `${API_CONFIG.BASE_URL}event-image/${event.id}/snapshot.jpg`;
        }
    },
    beforeDestroy() {
        if (this.fetchDataInterval) {
            clearInterval(this.fetchDataInterval);
        }
    }
};
</script>

<style lang="scss" scoped>
.event-text-color {
    color: lime;
    background-color: rgba(0, 0, 0, 0.6);
}
</style>

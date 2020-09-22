<template>
    <div class="animated fadeIn h-100">
        <sub-header hideBreadcrumb>
            <template slot="sub-header-left">
                <b-navbar-nav class="d-flex flex-row">
                    <b-nav-item class="text-nowrap" active>{{
                        $t('peopleCount.commonTitle')
                    }}</b-nav-item>
                </b-navbar-nav>
            </template>
            <template slot="sub-header-middle"></template>
        </sub-header>

        <div class="page-content sub-header-page-content">
            <div class="d-flex h-100">
                <div class="h-100 pr-0 overflow-y-auto flex-1 p-2">
                    <div v-if="selectedCameras.length" class="mih-100 d-flex flex-column">
                        <b-row class="mb-2 mx-0">
                            <b-col
                                v-for="(camera, index) in selectedCameras"
                                :key="camera.id"
                                class="px-1"
                            >
                                <div class="ratio-16-9 position-relative border border-gray-500">
                                    <div
                                        class="obsolute-full overflow-hidden"
                                        v-if="camera.liveUrl"
                                    >
                                        <b-img :src="camera.liveUrl" class="w-100"></b-img>

                                        <i
                                            @click="() => openVideoModal(camera.liveUrl)"
                                            class="icon-size-fullscreen icons font-2xl"
                                            style="position: absolute; bottom: 10px; right: 10px; font-weight: bold; cursor: pointer;"
                                        ></i>
                                    </div>

                                    <div
                                        v-if="!camera.liveUrl"
                                        class="obsolute-full d-flex justify-content-center align-items-center text-muted"
                                    >
                                        {{ $i18n.t('attendanceCamera.noVideo') }}
                                    </div>

                                    <div
                                        v-if="camera.name"
                                        class="position-absolute"
                                        style="top: 0; right: 0; background: rgba(0, 0, 0, 0.6); padding: 6px 10px;"
                                    >
                                        {{ camera.name }}
                                    </div>
                                </div>
                            </b-col>
                        </b-row>

                        <b-row class="mb-2 mx-0" v-if="events.length">
                            <b-col
                                cols="3"
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
                                            {{ $t('attendanceCamera.attendanceStatus') }}
                                        </h5>
                                        <router-link to="/people-count/report/summary">
                                            {{ $t('attendanceCamera.seeMore') }}
                                            <i
                                                class="fa fa-arrow-circle-right"
                                                aria-hidden="true"
                                            ></i>
                                        </router-link>
                                    </div>
                                    <div class="flex-1">
                                        <table class="table mb-0">
                                            <thead>
                                                <tr>
                                                    <th class="text-white">
                                                        {{ $t('report.date') }}
                                                    </th>
                                                    <th class="text-white">
                                                        {{ $t('report.comeIn') }}
                                                    </th>
                                                    <th class="text-white">
                                                        {{ $t('report.comeOut') }}
                                                    </th>
                                                    <th class="text-white">
                                                        {{ $t('report.sum') }}
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="(item, index) in summaryInfo">
                                                    <td class="text-white">{{ item.date }}</td>
                                                    <td class="txtComeIn">{{ item.comeIn }}</td>
                                                    <td class="txtComeOut">{{ item.comeOut }}</td>
                                                    <td class="txtSum">{{ item.sum }}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </b-col>

                            <b-col class="px-1">
                                <div class="h-100 border border-gray-500 p-2 d-flex flex-column">
                                    <div class="d-flex mb-2 pb-2 border-bottom border-gray-500">
                                        <h5 class="text-uppercase flex-1 mb-0">
                                            {{ $t('common.listFollow') }}
                                        </h5>
                                        <router-link to="/attendance/stranger">
                                            {{ $i18n.t('attendanceCamera.seeMore') }}
                                            <i
                                                class="fa fa-arrow-circle-right"
                                                aria-hidden="true"
                                            ></i>
                                        </router-link>
                                    </div>
                                    <div class="flex-1 d-flex flex-column">
                                        <b-row v-if="strangers.length">
                                            <b-col
                                                cols="2"
                                                v-for="(stranger, index) in strangers"
                                                :key="index"
                                            >
                                                <StrangerItem :data="stranger" hideTools />
                                            </b-col>
                                        </b-row>
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
                <div class="att-cam_sidebar att-alert_sidebar h-100">
                    <count-people-sidebar
                        @doFilter="updateSelectedCameraList"
                    ></count-people-sidebar>
                </div>
            </div>
        </div>

        <!-- video modal -->
        <b-modal
            ref="videoModal"
            hide-header
            hide-footer
            size="xl"
            centered
            body-class="border border-gray-500 p-0"
        >
            <div class="ratio-16-9 position-relative">
                <div
                    class="obsolute-full d-flex flex-column justify-content-center align-items-center"
                >
                    <img src="/static/img/loader-green.gif" class="standalone-loading" />
                </div>
                <div class="obsolute-full overflow-hidden">
                    <b-img :src="modalVideoUrl" class="w-100"></b-img>
                </div>
            </div>
        </b-modal>

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
import AttendanceSubNavbarNav from '../Attendance/SubNavbarNav';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
import CONSTANTS from '@/constants';
import getAlertEventImageUrl from '@/utils/getAlertEventImageUrl';
import API_CONFIG from '@/api-config';
import CountPeopleSidebar from '@/components/CountPeopleSidebar';
import EventItem from '@/components/EventItem.vue';
import StrangerItem from '@/components/StrangerItem.vue';
import moment from 'moment-timezone';

export default {
    components: {
        AttendanceSubNavbarNav,
        CountPeopleSidebar,
        EventItem,
        StrangerItem
    },
    mounted: function() {
        this.$nextTick(function() {
            this.resetAttendanceData();
            this.getEventTypeList();
        });
    },
    computed: {
        ...mapState({
            cameras: state => state.camera.items,
            statisticSummaryReport: state => state.countPeople.statisticSummaryReport
        })
    },
    data() {
        return {
            BASE_URL: API_CONFIG.BASE_URL,
            isShowLoading: true,
            selectedCameras: [],
            events: [],
            novideo: '',
            strangers: [],
            fetchDataInterval: null,
            selectedEvent: {},
            eventVideoSrc: '',
            modalVideoUrl: null,
            summaryInfo: []
        };
    },
    methods: {
        ...mapActions({
            getNewestEventList: 'event/getNewestEventListReplace',
            resetAttendanceData: 'attendance/resetData',
            getTodayStatistic: 'countPeople/getTodayStatistic',
            getEventTypeList: 'event/getEventTypes',
            getNewestStrangerListReplace: 'stranger/getNewestStrangerListReplace',
            getStatisticSummaryReport: 'countPeople/getStatisticSummaryReport'
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
                this.getTodayStatistic();
                this.getReportData();
            }, CONSTANTS.ATTENDANCE_EVENT_INTERVAL);
            this.isShowLoading = true;
            await this.fetchEventList();
            await this.getTodayStatistic();
            this.getReportData();
            this.isShowLoading = false;
        },
        async fetchEventList() {
            const response = await Promise.all(
                this.selectedCameras.map(camera => {
                    if (camera.id) {
                        return this.getNewestEventList({
                            count: CONSTANTS.MAX_ATTENDANCE_EVENT,
                            cameraId: camera.id
                        });
                    } else {
                        return [];
                    }
                })
            );
            this.events = _.sortBy(_.flatten(response), 'createdAt', 'asc')
                .reverse()
                .slice(0, CONSTANTS.MAX_ATTENDANCE_EVENT);
        },
        async fetchStangerList() {
            const response = await Promise.all(
                this.selectedCameras.map(camera => {
                    if (camera.id) {
                        return this.getNewestStrangerListReplace({
                            count: CONSTANTS.MAX_ATTENDANCE_STRANGER,
                            cameraId: camera.id
                        });
                    } else {
                        return [];
                    }
                })
            );
            this.strangers = _.sortBy(_.flatten(response), 'createdAt', 'asc')
                .reverse()
                .slice(0, CONSTANTS.MAX_ATTENDANCE_STRANGER);
        },
        getCameraName(id) {
            const camera = this.cameras.find(el => el.id === id);
            if (camera) return camera.name;
        },
        changeEventVideo(event) {
            this.selectedEvent = event;
            this.eventVideoSrc = `${this.BASE_URL}event-image/${event.id}/video.mp4`;
            this.novideo = `${API_CONFIG.BASE_URL}event-image/${event.id}/snapshot.jpg`;
        },
        openVideoModal(modalVideoUrl) {
            this.modalVideoUrl = modalVideoUrl;
            this.$refs.videoModal.show();
        },
        getReportData() {
            const body = {
                from: moment()
                    .subtract(10, 'days')
                    .format('YYYY-MM-DD'),
                to: moment()
                    .add(1, 'days')
                    .format('YYYY-MM-DD')
            };
            this.getStatisticSummaryReport(body);
        }
    },
    watch: {
        statisticSummaryReport() {
            this.summaryInfo = [];
            const map = _.groupBy(this.statisticSummaryReport, 'date');
            const listKeys = _.sortBy(_.keys(map), item => {
                return -moment(item, 'YYYY-MM-DD');
            }).slice(0, 3);
            for (const date of listKeys) {
                let comeIn = 0;
                let comeOut = 0;
                if (map[date]) {
                    for (const item of map[date]) {
                        if (item.comeIn) comeIn += item.comeIn;
                        if (item.comeOut) comeOut += item.comeOut;
                    }
                }
                this.summaryInfo.push({ date, comeIn, comeOut, sum: comeIn + comeOut });
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

<style lang="scss" scoped>
.event-text-color {
    color: lime;
    background-color: rgba(0, 0, 0, 0.6);
}
.table th,
.table td {
    border-top: none;
}
.table thead th {
    border-width: 1px;
    width: 25%;
}
</style>

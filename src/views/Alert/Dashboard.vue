<template>
    <div class="animated fadeIn h-100">
        <sub-header hideBreadcrumb>
            <template slot="sub-header-left">
                <b-navbar-nav class="d-flex flex-row">
                    <b-nav-item class="text-nowrap" active>
                        {{ $t('alert.commonTitle') }}
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
                                v-for="(camera, index) in selectedCameras"
                                :key="camera.id"
                                class="px-1 mb-2"
                                :cols="4"
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
                                            {{ $i18n.t('attendanceCamera.attendanceStatus') }}
                                        </h5>
                                        <router-link to="/alert/event">
                                            {{ $i18n.t('attendanceCamera.seeMore') }}
                                            <i
                                                class="fa fa-arrow-circle-right"
                                                aria-hidden="true"
                                            ></i>
                                        </router-link>
                                    </div>
                                    <div class="flex-1">
                                        <div
                                            v-for="(item, index) in attendanceStatus"
                                            :key="index"
                                            class="mb-1 font-16"
                                            :class="
                                                !item.level
                                                    ? ''
                                                    : item.level === 1
                                                    ? 'text-success'
                                                    : item.level === 2
                                                    ? 'text-warning'
                                                    : 'text-danger'
                                            "
                                        >
                                            {{ item.name }}
                                        </div>
                                    </div>
                                </div>
                            </b-col>

                            <b-col class="px-1">
                                <div class="h-100 border border-gray-500 p-2 d-flex flex-column">
                                    <div class="d-flex mb-2 pb-2 border-bottom border-gray-500">
                                        <h5 class="text-uppercase flex-1 mb-0">
                                            {{ $t('common.listFollow') }}
                                        </h5>
                                        <router-link to="/alert/manage/profile">
                                            {{ $i18n.t('attendanceCamera.seeMore') }}
                                            <i
                                                class="fa fa-arrow-circle-right"
                                                aria-hidden="true"
                                            ></i>
                                        </router-link>
                                    </div>
                                    <div class="flex-1 d-flex flex-column">
                                        <b-row v-if="listProfiles.length">
                                            <b-col
                                                cols="2"
                                                v-for="(profile, index) in listProfiles"
                                                :key="index"
                                            >
                                                <SuspectItem :data="profile" hideTools />
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
                    <alert-sidebar
                        @doFilter="updateSelectedCameraList"
                        :eventCountLevel="eventCountLevel"
                    ></alert-sidebar>
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
        <!-- video modal -->
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
        </b-modal>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
import CONSTANTS from '@/constants';
import getAlertEventImageUrl from '@/utils/getAlertEventImageUrl';
import API_CONFIG from '@/api-config';
import AlertSidebar from '@/components/AlertSidebar';
import EventItem from '@/components/EventItem';
import SuspectItem from '@/components/SuspectItem';
import moment from 'moment-timezone';

export default {
    components: {
        AlertSidebar,
        EventItem,
        SuspectItem
    },
    mounted: function() {
        this.$nextTick(async function() {
            this.resetAttendanceData();
            this.getEventTypeList();
            this.getEventCountLevel();
            this.getListZones();
            this.getListProfiles({ type: 'suspect' });
        });
    },
    computed: {
        ...mapState({
            cameras: state => state.camera.items,
            eventCountLevel: state => state.event.eventCountLevel,
            zones: state => state.zone.items,
            types: state => state.event.types,
            listProfiles: state => state.profile.items.slice(0, CONSTANTS.MAX_ATTENDANCE_STRANGER)
        })
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
            modalVideoUrl: null,
            attendanceStatus: []
        };
    },
    methods: {
        ...mapActions({
            getNewestEventList: 'event/getNewestEventNoCommit',
            resetAttendanceData: 'attendance/resetData',
            getEventTypeList: 'event/getEventTypes',
            getEventCountLevel: 'event/getEventCountLevel',
            getListZones: 'zone/getListZones',
            getListZoneCamera: 'zone/getListZoneCamera',
            getListProfiles: 'profile/getList'
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
            this.fetchDataInterval = setInterval(() => {
                this.fetchEventList();
                this.getEventCountLevel();
            }, CONSTANTS.ATTENDANCE_EVENT_INTERVAL);
            this.isShowLoading = true;
            await this.fetchEventList();
            await this.getEventCountLevel();
            this.isShowLoading = false;
        },
        async fetchEventList() {
            const response = await Promise.all(
                this.selectedCameras.map(camera => {
                    if (camera.id) {
                        return this.getNewestEventList({
                            count: CONSTANTS.MAX_TRAFFIC_EVENT,
                            cameraId: camera.id
                        });
                    } else {
                        return [];
                    }
                })
            );
            this.events = _.sortBy(_.flatten(response), 'createdAt', 'asc')
                .reverse()
                .slice(0, CONSTANTS.MAX_TRAFFIC_EVENT);

            this.attendanceStatus = await Promise.all(
                this.events.slice(0, 4).map(async event => {
                    const time = moment(event.createdAt);
                    return {
                        name: `${time.format(
                            'HH:mm:ss DD/MM/YYYY'
                        )} tại ${await this.getZoneNameFromCameraId(
                            event.cameraId
                        )} có ${this.getEventName(event.type)} trên ${this.getCameraName(
                            event.cameraId
                        )}`,
                        level: event.level
                    };
                })
            );
        },
        getCameraName(id) {
            const camera = this.cameras.find(el => el.id === id);
            if (camera) return camera.name;
        },
        async getZoneNameFromCameraId(cameraId) {
            const list = await this.getListZoneCamera({ cameraId });
            if (list.length === 0) return '';
            const name = this.zones.find(zone => zone.id === list[0].zoneId).name;
            return name || '';
        },
        getEventName(type) {
            const name = this.types.find(item => item.value === type).descVN;
            return name || '';
        },
        changeEventVideo(event) {
            this.selectedEvent = event;
            this.eventVideoSrc = `${this.BASE_URL}event-image/${event.id}/video.mp4`;
            this.novideo = `${API_CONFIG.BASE_URL}event-image/${event.id}/snapshot.jpg`;
        },
        openVideoModal(modalVideoUrl) {
            this.modalVideoUrl = modalVideoUrl;
            this.$refs.videoModal.show();
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
.traffic-object {
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    position: relative;
    min-width: 55px;
    max-width: 20%;
}
</style>

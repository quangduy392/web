<template>
    <div class="animated fadeIn h-100">
        <sub-header hideBreadcrumb>
            <template slot="sub-header-left">
                <b-navbar-nav class="d-flex flex-row">
                    <b-nav-item to="/vehicle-count/event/newest">
                        {{ $t('alert.event') }}
                    </b-nav-item>
                    <b-nav-item to="/vehicle-count/event/bookmark">
                        {{ $t('alert.bookmark') }}
                    </b-nav-item>
                </b-navbar-nav>
            </template>
            <template slot="sub-header-middle"></template>
            <template slot="sub-header-right">
                <div class="d-flex align-items-center">
                    <div class="input-group border-bottom position-relative">
                        <input
                            type="text"
                            class="form-control bg-transparent border-none text-white pr-4"
                            :placeholder="$t('common.search')"
                            aria-label="Search"
                            aria-describedby="button-addon2"
                            v-model="searchKeyword"
                            @keyup="doSearch"
                            style="min-width: 190px;"
                        />
                        <i
                            class="fa fa-search position-absolute"
                            aria-hidden="true"
                            style="top: 50%;right: 4px;margin-top: -6px;"
                        ></i>
                    </div>
                    <div class="text-white mx-3 font-20">|</div>
                    <div class="d-flex align-items-center text-nowrap mr-2">
                        <span class="text-success">
                            {{ $t('alert.selected', { number: selectedEventList.length }) }}
                        </span>
                    </div>
                    <div class="d-flex align-items-center text-nowrap">
                        <b-button
                            class="mr-2"
                            variant="outline-primary"
                            v-b-modal.modal-review
                            @click="onReviewEvents"
                            :disabled="selectedEventList.length === 0"
                        >
                            <i class="fa fa-wrench mr-2"></i>
                            <span>{{ $t('alert.review') }}</span>
                        </b-button>

                        <b-button
                            class="mr-2"
                            variant="outline-primary"
                            @click="bookmarkEvents"
                            :disabled="selectedEventList.length === 0"
                        >
                            <i class="fa fa-star-o mr-2"></i>
                            <span>{{ $t('alert.bookmark') }}</span>
                        </b-button>

                        <!-- <b-button
                            variant="outline-primary"
                            v-b-modal.modal-create-event
                            @click="onOpenCreateEventModal"
                        >
                            <i class="fa fa-plus mr-2"></i>
                            <span>{{ $t('alert.createEvent') }}</span>
                        </b-button>-->
                    </div>
                </div>
            </template>
        </sub-header>
        <div class="page-content sub-header-page-content pb-2">
            <div class="d-flex h-100">
                <div class="h-100 overflow-hidden flex-1 d-flex flex-column">
                    <div v-if="!isLoading" class="overflow-y-scroll masonry-with-columns flex-1">
                        <b-row class="mx-0 w-100 mt-xl-2">
                            <b-col
                                cols="6"
                                lg="3"
                                xl="2"
                                class="mb-xl-2 px-xl-1 mb-4"
                                v-for="event in events"
                                :key="event.id"
                            >
                                <EventItem
                                    :event="event"
                                    @changeVideo="changeVideo"
                                    @reviewEvent="onReviewEvent"
                                    @bookmarkDeleted="onBookmarkDeleted"
                                />
                            </b-col>
                            <b-col cols="12" class="text-center mt-2 mb-3">
                                <b-button
                                    variant="outline-primary"
                                    @click="loadMore"
                                    v-if="events.length > 0"
                                >
                                    <span>{{ $t('alert.loadMore') }}</span>
                                    <i class="ml-2 fa fa-chevron-down"></i>
                                </b-button>
                                <span v-if="!events.length > 0">{{ $t('alert.eventEmpty') }}</span>
                            </b-col>
                        </b-row>
                    </div>
                    <div
                        v-if="isLoading"
                        class="h-100 d-flex flex-column justify-content-center align-items-center"
                    >
                        <img src="/static/img/loader-green.gif" class="standalone-loading" />
                    </div>
                </div>
                <div class="case-detail_sidebar h-100">
                    <EventFilter :cameras="cameras" :types="types" @filterChange="filterChange" />
                </div>
            </div>
        </div>
        <b-modal
            id="modal-video"
            hide-footer
            hide-header
            centered
            size="xl"
            body-class="p-0 d-flex justify-content-center align-items-center video-modal-border"
        >
            <div
                class="ratio-16-9 position-relative w-100"
                v-show="selectedEvent.type === 'reception'"
            >
                <img :src="videoSrc" class="obsolute-full" />
            </div>
            <video
                controls
                autoplay
                width="100%"
                height="auto"
                v-show="selectedEvent.type !== 'reception'"
                :poster="novideo"
            >
                <source :src="videoSrc" type="video/mp4" />
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

        <!-- review modal -->
        <b-modal
            id="modal-review"
            :title="$t('alert.review')"
            centered
            no-close-on-esc
            no-close-on-backdrop
        >
            <b-form-group label="Số lượng" v-if="selectedEventList.length < 2">
                <b-form-input
                    type="number"
                    v-model="selectedEvent.count"
                    placeholder="Số lượng"
                ></b-form-input>
            </b-form-group>
            <b-form-group :label="$t('alert.note')">
                <b-form-textarea
                    v-model="selectedEvent.reviewNote"
                    :placeholder="$t('alert.note')"
                ></b-form-textarea>
            </b-form-group>

            <b-form-group :label="$t('alert.profile')" v-if="canAssignProfile()">
                <v-select
                    v-model="selectedProfile"
                    :options="listProfiles"
                    label="name"
                    :placeholder="$t('common.select')"
                >
                    <template slot="option" slot-scope="option">
                        <div class="d-flex align-items-center">
                            <div
                                style="width: 50px"
                                class="mr-1 d-inline-block border border-gray-500"
                            >
                                <div
                                    class="case-video-thumbnail ratio-3-4"
                                    :style="{
                                        'background-image': `url(${getAvatar(option.id) ||
                                            '/static/img/avatar-default.jpg'})`
                                    }"
                                />
                            </div>
                            <div class="font-weight-bold">{{ option.name }}</div>
                        </div>
                    </template>

                    <template slot="selected-option" slot-scope="option">
                        <div class="d-flex align-items-center">
                            <div
                                style="width: 50px"
                                class="mr-1 d-inline-block border border-gray-500"
                            >
                                <div
                                    class="case-video-thumbnail ratio-3-4"
                                    :style="{
                                        'background-image': `url(${getAvatar(option.id) ||
                                            '/static/img/avatar-default.jpg'})`
                                    }"
                                />
                            </div>
                            <div class="font-weight-bold">{{ option.name }}</div>
                        </div>
                    </template>
                </v-select>
            </b-form-group>
            <template slot="modal-footer">
                <b-button variant="secondary" @click="onReviewCancel">{{
                    $t('common.cancel')
                }}</b-button>
                <b-button variant="danger" @click="onDeleteEvent">{{
                    $t('common.delete')
                }}</b-button>
                <b-button
                    variant="primary"
                    @click="onReviewOk"
                    v-if="selectedEventList.length < 2"
                    >{{ $t('common.update') }}</b-button
                >
            </template>
        </b-modal>
        <!---->

        <!-- create event modal -->
        <b-modal
            id="modal-create-event"
            :title="$t('alert.createEvent')"
            :ok-title="$t('common.create')"
            :cancel-title="$t('common.cancel')"
            centered
            @ok="onCreateEventOk"
        >
            <b-form-group :label="$t('alert.camera')">
                <v-select
                    v-model="selectedCamera"
                    :options="cameraOptions"
                    label="optionLabel"
                    :placeholder="$t('common.select')"
                    name="camera"
                    v-validate="'required'"
                    :data-vv-as="$t('alert.camera')"
                ></v-select>

                <div v-show="errors.has('camera')" class="validation-message text-danger">
                    {{ errors.first('camera') }}
                </div>
            </b-form-group>

            <b-form-group :label="$t('alert.profile')">
                <v-select
                    v-model="selectedProfile"
                    :options="listProfiles"
                    label="name"
                    :placeholder="$t('common.select')"
                    name="profile"
                    v-validate="'required'"
                    :data-vv-as="$t('alert.profile')"
                >
                    <template slot="option" slot-scope="option">
                        <div class="d-flex align-items-center">
                            <div
                                style="width: 50px"
                                class="mr-1 d-inline-block border border-gray-500"
                            >
                                <div
                                    class="case-video-thumbnail ratio-3-4"
                                    :style="{
                                        'background-image': `url(${getAvatar(option.id) ||
                                            '/static/img/avatar-default.jpg'})`
                                    }"
                                />
                            </div>
                            <div class="font-weight-bold">{{ option.name }}</div>
                        </div>
                    </template>

                    <template slot="selected-option" slot-scope="option">
                        <div class="d-flex align-items-center">
                            <div
                                style="width: 50px"
                                class="mr-1 d-inline-block border border-gray-500"
                            >
                                <div
                                    class="case-video-thumbnail ratio-3-4"
                                    :style="{
                                        'background-image': `url(${getAvatar(option.id) ||
                                            '/static/img/avatar-default.jpg'})`
                                    }"
                                />
                            </div>
                            <div class="font-weight-bold">{{ option.name }}</div>
                        </div>
                    </template>
                </v-select>

                <div v-show="errors.has('profile')" class="validation-message text-danger">
                    {{ errors.first('profile') }}
                </div>
            </b-form-group>

            <b-form-group :label="$t('alert.eventTime')">
                <DateTimePicker
                    v-model="newEvent.createdAt"
                    name="eventTime"
                    v-validate="'required'"
                    :data-vv-as="$t('alert.eventTime')"
                ></DateTimePicker>
                <div v-show="errors.has('eventTime')" class="validation-message text-danger">
                    {{ errors.first('eventTime') }}
                </div>
            </b-form-group>

            <b-form-group :label="$t('alert.note')">
                <b-form-textarea
                    v-model="newEvent.reviewNote"
                    :placeholder="$t('alert.note')"
                ></b-form-textarea>
            </b-form-group>
        </b-modal>
        <!---->

        <b-modal
            id="delete-bookmark-modal"
            :title="$t('common.confirmation')"
            no-close-on-esc
            no-close-on-backdrop
            :ok-title="$t('common.delete')"
            :cancel-title="$t('common.cancel')"
            ok-variant="danger"
            @ok="deleteBookmarkOK"
            >{{ $t('alert.confirmDeleteBookmark') }}</b-modal
        >
    </div>
</template>

<script>
import { mapActions, mapState, mapMutations } from 'vuex';
import EventItem from '@/components/EventItem.vue';
import EventFilter from '@/components/EventFilter';
import moment from 'moment';
import API_CONFIG from '@/api-config';
import getImageProfileUrl from '@/utils/getImageProfileUrl';
import DateTimePicker from '@/components/DateTimePicker';

export default {
    name: 'event',
    components: {
        EventItem,
        EventFilter,
        DateTimePicker
    },
    mounted: function() {
        this.$nextTick(function() {
            this.getNewestEventListReplace({
                count: 120,
                ...this.filter,
                text: this.searchKeyword !== '' ? this.searchKeyword : null
            }).then(() => (this.isLoading = false));
            this.refreshInterval = setInterval(this.refresh, 5000);
            this.getCameraList();
            this.getTypeList();
            this.setSelectedEventlist([]);
            this.getListProfiles({
                type: 'staff'
            });
            this.getImageProfile({
                type: 'staff'
            });
            this.getMonitorList();
        });
    },
    beforeDestroy() {
        clearInterval(this.refreshInterval);
    },
    data: function() {
        return {
            BASE_URL: API_CONFIG.BASE_URL,
            multiple: false,
            filter: {},
            videoSrc: '',
            selectedEvent: {},
            isLoading: true,
            refreshInterval: {},
            searchKeyword: '',
            selectedProfile: null,
            newEvent: {},
            selectedCamera: null,
            novideo: ''
        };
    },
    computed: {
        ...mapState({
            events: state => state.event.events,
            selectedEventList: state => state.event.selectedEventList,
            cameras: state => state.camera.items,
            types: state => state.event.types,
            currentUser: state => state.auth.currentUser,
            listProfiles: state => state.profile.items,
            listAllImages: state => state.profile.listAllImages,
            monitors: state => state.monitor.monitors
        }),
        cameraName() {
            const tmp = {};
            this.cameras.forEach(element => {
                tmp[element.id] = element.name;
            });
            return tmp;
        },
        cameraOptions() {
            return this.monitors.map(monitor => {
                const cameraObj = this.cameras.find(camera => camera.id === monitor.cameraId);
                return {
                    ...monitor,
                    optionLabel: cameraObj ? cameraObj.name : monitor.name
                };
            });
        }
    },
    methods: {
        ...mapActions({
            getCameraList: 'camera/getList',
            getTypeList: 'event/getEventTypes',
            getNewestEventList: 'event/getNewestEventList',
            refreshEventList: 'event/refreshEventList',
            getNewestEventListReplace: 'event/getNewestEventListReplace',
            updateEvent: 'event/updateEvent',
            createEvent: 'event/createEvent',
            getListProfiles: 'profile/getList',
            getImageProfile: 'profile/getImageProfile',
            getMonitorList: 'monitor/getMonitorList',
            deleteEvent: 'event/deleteEvent'
        }),
        getImageProfileUrl,
        ...mapMutations({
            setEventlist: 'event/SET_EVENT_LIST',
            setSelectedEventlist: 'event/SET_SELECTED_EVENT'
        }),

        changeVideo(event) {
            this.selectedEvent = event;
            this.videoSrc = `${API_CONFIG.BASE_URL}event-image/${event.id}/${
                this.selectedEvent.type === 'reception' ? '0.jpg' : 'video.mp4'
            }`;
            this.novideo = `${API_CONFIG.BASE_URL}event-image/${event.id}/snapshot.jpg`;
        },
        loadMore() {
            this.getNewestEventList({
                count: 120,
                lessthan: this.events[this.events.length - 1].id,
                ...this.filter,
                text: this.searchKeyword !== '' ? this.searchKeyword : null
            }).then(rs => {
                if (rs.length === 0) this.$toaster.info(this.$i18n.t('alert.noMoreEvent'));
            });
        },
        refresh() {
            if (this.events[0]) {
                this.refreshEventList({
                    greaterthan: this.events[0].id,
                    ...this.filter,
                    text: this.searchKeyword !== '' ? this.searchKeyword : null
                });
            }
        },
        filterChange(filter) {
            this.filter = { ...filter };
            for (const field in this.filter) {
                if (this.filter[field] === 'all') {
                    this.filter[field] = null;
                }
            }
            this.filter.from =
                this.filter.from && this.filter.from !== ''
                    ? moment(this.filter.from, 'DD/MM/YYYY HH:mm').format('X')
                    : null;
            this.filter.to =
                this.filter.to && this.filter.to !== ''
                    ? moment(this.filter.to, 'DD/MM/YYYY HH:mm').format('X')
                    : null;
            this.isLoading = true;
            this.getNewestEventListReplace({
                count: 120,
                ...this.filter,
                text: this.searchKeyword !== '' ? this.searchKeyword : null
            }).then(() => (this.isLoading = false));
        },
        onReviewEvent(event) {
            this.selectedEvent = { ...event };
            this.selectedProfile = null;
        },
        onReviewEvents(event) {
            this.multiple = true;
            this.selectedEvent.reviewNote = null;
            this.selectedProfile = null;
        },
        onReviewOk(bvModalEvt) {
            if (this.multiple) {
                bvModalEvt.preventDefault();
                Promise.all(
                    this.selectedEventList.map(originalEvent => {
                        // const event = { ...originalEvent };
                        // event.reviewer = this.currentUser.id;
                        // if (
                        //     this.selectedEvent.reviewNote &&
                        //     this.selectedEvent.reviewNote.length > 0
                        // ) {
                        //     event.reviewNote = this.selectedEvent.reviewNote;
                        // }
                        // if (this.canAssignProfile() && this.selectedProfile) {
                        //     event.profileId = this.selectedProfile.id;
                        //     event.text = this.selectedProfile.name;
                        //     event.image = this.getEventImageToSave(this.selectedProfile.id);
                        // }
                        // this.updateEvent(event);
                    })
                ).then(() => {
                    this.$bvModal.hide('modal-review');
                    this.$toaster.success(this.$t('alert.reviewSuccess'));
                    this.multiple = false;
                    this.setSelectedEventlist([]);
                });
            } else {
                bvModalEvt.preventDefault();
                // this.selectedEvent.reviewer = this.currentUser.id;
                this.selectedEvent.text =
                    this.selectedEvent.text.split(': ')[0] + ': ' + this.selectedEvent.count;

                // if (this.canAssignProfile() && this.selectedProfile) {
                //     this.selectedEvent.profileId = this.selectedProfile.id;
                //     this.selectedEvent.text = this.selectedProfile.name;
                //     this.selectedEvent.image = this.getEventImageToSave(this.selectedProfile.id);
                // }
                this.selectedEvent.count = +this.selectedEvent.count;
                this.updateEvent(this.selectedEvent).then(() => {
                    this.$bvModal.hide('modal-review');
                    this.$toaster.success(this.$i18n.t('alert.reviewSuccess'));
                });
            }
        },
        onReviewCancel() {
            this.multiple = false;
            this.$bvModal.hide('modal-review');
        },
        async onDeleteEvent() {
            await this.deleteEvent({ id: this.selectedEvent.id });
            this.$toaster.success(this.$t('alert.deleteEventSuccess'));
            this.$bvModal.hide('modal-review');
        },
        bookmarkEvents() {
            Promise.all(
                this.selectedEventList.map(event => {
                    const tmpEvent = { ...event };
                    tmpEvent.bookmarked = true;
                    this.updateEvent(tmpEvent);
                })
            ).then(() => {
                this.$toaster.success(this.$i18n.t('alert.bookmarkSuccess'));
                this.setSelectedEventlist([]);
            });
        },
        getCameraName(id) {
            const camera = this.cameras.find(el => el.id === id);
            if (camera) return camera.name;
        },
        onBookmarkDeleted(event) {
            this.selectedEvent = event;
            this.$bvModal.show('delete-bookmark-modal');
        },
        deleteBookmarkOK(bvModalEvt) {
            bvModalEvt.preventDefault();
            this.updateEvent(this.selectedEvent).then(() => {
                this.$bvModal.hide('delete-bookmark-modal');
                this.$toaster.success(this.$i18n.t('alert.deleteBookmarkSuccess'));
            });
        },
        doSearch(event) {
            if (event.keyCode === 13) {
                this.getNewestEventListReplace({
                    count: 120,
                    ...this.filter,
                    text: this.searchKeyword !== '' ? this.searchKeyword : null
                }).then(() => (this.isLoading = false));
            }
        },
        canAssignProfile() {
            if (this.multiple) {
                if (
                    this.selectedEventList &&
                    this.selectedEventList.length === 1 &&
                    !this.selectedEventList[0].profileId &&
                    this.selectedEventList[0].type === 'face'
                ) {
                    return true;
                } else {
                    return false;
                }
            } else {
                if (!this.selectedEvent.profileId && this.selectedEvent.type === 'face') {
                    return true;
                } else {
                    return false;
                }
            }
        },
        getAvatar(id) {
            const profileImage = this.listAllImages.find(
                el => el.profileId === id && el.portrait === true
            );
            return profileImage !== undefined
                ? this.getImageProfileUrl(id, profileImage.id) + '?' + profileImage.updatedAt
                : null;
        },
        getEventImageToSave(id) {
            const profileImage = this.listAllImages.find(
                el => el.profileId === id && el.portrait === true
            );

            if (profileImage) {
                return `profile-files/${id}/${profileImage.id}.jpg`;
            }
            return null;
        },
        onOpenCreateEventModal(event) {
            // reset newEvent
            this.newEvent = {
                type: 'face',
                duration: 2,
                reviewer: this.currentUser.id,
                reviewNote: '',
                bookmarked: false
            };
            this.selectedProfile = null;
            this.selectedCamera = null;
        },
        onCreateEventOk(bvModalEvt) {
            bvModalEvt.preventDefault();

            this.$validator.validateAll().then(result => {
                if (result) {
                    if (this.selectedCamera) {
                        this.newEvent.monitorId = this.selectedCamera.id;
                        this.newEvent.cameraId = this.selectedCamera.cameraId;
                    }

                    if (this.selectedProfile) {
                        this.newEvent.profileId = this.selectedProfile.id;
                        this.newEvent.text = this.selectedProfile.name;
                        this.newEvent.image = this.getEventImageToSave(this.selectedProfile.id);
                    }

                    this.createEvent(this.newEvent).then(() => {
                        this.$bvModal.hide('modal-create-event');
                        this.$toaster.success(this.$i18n.t('alert.createEventSuccess'));
                    });
                }
            });
        }
    }
};
</script>
<style lang="scss">
.video-modal-border {
    border: 2px solid;
    border-color: silver;
}
.event-text-color {
    color: lime;
    background-color: rgba(0, 0, 0, 0.6);
}
</style>

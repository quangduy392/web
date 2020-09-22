<template>
    <div class="animated fadeIn h-100">
        <sub-header hideBreadcrumb>
            <template slot="sub-header-left">
                <b-navbar-nav class="d-flex flex-row">
                    <b-nav-item to="/attendance/event/newest">
                        {{ $t('attendanceCommon.event.newest') }}
                    </b-nav-item>
                    <b-nav-item to="/attendance/event/bookmark">
                        {{ $t('attendanceCommon.event.bookmark') }}
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
                            variant="outline-primary"
                            @click="openDeleteBookmarkEvents"
                            :disabled="selectedEventList.length === 0"
                        >
                            <i class="fa fa-star-o mr-2"></i>
                            <span>{{ $t('alert.deleteBookmark') }}</span>
                        </b-button>
                    </div>
                </div>
            </template>
        </sub-header>
        <div class="page-content sub-header-page-content">
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
            size="lg"
            body-class="p-0 d-flex justify-content-center align-items-center video-modal-border"
        >
            <video controls autoplay width="100%" height="auto" ref="video" :poster="novideo">
                <source :src="videoSrc" type="video/mp4" />
            </video>
            <div style="position: absolute; top: 9px; left:15px;" class="event-text-color">
                <div>{{ cameraName[selectedEvent.cameraId] }}</div>
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
                :src="BASE_URL + selectedEvent.image"
            />
        </b-modal>

        <!-- review modal -->
        <b-modal
            id="modal-review"
            :title="$t('alert.review')"
            :ok-title="$t('common.update')"
            :cancel-title="$t('common.cancel')"
            centered
            @ok="onReviewOk"
        >
            <b-form-group :label="$t('alert.note')">
                <b-form-textarea
                    v-model="selectedEvent.reviewNote"
                    :placeholder="$t('alert.note')"
                ></b-form-textarea>
            </b-form-group>
        </b-modal>
        <!---->

        <!-- delete -->
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

export default {
    components: {
        EventItem,
        EventFilter
    },
    mounted: function() {
        this.$nextTick(function() {
            this.getNewestEventListReplace({
                bookmarked: true,
                count: 120,
                ...this.filter,
                text: this.searchKeyword !== '' ? this.searchKeyword : null
            }).then(() => (this.isLoading = false));
            this.refreshInterval = setInterval(this.refresh, 5000);
            this.getList();
            this.getTypeList();
            this.setSelectedEventlist([]);
        });
    },
    beforeDestroy() {
        clearInterval(this.refreshInterval);
    },
    data: function() {
        return {
            BASE_URL: API_CONFIG.BASE_URL,
            filter: {},
            videoSrc: '',
            novideo: '',
            selectedEvent: {},
            isLoading: true,
            refreshInterval: {},
            multiple: false,
            searchKeyword: ''
        };
    },
    computed: {
        ...mapState({
            events: state => state.event.events,
            selectedEventList: state => state.event.selectedEventList,
            cameras: state => state.camera.items,
            types: state => state.event.types,
            currentUser: state => state.auth.currentUser
        }),
        cameraName() {
            const tmp = {};
            this.cameras.forEach(element => {
                tmp[element.id] = element.name;
            });
            return tmp;
        }
    },
    methods: {
        ...mapActions({
            getList: 'camera/getList',
            getTypeList: 'event/getEventTypes',
            getNewestEventList: 'event/getNewestEventList',
            refreshEventList: 'event/refreshEventList',
            getNewestEventListReplace: 'event/getNewestEventListReplace',
            updateEvent: 'event/updateEvent',
            deleteBookmarkEvent: 'event/deleteBookmarkEvent'
        }),
        ...mapMutations({
            setEventlist: 'event/SET_EVENT_LIST',
            setSelectedEventlist: 'event/SET_SELECTED_EVENT'
        }),

        changeVideo(event) {
            this.selectedEvent = event;
            this.videoSrc = `${API_CONFIG.BASE_URL}event-image/${event.id}/video.mp4`;
            this.novideo = `${API_CONFIG.BASE_URL}event-image/${event.id}/snapshot.jpg`;
        },
        loadMore() {
            this.getNewestEventList({
                bookmarked: true,
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
                    bookmarked: true,
                    greaterthan: this.events[0].id,
                    ...this.filter,
                    text: this.searchKeyword !== '' ? this.searchKeyword : null
                });
            }
        },
        filterChange(filter) {
            this.filter = { ...filter };
            for (const field in this.filter) {
                if (this.filter[field] === 'all' || this.filter[field] === '') {
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
                bookmarked: true,
                count: 120,
                ...this.filter,
                text: this.searchKeyword !== '' ? this.searchKeyword : null
            }).then(() => (this.isLoading = false));
        },
        onReviewEvent(event) {
            this.selectedEvent = { ...event };
        },
        onReviewOk(bvModalEvt) {
            if (this.multiple) {
                bvModalEvt.preventDefault();

                Promise.all(
                    this.selectedEventList.map(originalEvent => {
                        const event = { ...originalEvent };
                        event.reviewer = this.currentUser.id;
                        if (
                            this.selectedEvent.reviewNote &&
                            this.selectedEvent.reviewNote.length > 0
                        ) {
                            event.reviewNote = this.selectedEvent.reviewNote;
                        }
                        this.updateEvent(event);
                    })
                ).then(() => {
                    this.$bvModal.hide('modal-review');
                    this.$toaster.success(this.$i18n.t('alert.reviewSuccess'));
                    this.multiple = false;
                    this.setSelectedEventlist([]);
                });
            } else {
                bvModalEvt.preventDefault();
                this.selectedEvent.reviewer = this.currentUser.id;
                this.updateEvent(this.selectedEvent).then(() => {
                    this.$bvModal.hide('modal-review');
                    this.$toaster.success(this.$i18n.t('alert.reviewSuccess'));
                });
            }
        },
        onBookmarkDeleted(event) {
            this.multiple = false;
            this.selectedEvent = event;
            this.$bvModal.show('delete-bookmark-modal');
        },
        openDeleteBookmarkEvents() {
            this.multiple = true;
            this.$bvModal.show('delete-bookmark-modal');
        },
        onReviewEvents(event) {
            this.multiple = true;
            this.selectedEvent.reviewNote = null;
        },
        deleteBookmarkEvents() {
            Promise.all(
                this.selectedEventList.map(event => {
                    event.bookmarked = false;
                    this.updateEvent(event);
                })
            ).then(() => {
                this.$bvModal.hide('delete-bookmark-modal');
                this.$toaster.success(this.$i18n.t('alert.bookmarkSuccess'));
                this.setSelectedEventlist([]);
            });
        },
        deleteBookmarkOK(bvModalEvt) {
            bvModalEvt.preventDefault();
            if (this.multiple) {
                this.deleteBookmarkEvents();
            } else {
                this.deleteBookmarkEvent(this.selectedEvent).then(() => {
                    this.$bvModal.hide('delete-bookmark-modal');
                    this.$toaster.success(this.$i18n.t('alert.deleteBookmarkSuccess'));
                });
            }
        },
        doSearch(event) {
            if (event.keyCode === 13) {
                this.getNewestEventListReplace({
                    bookmarked: true,
                    count: 120,
                    ...this.filter,
                    text: this.searchKeyword !== '' ? this.searchKeyword : null
                }).then(() => (this.isLoading = false));
            }
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
